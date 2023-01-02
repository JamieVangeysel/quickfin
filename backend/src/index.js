'use strict'

const Fastify = require('./fastify')
const authHandler = require('./auth.handler')
const config = require('./config')
const { routes } = require('./routes')

/** Main loop */
const main = async () => {
  const fastify = new Fastify(config.wrapper)
  fastify.addAuthPreHandler(authHandler, 'token')
  fastify.routeMultiple(routes, false)
  await fastify.start()
}

main()