'use strict'

// import external node packages
const sql = require('mssql')
const db = require('../db')

const DB_NAME = 'quickfin'

exports.getOverview = async (user_id) => {
  const request = new sql.Request(await db.get(DB_NAME))
  request.input('user_id', sql.Int, user_id)

  const result = await request.query(`EXEC [budget].[usp_getOverview] @user_id`)

  if (result.recordset.length > 0) {
    return result.recordset[0][0] /* for JSON responses we get an extra array, so we use an extra [0] */
  }
  return null
}

exports.insertIncome = async (user_id, asset) => {
  const request = new sql.Request(await db.get(DB_NAME))
  request.input('user_id', sql.Int, user_id)

  request.input('year', sql.SmallInt, asset.year)
  request.input('name', sql.VarChar(40), asset.name)
  request.input('value', sql.Money, asset.value)

  const result = await request.query(`EXEC [budget].[usp_insertIncome] @user_id, @year, @name, @value`)

  if (result.rowsAffected.length > 0) {
    return {
      success: result.rowsAffected[0] > 0,
      id: result.recordset.length > 0 ? result.recordset[0].id : undefined
    }
  }
  return null
}

exports.updateIncome = async (user_id, id, asset) => {
  const request = new sql.Request(await db.get(DB_NAME))
  request.input('user_id', sql.Int, user_id)
  request.input('id', sql.Int, id)

  request.input('year', sql.SmallInt, asset.year)
  request.input('name', sql.VarChar(40), asset.name)
  request.input('value', sql.Money, asset.value)

  const result = await request.query(`EXEC [budget].[usp_updateIncome] @user_id, @id, @year, @name, @value`)

  if (result.rowsAffected.length > 0) {
    return {
      success: result.rowsAffected[0] > 0
    }
  }
  return null
}

exports.deleteIncome = async (user_id, id) => {
  const request = new sql.Request(await db.get(DB_NAME))
  request.input('user_id', sql.Int, user_id)
  request.input('id', sql.Int, id)

  const result = await request.query(`EXEC [budget].[usp_deleteIncome] @user_id, @id`)

  if (result.rowsAffected.length > 0) {
    return {
      success: result.rowsAffected[0] > 0
    }
  }
  return null
}

exports.insertExpense = async (user_id, asset) => {
  const request = new sql.Request(await db.get(DB_NAME))
  request.input('user_id', sql.Int, user_id)

  request.input('year', sql.SmallInt, asset.year)
  request.input('name', sql.VarChar(40), asset.name)
  request.input('value', sql.Money, asset.value)

  const result = await request.query(`EXEC [budget].[usp_insertExpense] @user_id, @year, @name, @value`)

  if (result.rowsAffected.length > 0) {
    return {
      success: result.rowsAffected[0] > 0,
      id: result.recordset.length > 0 ? result.recordset[0].id : undefined
    }
  }
  return null
}

exports.updateExpense = async (user_id, id, asset) => {
  const request = new sql.Request(await db.get(DB_NAME))
  request.input('user_id', sql.Int, user_id)
  request.input('id', sql.Int, id)

  request.input('year', sql.SmallInt, asset.year)
  request.input('name', sql.VarChar(40), asset.name)
  request.input('value', sql.Money, asset.value)

  const result = await request.query(`EXEC [budget].[usp_updateExpense] @user_id, @id, @year, @name, @value`)

  if (result.rowsAffected.length > 0) {
    return {
      success: result.rowsAffected[0] > 0
    }
  }
  return null
}

exports.deleteExpense = async (user_id, id) => {
  const request = new sql.Request(await db.get(DB_NAME))
  request.input('user_id', sql.Int, user_id)
  request.input('id', sql.Int, id)

  const result = await request.query(`EXEC [budget].[usp_deleteExpense] @user_id, @id`)

  if (result.rowsAffected.length > 0) {
    return {
      success: result.rowsAffected[0] > 0
    }
  }
  return null
}