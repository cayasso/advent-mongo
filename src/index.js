'use strict'

const createDatabase = require('./db')

const createEngine = (conn, options = {}) => {
  const { collections = {} } = options
  const db = createDatabase(conn || 'mongodb://localhost:27017/eventstream')
  const eventCol = collections.events || 'events'
  const countCol = collections.counts || 'counts'

  let ready = false

  /**
   * Create initial indexes.
   *
   * @return {Void}
   * @private
   */

  const createIndexes = async () => {
    if (ready) return
    const counts = await db.get(eventCol)
    const events = await db.get(eventCol)

    await events.createIndex({ 'entity.id': 1, version: 1 })
    await events.createIndex({ version: 1 })
    await counts.createIndex({ entity: 1 })
    ready = true
  }

  const coll = async (name) => {
    await createIndexes()
    return db.get(name)
  }

  /**
   * Get sequence number for versioning.
   *
   * @param {String} name
   * @return {Promise}
   * @public
   */

  const seq = async (name) => {
    const counts = await coll(countCol)
    const update = { $inc: { seq: 1 }, $set: { entity: name } }
    return counts.updateOne({ entity: name }, update, { upsert: true })
  }

  /**
   * Load events.
   *
   * @param {String|Number} id
   * @return {Promise}
   * @public
   */

  const load = async (id) => {
    const events = await coll(eventCol)
    return events.findMany({ 'entity.id': id }, { sort: 'version' })
  }

  /**
   * Save events.
   *
   * @param {Array} events
   * @return {Promise}
   * @public
   */

  const save = async (data) => {
    if (!Array.isArray(data) || data.length === 0) {
      return []
    }

    const events = await coll(eventCol)
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

  return { load, save, db }
}

module.exports = createEngine
