const should = require('should')
const createEngine = require('../src')

let engine = null
const testEvents = [
  { entity: { id: '1', name: 'test' }, type: 'created', payload: { a: 1 } },
  { entity: { id: '1', name: 'test' }, type: 'updated', payload: { a: 2 } },
  { entity: { id: '1', name: 'test' }, type: 'tested', payload: { a: 3 } },
  { entity: { id: '2', name: 'test' }, type: 'created', payload: { a: 1 } },
  { entity: { id: '3', name: 'test' }, type: 'created', payload: { a: 2 } },
  { entity: { id: '3', name: 'test' }, type: 'created', payload: { a: 3 } }
]

const dbName = 'eventstream-test'
describe('advent-mongodb', () => {

  before(async () => {
    engine = createEngine(`mongodb://localhost:27017/${dbName}`)
  })

  it('should be a function', () => {
    should(createEngine).be.a.Function()
  })

  it('should return an object', () => {
    should(engine).be.an.Object()
  })

  it('should export the right methods', () => {
    should(engine.save).be.a.Function()
    should(engine.load).be.a.Function()
  })

  describe('save', () => {

    it('should return a promise', () => {
      should(engine.save([]).then).be.a.Function()
    })

    it('should save events', async () => {
      const events = await engine.save(testEvents)
      should(events.length).eql(testEvents.length)
      should(events).eql(testEvents)
    })

    it('should not save events with missing entity ids', async () => {
      const wrongEvents = [
        { type: 'updated', payload: { a: 2 } },
        { type: 'updated', payload: { a: 2 } }
      ]
      const events = await engine.save(wrongEvents)
      should(events.length).eql(0)
      should(events).eql([])
    })

    it('should not save events with missing entity name', async () => {
      const wrongEvents = [
        { type: 'updated', payload: { a: 2 } },
        { type: 'updated', payload: { a: 2 } }
      ]
      const events = await engine.save(wrongEvents)
      should(events.length).eql(0)
      should(events).eql([])
    })
  })

  describe('load', () => {

    it('should return a promise', () => {
      should(engine.load('1').then).be.a.Function()
    })

    it('should load events by id', async () => {
      const id = '1'
      const events = await engine.load(id)
      should(events.length).eql(3)
      should(events).eql(testEvents.filter(e => e.entity.id === id))
    })

  })

  after(async () => {
    await engine.db.dropDatabase(dbName)
    await engine.db.close()
  })

})
