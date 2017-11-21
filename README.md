# advent-mongo

[![Build Status](https://travis-ci.org/cayasso/advent-mongo.png?branch=master)](https://travis-ci.org/cayasso/advent-mongo)
[![NPM version](https://badge.fury.io/js/advent-mongo.png)](http://badge.fury.io/js/advent-mongo)

A simple MongoDB engine for [advent](https://github.com/cayasso/advent)
## Installation

```bash
$ npm install advent-mongo
```

## Usage
Pass as third parameter in options objects when creating an advent store.

```js
const createEngine = require('advent-mongo')
const { createStore } = require('advent')
const eventsReducer = require('./events')
const commandsReducer = require('./commands')

const engine = createEngine('mongodb://localhost/eventstream-test')
const store = createStore(comandsReducer, eventsReducer, { engine })
// All calls to store(..) will be saved or events will be loaded by our engine
```
## Run tests
Ensure mongodb is running.

```bash
$ npm run test
```
