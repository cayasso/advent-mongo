const createEngine = require('../index')
const should = require('should')

let engine = null
const testEvents = [
  { entity: { id: '1', name: 'test' }, type: 'created', payload: { a: 1 } },
  { entity: { id: '1', name: 'test' }, type: 'updated', payload: { a: 2 } },
  { entity: { id: '1', name: 'test' }, type: 'tested', payload: { a: 3 } },
  { entity: { id: '2', name: 'test' }, type: 'created', payload: { a: 1 } },
  { entity: { id: '3', name: 'test' }, type: 'created', payload: { a: 2 } },
  { entity: { id: '3', name: 'test' }, type: 'created', payload: { a: 3 } }
]

describe('advent-mongodb', function () {

  before(async function () {
    engine = createEngine('localhost/eventstream-test')
  })

  it('should be a function', function () {
    createEngine.should.be.a.Function
  })

  it('should return an object', function () {
    engine.should.be.an.Object
  })

  it('should export the right methods', function () {
    engine.save.should.be.a.Function
    engine.load.should.be.a.Function
  })

  describe('save', function () {

    it('should return a promise', function () {
      engine.save([]).then.should.be.a.Function
    })

    it('should save events', async function () {
      const events = await engine.save(testEvents)
      events.length.should.eql(testEvents.length)
      events.should.eql(testEvents)
    })

    it('should not save events with missing entity ids', async function () {
      const wrongEvents = [
        { type: 'updated', payload: { a: 2 } },
        { type: 'updated', payload: { a: 2 } }
      ]
      const events = await engine.save(wrongEvents)
      events.length.should.eql(0)
      events.should.eql([])
    })

    it('should not save events with missing entity name', async function () {
      const wrongEvents = [
        { type: 'updated', payload: { a: 2 } },
        { type: 'updated', payload: { a: 2 } }
      ]
      const events = await engine.save(wrongEvents)
      events.length.should.eql(0)
      events.should.eql([])
    })
  })

  describe('load', function () {

    it('should return a promise', function () {
      engine.load('1').then.should.be.a.Function
    })

    it('should load events by id', async function () {
      const id = '1'
      const events = await engine.load(id)
      events.length.should.eql(3)
      events.should.eql(testEvents.filter(e => e.entity.id === id))
    })

  })

  after(function (done) {
    engine.db._db.dropDatabase(function () {
      engine.db.close()
      done()
    })
  })

})
