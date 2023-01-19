'use strict'

const fastify = require('fastify')

const maxRequestId = 3656158440062975n
let requestId = 0
const hostname = require('os').hostname()

function generateRequestId() {
  // Check if the request id has exceeded the max, exit process otherwise
  if (requestId >= maxRequestId) {
    this.server.log.error({ requestId }, 'Fastify server reached maxRequestId kill this instance!')
    process.exit(13)
  }

  return hostname + ('0000000000' + (++requestId).toString(36)).slice(-10)
}

/**
 * Add default onRequest/onResponse/onSend hooks to fastify instance
 * Add /healthcheck route for docker heathcheck test
 * @param {fastify.FastifyInstance} fastify
 */
function addDefaultRequestHooks(fastify) {
  fastify.addHook('preHandler', require('./hooks/pre-handler.hook'))
  fastify.addHook('onSend', require('./hooks/on-send.hook'))

  fastify.route({ method: 'GET', url: '/healthcheck', handler: () => '' })
}

/**
 * Fastify wrapper class with basic setup and ease of use features
 *
 * @export
 * @class Fastify
 */
module.exports = class Fastify {
  /** @type {Function} */
  authPreHandler

  config
  /** @type {fastify.FastifyInstance} */
  server
  /** @type {string} */
  serviceName

  /**
   * Creates a new instance of Fastify with the given configuration
   * @param {any} config
   */
  constructor(config) {
    this.config = config
    this.serviceName = config.serviceName

    const fastifyConfig = config.fastify
    if (fastifyConfig) {
      fastifyConfig.trustProxy = fastifyConfig.trustProxy || true,
        fastifyConfig.disableRequestLogging = fastifyConfig.disableRequestLogging || true

      if (fastifyConfig.logger == null) {
        // Default to logging true (stdout)
        fastifyConfig.logger = true
      } else if (fastifyConfig.logger !== true && config.elastic) {
        // If elastic is configured, use pine with pine-elasticsearch
        fastifyConfig.logger = setupLogging(
          config.elastic, fastifyConfig.logger, config.serviceName
        )
      }
    } else {
      throw new Error('No fastify configuration is specified, if desired set fastify to {}')
    }

    fastifyConfig.genReqId = generateRequestId

    this.server = fastify(fastifyConfig)

    addDefaultRequestHooks(this.server)

    if (config.cors != null) {
      this.addCors(config.cors)
    }

    if (!process.env.APP_VERSION) {
      process.env.APP_VERSION = 'test'
    }
  }

  /**
   * Add cors with configuration
   * @param {Object} config
   */
  addCors(config) {
    this.server.register(require('@fastify/cors'), config || {})
  }

  /**
   * Set authPreHandler function to be used for authentication
   * To decorate fastify request supply with optional `decorateVariables`
   * @param {Function} handler
   * @param {string | string[]} decorateVariables
   */
  addAuthPreHandler(handler, decorateVariables) {
    this.authPreHandler = handler

    this.server.log.debug({ decorateVariables }, 'Adding Auth PreHandler decoration variables')
    if (decorateVariables) {
      if (typeof decorateVariables === 'string') {
        decorateVariables = [decorateVariables]
      }
      decorateVariables.forEach(x => this.server.decorateRequest(x, null))
    }
  }

  /**
   * Register a fastify route
   * @param {Object} route
   * @param {boolean} prepend if true prepend routes with serviceName
   */
  route(route, prepend = true) {
    let url = '/' + process.env.APP_VERSION
    if (prepend === true) {
      // prepend routes with serviceName ie /v3
      url += '/' + this.serviceName
    }
    route.url = url + route.url

    // Add extra check if requiredPermissions is set, Otherwise prehandler has no effect
    // An empty requiredPermissions array / value will only validate if the token is present and not expired
    if (this.authPreHandler && route.requiredPermissions) {
      this.server.log.debug({ requiredPermissions: route.requiredPermissions }, 'Adding Auth PreHandler to route')
      // Check if handler return Promise
      route.preHandler = (request, reply, done) => this.authPreHandler(request, reply, done, route.requiredPermissions)
    }
    this.server.log.debug({ route }, 'Adding route')
    this.server.route(route)
  }

  /**
   * Register multiple fastify routes
   * @param {Array} routes
   * @param {boolean} prepend if true prepend routes with serviceName
   */
  routeMultiple(routes, prepend = true) {
    routes.forEach(x => this.route(x, prepend))
  }

  /**
   * Start the fastify server instance
   */
  async start() {
    try {
      await this.server.listen({ port: this.config.port || 80, host: '::' })
    } catch (error) {
      this.server.log.error({ error }, 'Fastify server died thowing an error')
      process.exit(1)
    }
  }
}