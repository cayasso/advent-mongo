'use strict'

const createDatabase = require('./db')

const createEngine = (conn, options = {}) => {
  const { collections = {} } = options
  const db = createDatabase(conn || 'mongodb://localhost:27017/eventstream')
  const eventCol = collections.events || 'events'
  const countCol = collections.counts || 'counts'

  const createIndexes = async () => {
    const counts = await db.get(eventCol)
    const events = await db.get(eventCol)

    events.createIndex({ 'entity.id': 1, version: 1 })
    events.createIndex({ version: 1 })
    counts.createIndex({ entity: 1 })
  }

  /**
   * Get sequence number for versioning.
   *
   * @param {String} name
   * @return {Promise}
   * @api public
   */

  const seq = async (name) => {
    const counts = await db.get(countCol)
    const update = { $inc: { seq: 1 }, $set: { entity: name } }
    return counts.updateOne({ entity: name }, update, { upsert: true })
  }

  /**
   * Load events.
   *
   * @param {String|Number} id
   * @return {Promise}
   * @api public
   */

  const load = async (id) => {
    const events = await db.get(eventCol)
    return events.findMany({ 'entity.id': id }, { sort: 'version' })
  }

  /**
   * Save events.
   *
   * @param {Array} events
   * @return {Promise}
   * @api public
   */

  const save = async (data) => {
    if (!Array.isArray(data) || data.length === 0) {
      return []
    }

    const events = await db.get(eventCol)
    const _events = []

    for (const event of data) {
      const { entity } = event
      if (entity && entity.name && entity.id) {
        const { seq: version } = await seq(entity.name)
        _events.push(Object.assign(event, { version }))
      }
    }

    if (_events.length === 0) return []

    return events.insertMany(_events)
  }

  createIndexes()

  return { load, save, db }
}

module.exports = createEngine
