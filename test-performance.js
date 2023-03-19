import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { describe, it, before, after } from 'node:test'
import { generate } from './generation.js'

const TEST_SIZE = 10_000

describe('test-performance', {concurrency: false}, async () => {

  /** @type {string} */ let dir

  before(async () =>{
    dir = await fs.mkdtemp('.tmp-data-')
  })

  after(async () =>{
    await fs.rm(dir, { recursive: true })
  })

  // run the performance tests using using different allocation sizes
  for(let allocSize=1; allocSize <= TEST_SIZE; allocSize *= 10) {  
    it(`generates ${TEST_SIZE} values using allocSize = ${allocSize}` , async () => {
      const filePath = path.join(dir, `sequence-${allocSize}`)
      const generator = generate(filePath, allocSize)

      for(let i=0; i < TEST_SIZE; i++) {
        const {value} = await generator.next()
        assert.match(value, /[A-Z0-9]{7}/u)
      }
    })
  }

})
