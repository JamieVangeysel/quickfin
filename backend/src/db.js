'use strict'

// import external node packages
const sql = require('mssql')

// local import
const config = require('./config')

// Local variables
const pools = new Map()

module.exports = {
  /**
    * Get or create a pool. If a pool doesn't exist the config must be provided.
    * If the pool does exist the config is ignored (even if it was different to the one provided
    * when creating the pool)
    * @param {string} name
    * @return {Promise<sql.ConnectionPool>}
    */
  get: async (poolName) => {
    if (!pools.has(poolName)) {
      if (!config.mssql[poolName]) {
        throw new Error(`Configuration for pool '${poolName}' does not exist!`)
      }

      const pool = new sql.ConnectionPool(config.mssql[poolName])
      const close = pool.close.bind(pool)
      pool.close = (...args) => {
        pools.delete(poolName)
        return close(...args)
      }
      pools.set(poolName, await pool.connect())
    }
    return pools.get(poolName)
  },
  /**
    * Closes all the pools and removes them from the store
    * @return {Promise<sql.ConnectionPool[]>}
    */
  closeAll: () => Promise.all(Array.from(pools.values()).map((connect) => {
    return connect.then((pool) => pool.close())
  }))
}