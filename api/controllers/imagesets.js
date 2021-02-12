const createError = require('http-errors')
const { v4: uuidv4 } = require('uuid')

const { s3, lambda, batch, createPresignedPostPromise } = require('../aws')
const { Station, Imageset, Camera } = require('../db/models')

const attachImageset = async (req, res, next) => {
  const row = await Imageset.query().findById(req.params.imagesetId).withGraphFetched('images').modifyGraph('images', builder => {
    builder.orderBy('filename')
  })
  if (!row) throw createError(404, `Imageset (id = ${req.params.imagesetId}) not found`)
  res.locals.imageset = row
  return next()
}

const getImagesets = async (req, res, next) => {
  const rows = await Imageset.query().where({ station_id: res.locals.station.id })
  return res.status(200).json(rows)
}

const getImageset = async (req, res, next) => {
  return res.status(200).json(res.locals.imageset)
}

const postImagesets = async (req, res, next) => {
  if (!req.body.camera_id) throw createError(400, 'Camera not specified (missing camera_id field)')
  const camera = await Camera.query().findById(req.body.camera_id)
  if (!camera) throw createError(400, `Camera must be assigned to this Imageset (camera_id=${req.body.camera_id})`)

  const props = {
    ...req.body,
    status: 'CREATED',
    uuid: uuidv4()
  }

  const presignedUrl = await createPresignedPostPromise({
    Bucket: process.env.FPE_S3_BUCKET,
    Conditions: [
      ['starts-with', '$key', `imagesets/${props.uuid}/images/`]
    ],
    Expires: 3600
  })
  presignedUrl.fields.key = `imagesets/${props.uuid}/images/`

  const rows = await Station.relatedQuery('imagesets')
    .for(res.locals.station.id)
    .insert([props])
    .returning('*')

  const row = rows[0]
  row.presignedUrl = presignedUrl
  return res.status(201).json(row)
}

const putImageset = async (req, res, next) => {
  const row = await Imageset.query()
    .patchAndFetchById(res.locals.imageset.id, req.body)
  return res.status(200).json(row)
}

const deleteImageset = async (req, res, next) => {
  const nrow = await Imageset.query().deleteById(res.locals.imageset.id)
  if (nrow === 0) {
    throw createError(500, `Failed to delete imageset (id = ${res.locals.imageset.id})`)
  }

  res.locals.imageset.images.forEach(image => {
    console.log(`Deleting image (id=${image.id})`)
    let params = {
      Bucket: image.s3.Bucket,
      Key: image.s3.Key
    }
    s3.deleteObject(params)
      .promise()
      .catch((err) => console.log(err))

    if (image.thumb_s3) {
      console.log(`Deleting image thumb (id=${image.id})`)
      params = {
        Bucket: image.thumb_s3.Bucket,
        Key: image.thumb_s3.Key
      }
      s3.deleteObject(params)
        .promise()
        .catch((err) => console.log(err))
    }
  })

  return res.status(204).json()
}

const processImageset = async (req, res, next) => {
  console.log(`process imageset (id=${res.locals.imageset.id})`)

  const response = await batch.submitJob({
    jobName: 'process-imageset',
    jobDefinition: 'fpe-batch-job-definition',
    jobQueue: 'fpe-batch-job-queue',
    containerOverrides: {
      command: [
        'node',
        'process.js',
        'imageset',
        '-i',
        res.locals.imageset.id.toString()
      ]
    }
  }).promise()

  return res.status(200).json(response)
}

module.exports = {
  attachImageset,
  getImagesets,
  getImageset,
  postImagesets,
  putImageset,
  deleteImageset,
  processImageset
}
