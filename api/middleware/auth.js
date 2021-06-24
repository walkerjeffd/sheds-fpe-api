const createError = require('http-errors')

function attachUser (req, res, next) {
  if (!req.apiGateway.event.requestContext.authorizer) {
    return next(createError(401, 'Unauthorized'))
  }
  const claims = req.apiGateway.event.requestContext.authorizer.claims
  const groups = claims['cognito:groups'] ? claims['cognito:groups'].split(',') : []
  const isAdmin = groups.includes('admins')
  res.locals.user = {
    id: claims.sub,
    isAdmin,
    claims
  }
  next()
}

function requireAdmin (req, res, next) {
  if (!res.locals.user || !res.locals.user.isAdmin) {
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
  if (!res.locals.user) {
    return next(createError(401, 'Unauthorized'))
  }

  // local override
  if (res.locals.user.isLocal) {
    return next()
  }

  // user is not owner
  if (res.locals.station.user_id !== res.locals.user.id && !res.locals.user.isAdmin) {
    return next(createError(401, 'Unauthorized'))
  }

  next()
}

module.exports = {
  attachUser,
  requireAdmin,
  requireStationOwnerOrAdmin
}
