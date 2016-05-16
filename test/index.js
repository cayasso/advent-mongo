import mongojs from 'mongojs'
import createEngine from '../src/index'

let db = null
let engine = null
let testEvents = [
  { id: 1, type: 'created', payload: { a: 1 } },
  { id: 1, type: 'updated', payload: { a: 2 } },
  { id: 1, type: 'tested', payload: { a: 3 } },
  { id: 2, type: 'created', payload: { a: 1 } },
  { id: 3, type: 'created', payload: { a: 2 } },
  { id: 3, type: 'created', payload: { a: 3 } }
]

describe('advent-memory', () => {

  before(() => {
    db = mongojs('eventstream-test')
    engine = createEngine(db)
  })

  it('should be a function', () => {
    createEngine.should.be.a.Function
  })

  it('should return an object', () => {
    engine.should.be.an.Object
  })

  it('should export the right methods', () => {
    engine.save.should.be.a.Function
    engine.load.should.be.a.Function
  })

  describe('save', () => {

    it('should return a promise', () => {
      engine.save([]).then.should.be.a.Function
    })

    it('should save events', (done) => {
      engine.save(testEvents).then(events => {
        events.length.should.eql(testEvents.length)
        events.should.eql(testEvents)
        done()
      }).catch(done)
    })

    it('should not save events with missing ids', (done) => {
      let wrongEvents = [
        { type: 'updated', payload: { a: 2 } },
        { type: 'updated', payload: { a: 2 } }
      ]
      engine.save(wrongEvents).then(events => {
        events.length.should.eql(0)
        events.should.eql([])
        done()
      }).catch(done)
    })
  })

  describe('load', () => {

    it('should return a promise', () => {
      engine.load([]).then.should.be.a.Function
    })

    it('should load events by id', (done) => {
      engine.load(1).then(events => {
        let id = 1
        events.length.should.eql(3)
        events.should.eql(testEvents.filter(e => e.id === id))
        done()
      }).catch(done)
    })

  })

  after((done) => {
    db.dropDatabase(done)
  })

})
