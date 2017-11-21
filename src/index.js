'use strict'

const monk = require('monk')

function createEngine(conn, options = {}) {
  const { collections = {} } = options
  const db = monk(conn || 'localhost/eventstream')
  const events = db.get(collections.events || 'events')
  const counters = db.get(collections.counts || 'counts')

  db.on('error', console.error)

  events.createIndex({ 'entity.id': 1, version: 1 })
  events.createIndex({ version: 1 })

  /**
   * Get sequence number for versioning.
   *
   * @param {String} name
   * @return {Promise}
   * @api public
   */

  function seq(name) {
    const query = { entity: name }
    const update = { $inc: { seq: 1 }, $set: { entity: name } }
    return counters.findOneAndUpdate(query, update, { upsert: true })
  }

  /**
   * Load events.
   *
   * @param {String|Number} id
   * @return {Promise}
   * @api public
   */

  function load(id) {
    return events.find({ 'entity.id': id }, { sort: { version: 1 } })
  }

  /**
   * Save events.
   *
   * @param {Array} events
   * @return {Promise}
   * @api public
   */

  async function save(data) {
    if (!Array.isArray(data) || data.length === 0) {
      return []
    }

    const _events = []

    for (const event of data) {
      const { entity } = event
      if (entity && entity.name && entity.id) {
        const { seq: version } = await seq(entity.name)
        _events.push(Object.assign(event, { version }))
      }
    }

    return events.insert(_events)
  }

  return { load, save, db }
}

module.exports = createEngine
