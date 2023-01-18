'use strict'

// import external node packages
const sql = require('mssql')
const db = require('../db')

const DB_NAME = 'quickfin'

exports.getEntries = async (user_id, direction) => {
  const request = new sql.Request(await db.get(DB_NAME))
  request.input('user_id', sql.Int, user_id)

  request.input('direction', sql.Bit, direction) // true for debit, false for credit

  const result = await request.query(`EXEC [journal].[usp_getEntries] @user_id, @direction`)

  // always return resultset
  return result.recordset
}

exports.insertEntry = async (user_id, entry) => {
  const request = new sql.Request(await db.get(DB_NAME))
  request.input('user_id', sql.Int, user_id)

  request.input('date', sql.DateTime, entry.date)
  request.input('name', sql.VarChar(40), entry.name)
  request.input('category', sql.VarChar(40), entry.category)
  request.input('amount', sql.Money, entry.amount)

  const result = await request.query(`EXEC [journal].[usp_insertEntry] @user_id, @date, @name, @category, @amount`)

  if (result.rowsAffected.length > 0) {
    return {
      success: result.rowsAffected[0] > 0,
      id: result.recordset.length > 0 ? result.recordset[0].id : undefined
    }
  }
  return null
}

exports.updateEntry = async (user_id, id, entry) => {
  const request = new sql.Request(await db.get(DB_NAME))
  request.input('user_id', sql.Int, user_id)
  request.input('id', sql.Int, id)

  request.input('date', sql.DateTime, entry.date)
  request.input('name', sql.VarChar(40), entry.name)
  request.input('category', sql.VarChar(40), entry.category)
  request.input('amount', sql.Money, entry.amount)

  const result = await request.query(`EXEC [journal].[usp_updateEntry] @user_id, @id, @date, @name, @category, @amount`)

  if (result.rowsAffected.length > 0) {
    return {
      success: result.rowsAffected[0] > 0
    }
  }
  return null
}

exports.deleteEntry = async (user_id, id) => {
  const request = new sql.Request(await db.get(DB_NAME))
  request.input('user_id', sql.Int, user_id)
  request.input('id', sql.Int, id)

  const result = await request.query(`EXEC [journal].[usp_deleteEntry] @user_id, @id`)

  if (result.rowsAffected.length > 0) {
    return {
      success: result.rowsAffected[0] > 0
    }
  }
  return null
}