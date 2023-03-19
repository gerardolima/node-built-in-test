import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { describe, it, before, after, mock } from 'node:test'
import { generate } from './generation.js'


describe('test-generation', {concurrency: false}, async () => {
  /** @type {string} */ let filePath
  /** @type {string} */ let dir

  before(async () =>{
    dir = await fs.mkdtemp('.tmp-data-')
    filePath = path.join(dir, 'sequence')
  })

  after(async () =>{
    await fs.rm(dir, { recursive: true })
  })

  describe('when sequence file does NOT exist', async () => {
    /** @type {AsyncGenerator<string, never, number>} */  let generator
    
    before(async () =>{
      generator = generate(filePath)
    })

    it('returns the 1st value `0000000`', async () => {
      const {value} = await generator.next()
      assert.equal(value, '0000000')
    })

    it('creates the sequence file', async () => {
      await fs.access(filePath, fs.constants.F_OK)
      assert.ok(true) // this test case fails if fs.access throws an error
    })

    it('returns the 2nd value `0000001`', async () => {
      const {value} = await generator.next()
      assert.equal(value, '0000001')
    })

    it('returns the 3nd value `0000002`', async () => {
      const {value} = await generator.next()
      assert.equal(value, '0000002')
    })
    
  })

  describe('when sequence file already EXIST', async () => {
    /** @type {AsyncGenerator<string, never, number>} */  let generator
    
    before(async () =>{
      generator = generate(filePath)
    })

    it('continues sequence from the previous count', async () => {
      const {value} = await generator.next()
      assert.equal(value, '0000003')
    })

    it('does NOT access disk until consuming all pre-allocates IDs', async () => {
      const writeFileMock = mock.method(fs, 'writeFile')

      // on executing `.next(3)` will pre-allocate 3 extra IDs and persist in disk once
      let res = await generator.next(3)
      assert.strictEqual(res.value, '0000004')

      res = await generator.next()
      assert.strictEqual(res.value, '0000005')

      res = await generator.next()
      assert.strictEqual(res.value, '0000006')

      res = await generator.next()
      assert.strictEqual(res.value, '0000007')

      assert.strictEqual(writeFileMock.mock.callCount(), 1)
    })
    
  })

})
