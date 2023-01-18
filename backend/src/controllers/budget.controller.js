'use strict'

// External dependencies
const { JwtPayload } = require('jsonwebtoken')
const { FastifyRequest, FastifyReply } = require('fastify')

const Budget = require('../models/budget.model')

/**
 * Get Overview
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 */
exports.getOverview = async (request, reply) => {
  try {
    /** @type {JwtPayload} */
    const token = request.token

    return Budget.getOverview(token.sub)
  } catch (err) {
    return reply
      .status(500)
      .send(err)
  }
}

/**
 * Create asset
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 */
exports.postIncome = async (request, reply) => {
  try {
    /** @type {JwtPayload} */
    const token = request.token

    return Budget.insertIncome(token.sub, request.body)
  } catch (err) {
    return reply
      .status(500)
      .send(err)
  }
}

/**
 * Update asset
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 */
exports.putIncome = async (request, reply) => {
  try {
    /** @type {JwtPayload} */
    const token = request.token

    const id = +request.params.id

    return Budget.updateIncome(token.sub, id, request.body)
  } catch (err) {
    return reply
      .status(500)
      .send(err)
  }
}

/**
 * Delete asset
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 */
exports.deleteIncome = async (request, reply) => {
  try {
    /** @type {JwtPayload} */
    const token = request.token

    const id = +request.params.id

    return Budget.deleteIncome(token.sub, id)
  } catch (err) {
    return reply
      .status(500)
      .send(err)
  }
}

/**
 * Create expense
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 */
exports.postExpense = async (request, reply) => {
  try {
    /** @type {JwtPayload} */
    const token = request.token

    return Budget.insertExpense(token.sub, request.body)
  } catch (err) {
    return reply
      .status(500)
      .send(err)
  }
}

/**
 * Update expense
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 */
exports.putExpense = async (request, reply) => {
  try {
    /** @type {JwtPayload} */
    const token = request.token

    const id = +request.params.id

    return Budget.updateExpense(token.sub, id, request.body)
  } catch (err) {
    return reply
      .status(500)
      .send(err)
  }
}

/**
 * Delete expense
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 */
exports.deleteExpense = async (request, reply) => {
  try {
    /** @type {JwtPayload} */
    const token = request.token

    const id = +request.params.id

    return Budget.deleteExpense(token.sub, id)
  } catch (err) {
    return reply
      .status(500)
      .send(err)
  }
}