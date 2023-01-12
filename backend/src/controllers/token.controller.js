'use strict'

// import external node packages
const { FastifyRequest, FastifyReply } = require('fastify')
const jwt = require('jsonwebtoken')

const SSO = require('../models/sso.model')
const User = require('../models/user.model')

// GET https://quickfin.be/api/v1/token?grant_type=authorization_code&code=SplxlOBeZQQYbYS6WxSbIA&redirect_uri=https%3A%2F%2Fclient.example.org%2Fcb=
/**
 * Get 
 * @param {FastifyRequest} request 
 * @param {FastifyReply} reply 
 */
exports.get = async (request, reply) => {
  try {
    const grant_type = request.query.grant_type
    const code = request.query.code

    if (grant_type !== 'authorization_code') {
      return reply
        .code(400)
        .send({
          error: `Invalid 'grant_type' specified!`
        })
    }

    if (!code) {
      return reply
        .code(400)
        .send({
          error: `No 'code' supplied!`
        })
    }

    // get AuthorizationCode Details
    const authorization_code = await SSO.getAuthorizationCode(code)

    if (!authorization_code) {
      return reply
        .code(404)
        .send({
          error: `Invalid 'code' specified!`
        })
    }

    if (authorization_code.expires < new Date()) {
      return reply
        .code(403)
        .send({
          error: `'code' has expired!`
        })
    }

    const access_token = await User.getAccessToken(authorization_code)
    const id_token = await User.getIdToken(authorization_code)

    let payload = {
      access_token,
      token_type: 'Bearer',
      expires_in: 900, // 15 minutes
      id_token_jwt: id_token,
      id_token: jwt.decode(id_token)
    }

    if (authorization_code.scope.indexOf('offline_access') !== -1) {
      payload = {
        ...payload,
        refresh_token: await User.getRefreshToken(
          authorization_code.user_id,
          code,
          access_token.split('.')[2]
        )
      }
    }

    return payload
  } catch (err) {
    request.log.error({ error: err, authorizationCode: request.query.code, grantType: request.query.grant_type, redirectUri: request.query.redirect_uri  }, 'Couldn\'t retrieve token, something unexpected happened')
  } finally {
    return reply
      .code(500)
      .send({
        error: `Something unexpected happened!`
      })
  }
}