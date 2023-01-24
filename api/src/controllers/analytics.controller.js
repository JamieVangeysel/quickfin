'use strict'

// External dependencies
const { JwtPayload } = require('jose')
const { FastifyRequest, FastifyReply } = require('fastify')

const Budget = require('../models/budget.model')
const Networth = require('../models/networth.model')
const Journal = require('../models/journal.model')

const Analytics = require('../models/analytics.model')

/**
 * Get analytics dashboard for user
 * This dashboard will have multiple elements in a grid, each of which can be customized by the user
 * List of available datasets by default:
 * - 365 days history of user net worth (inluding last year (user can switch frontend, or view them stacked))
 *   This will also include some base statistics as growth or decline averge and best / worst months
 * - 3 main health indicators
 *   - monthly income vs budget (last 6 months)
 *   - monthly expenses vs budget (last 6 months)
 *   - budget balance vs actual net worth growth / decline
 * - 60 days history of average expensens vs incomes vs (budget incomes & expenses)
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 */
exports.get = async (request, reply) => {
  try {
    /** @type {JwtPayload} */
    const token = request.token

    return Analytics.get(token.sub)
  } catch (err) {
    return reply
      .status(500)
      .send(err)
  }
}