const express = require('express')
const asyncHandler = require('express-async-handler')

const {
  getStations,
  postStations,

  attachStation,
  getStation,
  putStation,
  deleteStation,

  getDatasets,
  postDatasets,

  attachDataset,
  getDataset,
  putDataset,
  deleteDataset,
  processDataset,

  getImagesets,
  postImagesets,

  attachImageset,
  getImageset,
  putImageset,
  deleteImageset,
  processImageset,

  attachImage,
  postImage,
  processImage,

  isOwner
} = require('../controllers/stations')

var router = express.Router()

router.route('/')
  .get(asyncHandler(getStations))
  .post(asyncHandler(postStations))

router.route('/:stationId')
  .all(asyncHandler(attachStation))
  .get(asyncHandler(getStation))
  .put(isOwner, asyncHandler(putStation))
  .delete(isOwner, asyncHandler(deleteStation))

router.route('/:stationId/datasets')
  .all(asyncHandler(attachStation))
  .get(asyncHandler(getDatasets))
  .post(isOwner, asyncHandler(postDatasets))

router.route('/:stationId/datasets/:datasetId')
  .all(asyncHandler(attachStation), asyncHandler(attachDataset))
  .get(asyncHandler(getDataset))
  .put(isOwner, asyncHandler(putDataset))
  .delete(isOwner, asyncHandler(deleteDataset))

router.route('/:stationId/datasets/:datasetId/process')
  .all(asyncHandler(attachStation), asyncHandler(attachDataset))
  .post(isOwner, asyncHandler(processDataset))

router.route('/:stationId/imagesets')
  .all(asyncHandler(attachStation))
  .get(asyncHandler(getImagesets))
  .post(isOwner, asyncHandler(postImagesets))

router.route('/:stationId/imagesets/:imagesetId')
  .all(asyncHandler(attachStation), asyncHandler(attachImageset))
  .get(asyncHandler(getImageset))
  .put(isOwner, asyncHandler(putImageset))
  .delete(isOwner, asyncHandler(deleteImageset))

router.route('/:stationId/imagesets/:imagesetId/process')
  .all(asyncHandler(attachStation), asyncHandler(attachImageset))
  .post(isOwner, asyncHandler(processImageset))

router.route('/:stationId/imagesets/:imagesetId/images')
  .all(asyncHandler(attachStation), asyncHandler(attachImageset))
  .post(isOwner, asyncHandler(postImage))

router.route('/:stationId/imagesets/:imagesetId/images/:imageId/process')
  .all(asyncHandler(attachStation), asyncHandler(attachImage))
  .post(isOwner, asyncHandler(processImage))

module.exports = router
