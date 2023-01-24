'use strict'

const { FastifyRequest, FastifyReply } = require('fastify')
const jose = require('jose')
const config = require('./config')

/**
 *
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 * @param {function} done
 * @param {string[] | string} requiredPermissions
 */
module.exports = async function handle(request, reply, requiredPermissions) {
  // if requiredPermissions is a string create array
  if (typeof requiredPermissions === 'string') {
    requiredPermissions = [requiredPermissions]
  }

  try {
    if (request.headers.authorization) {
      const bearer_token = request.headers.authorization.substring(7)

      if (bearer_token) {
        const protectedHeader = jose.decodeProtectedHeader(bearer_token)
        const JWKS = jose.createRemoteJWKSet(new URL(protectedHeader.jku))

        const { payload } = await jose.jwtVerify(bearer_token, JWKS, {
          issuer: config.key.iss,
          audience: config.key.iss,
        })

        request.token = payload

        if (+payload.sub != NaN) {
          request.log = request.log.child({ userId: +payload.sub })
        }

        return
      }
      return error(request, reply, requiredPermissions, {}, 'Unauthorized', 401)
    }
  } catch (err) {
    console.log(err)
    return error(request, reply, requiredPermissions, {}, 'Unauthorized', 401)
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
function error(request, reply, requiredPermissions, body, message, code = 400) {
  body = {
    requiredPermissions,
    url: request.raw.url,
    ip: request.ip,
    ...body
  }

  request.log.error(message, body)
  return reply
    .code(code)
    .send({
      error: message
    })
}
