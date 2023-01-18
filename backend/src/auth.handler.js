'use strict'

const { FastifyRequest, FastifyReply } = require('fastify')
const jwt = require('jsonwebtoken')

/**
 *
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 * @param {function} done
 * @param {string[] | string} requiredPermissions
 */
module.exports = function handle(request, reply, done, requiredPermissions) {
  // if requiredPermissions is a string create array
  if (typeof requiredPermissions === 'string') {
    requiredPermissions = [requiredPermissions]
  }

  // check if bearer token is set
  /** @type {jwt.JwtPayload} */
  let token

  if (request.headers.authorization) {
    const bearer_token = request.headers.authorization.substring(7)
    token = jwt.decode(bearer_token)

    if (token) {
      // check token audience
      validateAudience(request, reply, done, requiredPermissions, token)

      // check token issuer
      validateIssuer(request, reply, done, requiredPermissions, token)

      // check token expiry
      validateExpiration(request, reply, done, requiredPermissions, token)

      // Check permissions (roles)
      validatPermissions(request, reply, done, requiredPermissions, token)

      request.token = token

      if (+token.sub != NaN) {
        request.log = request.log.child({ userId: +token.sub })
      }

      done()
      return
    }
    error(request, reply, done, requiredPermissions, {}, 'Unauthorized', 401)
    return
  }

  error(request, reply, done, requiredPermissions, {}, 'Unauthorized', 401)
}

function validateAudience(request, reply, done, requiredPermissions, token) {
  if (!token.aud) {
    error(request, reply, done, requiredPermissions, {}, 'Audience is required')
  }

  // - must be a valid audience string (14 characters) or URI
  if (typeof token.aud === 'string') {
    if (!isValidAudience(token.aud)) {
      error(request, reply, done, requiredPermissions, {}, 'Invalid audience provided, must be a valid audience string (14 characters) or URI. Can also use an array of previously mentioned strings.')
    }
  } else {
    // should be an array of strings
    if (!token.aud.every(audience => isValidAudience(audience))) {
      error(request, reply, done, requiredPermissions, {}, 'One or more audiences are invalid, must be a valid audience string (14 characters) or URI. Can also use an array of previously mentioned strings.')
    }
  }

  // - (OPTIONAL) must match environment variable CLIENT_ID
  if ('CLIENT_ID' in process.env) {
    if (typeof token.aud === 'string') {
      if (process.env.CLIENT_ID !== token.aud) {
        error(request, reply, done, requiredPermissions, {}, 'Access denied: Mismatched CLIENT_ID.', 403)
      }
    } else {
      if (!token.aud.some(audience => process.env.CLIENT_ID === audience)) {
        error(request, reply, done, requiredPermissions, {}, 'Access denied: Mismatched CLIENT_ID.', 403)
      }
    }
  } else {
    request.log.warn('No CLIENT_ID environment variable set. Please set environment variable CLIENT_ID!', { url: request.raw.url, ip: request.ip })
  }
}

function isValidAudience(audience) {
  return audience.length === 14 || /^[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*$)/.test(audience)
}

function validateIssuer(request, reply, done, requiredPermissions, token) {
  if (!token.iss) {
    error(request, reply, done, requiredPermissions, {}, 'Issuer is required')
  }

  // - must be a valid issuer string (14 characters) or
  if (!isValidIssuer(token.iss)) {
    error(request, reply, done, requiredPermissions, {}, 'Invalid issuer provided, must be a valid issuer string (14 characters) or URI.')
  }

  // - (OPTIONAL) must match environment variable ISSUER_ID
  if ('ISSUER_ID' in process.env) {
    if (typeof token.iss === 'string') {
      if (process.env.ISSUER_ID !== token.iss) {
        error(request, reply, done, requiredPermissions, {}, 'Access denied: Mismatched ISSUER_ID.', 403)
      }
    }
  } else {
    request.log.warn('No ISSUER_ID environment variable set. Please set environment variable ISSUER_ID!', { url: request.raw.url, ip: request.ip })
  }
}

function isValidIssuer(issuer) {
  return issuer.length === 14 || /^[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*$)/.test(issuer)
}

function validateExpiration(request, reply, done, requiredPermissions, token) {
  if (token.exp <= new Date().getTime() / 1000) {
    error(request, reply, done, requiredPermissions, {}, 'Access denied: token has expired!', 401)
  }
}

function validatPermissions(request, reply, done, requiredPermissions, token) {
  for (let permission of requiredPermissions) {
    if (!validatePermission(token.roles, permission)) {
      error(request, reply, done, requiredPermissions, { permission }, 'Access denied', 403)
    }
  }
}

/**
 *
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 * @param {Function} done
 * @param {String[] | String} requiredPermissions
 * @param {String} body
 * @param {String} message
 * @param {Number} code
 */
function error(request, reply, done, requiredPermissions, body, message, code = 400) {
  body = {
    requiredPermissions,
    url: request.raw.url,
    ip: request.ip,
    ...body
  }

  request.log.error(message, body)
  reply
    .code(code)
    .send({
      error: message
    })
  done()
}

/**
 *
 * @param {string[]} roles
 * @param {string} required
 * @returns {boolean}
 */
function validatePermission(roles, permission) {
  return roles.some((x) => {
    const parts = x.split(':')
    const role = parts[0]
    const scopes = parts[1].split('/')

    const reqParts = permission.split(':')
    const reqPerm = reqParts[0]
    const reqScopes = reqParts[1].split('/')

    // check if role has permissions, ignore _all
    if (permissions[role].some((permission) => permission.split('_')[0] == reqPerm)) {
      // Check scope
      for (let i = 0; i < reqScopes.length; i++) {
        const scope = scopes[i]
        const reqScope = reqScopes[i]

        if (i === 0 && scope === reqScope) {
          continue
        } else if (i > 0 && scope === reqScope && i - 1 !== reqScope.length) {
          continue
        } else if (i > 0 && ((scope === reqScope && i - 1 === reqScope.length) || scope === '*')) {
          return true
        }
        return false
      }
      // fallback to true if requested scope is malformed
      return true
    }
  })
}

// cached version of perms
const permissions = {
  'admin': [
    'read_all',
    'write_all',
    'delete_all',
  ],
  'moderator': [
    'read_all',
    'write_all',
    'delete',
  ],
  'contributor': [
    'read_all',
    'write',
    'delete',
  ],
  'user': [
    'read',
    'write',
  ],
  'guest': [
    'read',
  ]
}