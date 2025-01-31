const createError = require('http-errors')

function attachUser (req, res, next) {
  if (!req.apiGateway || !req.apiGateway.event.requestContext.authorizer) {
    return next(createError(401, 'Unauthorized'))
  }
  const claims = req.apiGateway.event.requestContext.authorizer.claims
  const groups = claims['cognito:groups'] ? claims['cognito:groups'].split(',') : []
  const isAdmin = groups.includes('admins')
  req.auth = {
    id: claims.sub,
    isAdmin,
    claims
  }
  next()
}

function requireAdmin (req, res, next) {
  if (!req.auth || !req.auth.isAdmin) {
    return next(createError(401, 'Unauthorized'))
  }
  next()
}

const requireStationOwnerOrAdmin = (req, res, next) => {
  // no station
  if (!res.locals.station) {
    return next(createError(404, 'Station not found'))
  }

  // no user
  if (!req.auth) {
    return next(createError(401, 'Unauthorized'))
  }

  // local override
  if (req.auth.isLocal) {
    return next()
  }

  // user is not owner
  if (res.locals.station.user_id !== req.auth.id && !req.auth.isAdmin) {
    return next(createError(401, 'Unauthorized'))
  }

  next()
}

const requireStationOwnerCollaboratorOrAdmin = (req, res, next) => {
  // no station
  if (!res.locals.station) {
    return next(createError(404, 'Station not found'))
  }

  // no user
  if (!req.auth) {
    return next(createError(401, 'Unauthorized'))
  }

  // local override
  if (req.auth.isLocal) {
    return next()
  }

  const station = res.locals.station
  const permissions = res.locals.permissions

  const isOwner = station.user_id === req.auth.id
  const isCollaborator = permissions.some(p => p.user_id === req.auth.id)
  const isAdmin = req.auth.isAdmin

  if (isOwner || isCollaborator || isAdmin) {
    return next()
  }

  return next(createError(401, 'Unauthorized'))
}

const requireStationPublicOwnerCollaboratorOrAdmin = (req, res, next) => {
  // no station
  if (!res.locals.station) {
    return next(createError(404, 'Station not found'))
  }

  // public station
  if (!res.locals.station.private) {
    return next()
  }

  // no user
  if (!req.auth) {
    return next(createError(401, 'Unauthorized'))
  }

  // local override
  if (req.auth.isLocal) {
    return next()
  }

  const station = res.locals.station
  const permissions = res.locals.permissions

  const isOwner = station.user_id === req.auth.id
  const isCollaborator = permissions.some(p => p.user_id === req.auth.id)
  const isAdmin = req.auth.isAdmin

  if (isOwner || isCollaborator || isAdmin) {
    return next()
  }

  return next(createError(401, 'Unauthorized'))
}

const requireUserOwnerOrAdmin = (req, res, next) => {
  // no station
  if (!res.locals.user) {
    return next(createError(404, 'User not found'))
  }

  // no user
  if (!req.auth) {
    return next(createError(401, 'Unauthorized'))
  }

  // local override
  if (req.auth.isLocal) {
    return next()
  }

  // user is not owner
  if (res.locals.user.user_id !== req.auth.id && !req.auth.isAdmin) {
    return next(createError(401, 'Unauthorized'))
  }

  next()
}

const requireAnnotationOwnerOrAdmin = (req, res, next) => {
  // no annotation
  if (!res.locals.annotation) {
    return next(createError(404, 'Annotation not found'))
  }

  // no user
  if (!req.auth) {
    return next(createError(401, 'Unauthorized'))
  }

  // local override
  if (req.auth.isLocal) {
    return next()
  }

  // user is not owner
  if (res.locals.annotation.user_id !== req.auth.id && !req.auth.isAdmin) {
    return next(createError(401, 'Unauthorized'))
  }

  next()
}

module.exports = {
  attachUser,
  requireAdmin,
  requireStationOwnerOrAdmin,
  requireStationOwnerCollaboratorOrAdmin,
  requireStationPublicOwnerCollaboratorOrAdmin,
  requireAnnotationOwnerOrAdmin,
  requireUserOwnerOrAdmin
}
