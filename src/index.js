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

  coll.ensureIndex({ id: 1, version: 1 })
  coll.ensureIndex({ version: 1 })

  /**
   * Load events.
   *
   * @param {String|Number} id
   * @param {Function} fn
   * @api public
   */

  function load(id) {
    return new Promise((accept, reject) => {
      coll.find({ id }).sort({ version: 1 }, (err, events) => {
        if (err) reject(err)
        else accept(events)
      })
    })
  }

  /**
   * Save events.
   *
   * @param {Array} events
   * @param {Function} fn
   * @api public
   */

  function save(events) {
    return new Promise((accept, reject) => {
      events = events.filter(e => !!e.id)
      if (!events.length) return accept([])
      coll.insert(events, (err, events) => {
        if (err) reject(err)
        else accept(events)
      })
    })
  }

  return { load, save }
}
