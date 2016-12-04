'use strict'

/**
 * Module dependencies.
 */

import Promise from 'any-promise'
import mongojs from 'mongojs'

export default (conn, options = {}) => {
  const db = mongojs(conn || 'eventstream')
  const coll = db.collection(options.collection || 'events')

  db.on('error', console.error)

  coll.ensureIndex({ entityId: 1, version: 1 })
  coll.ensureIndex({ version: 1 })

  /**
   * Load events.
   *
   * @param {String|Number} id
   * @return {Promise}
   * @api public
   */

  function load(id) {
    return new Promise((accept, reject) => {
      coll.find({ entityId: id }).sort({ version: 1 }, (err, events) => {
        if (err) reject(err)
        else accept(events)
      })
    })
  }

  /**
   * Save events.
   *
   * @param {Array} events
   * @return {Promise}
   * @api public
   */

  function save(events) {
    return new Promise((accept, reject) => {
      events = events.filter(e => !!e.entityId)
      if (!events.length) return accept([])
      coll.insert(events, (err, events) => {
        if (err) reject(err)
        else accept(events)
      })
    })
  }

  return { load, save, db }
}
