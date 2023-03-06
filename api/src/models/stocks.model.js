'use strict'

// import external node packages
const sql = require('mssql')
const db = require('../db')

const DB_NAME = 'quickfin'

exports.getPositions = async (user_id, direction) => {
  const request = new sql.Request(await db.get(DB_NAME))
  request.input('user_id', sql.Int, user_id)

  request.input('direction', sql.Bit, direction) // true for debit, false for credit

  const result = await request.query(`EXEC [stocks].[usp_getPositions] @user_id`)

  // always return resultset
  return result.recordset
}

exports.insertPosition = async (user_id, entry) => {
  const request = new sql.Request(await db.get(DB_NAME))
  request.input('user_id', sql.Int, user_id)

  request.input('date', sql.DateTime, entry.date)
  request.input('ticker', sql.VarChar(40), entry.ticker)
  request.input('amount', sql.Decimal(18,8), entry.amount)
  request.input('value', sql.Money, entry.value)
  request.input('currency', sql.Char(3), entry.currency)
  request.input('note', sql.VarChar(200), entry.note)

  const result = await request.query(`EXEC [stocks].[usp_insertPosition] @user_id, @date, @ticker, @amount, @value, @currency, @note`)

  if (result.rowsAffected.length > 0) {
    return {
      success: result.rowsAffected[0] > 0,
      id: result.recordset.length > 0 ? result.recordset[0].id : undefined
    }
  }
  return null
}

exports.updatePosition = async (user_id, id, entry) => {
  const request = new sql.Request(await db.get(DB_NAME))
  request.input('user_id', sql.Int, user_id)
  request.input('id', sql.Int, id)

  request.input('date', sql.DateTime, entry.date)
  request.input('ticker', sql.VarChar(40), entry.ticker)
  request.input('amount', sql.Decimal(18,8), entry.amount)
  request.input('value', sql.Money, entry.value)
  request.input('currency', sql.Char(3), entry.currency)
  request.input('note', sql.VarChar(200), entry.note)

  const result = await request.query(`EXEC [stocks].[usp_updatePosition] @user_id, @id, @date, @ticker, @amount, @value, @currency, @note`)

  if (result.rowsAffected.length > 0) {
    return {
      success: result.rowsAffected[0] > 0
    }
  }
  return null
}

exports.deletePosition = async (user_id, id) => {
  const request = new sql.Request(await db.get(DB_NAME))
  request.input('user_id', sql.Int, user_id)
  request.input('id', sql.Int, id)

  const result = await request.query(`EXEC [stocks].[usp_deletePosition] @user_id, @id`)

  if (result.rowsAffected.length > 0) {
    return {
      success: result.rowsAffected[0] > 0
    }
  }
  return null
}