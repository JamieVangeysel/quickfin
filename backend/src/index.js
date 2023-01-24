'use strict'

const path = require('path')
const { env } = require('process')

const Fastify = require('./fastify')
const authHandler = require('./auth.handler')
const config = require('./config')
const { routes } = require('./routes')

/** Main loop */
const main = async () => {
  const fastify = new Fastify(config.wrapper)
  fastify.addAuthPreHandler(authHandler, 'token')
  fastify.routeMultiple(routes, false)

  const wk = env.APP_VERSION ? '/' + env.APP_VERSION : ''
  fastify.server.register(
    require('@fastify/static'), {
      root: path.join(__dirname, '.well-known'),
      prefix: wk + '/.well-known/' // optional: default '/'
    }
  )

  await fastify.start()
}

main()

// https://auth0.github.io/node-auth0/AuthenticationClient.html#passwordGrant