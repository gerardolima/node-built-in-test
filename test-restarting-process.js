import assert from 'node:assert/strict'
import { describe, it, before, after } from 'node:test'
import { execFile } from 'node:child_process'

/**
 * Starts a new process running the http server
 * @returns {ChildProcess}
 */
const startServer = () => new Promise((resolve, reject) => {
  const childProcess = execFile('node', ['./index.js'], (error) => {
    if (error) { reject(error) }
  })

  childProcess.stdout.on('data', (data) => {
    if (data.toString().startsWith('server running')) {
      resolve(childProcess)
    }
  })
})


describe('test-restarting-process', {concurrency: false}, async () => {
  /** @type {number} */   const num = []
  /** @type {number} */   const pid = []

  describe('running first time', {concurrency: false}, async () => {
    /** @type {ChildProcess} */ let server

    before(async () => {
      server = await startServer()
      console.log(`child-server running on process ${server.pid}`)
      pid.push(server.pid)
    })

    after(async () => {
      server.kill()
    })

    it('gets the next ID from server', async () => {
      const res = await fetch('http://localhost:3000/sequence')
      const id = await res.json()
      console.log(`ID returned was ${id}`)
      num.push(parseInt(id, 16))
    })
  })

  describe('running second time', {concurrency: false}, async () => {
    /** @type {ChildProcess} */ let server

    before(async () => {
      server = await startServer()
      console.log(`child-server running on process ${server.pid}`)
      pid.push(server.pid)
    })

    after(async () => {
      server.kill()
    })

    it('gets the next ID from server', async () => {
      const res = await fetch('http://localhost:3000/sequence')
      const id = await res.json()
      console.log(`ID returned was ${id}`)
      num.push(parseInt(id, 16))
    })
  })

  describe('assessing...', {concurrency: false}, async () => {
    it('returned IDs from different processes', async () => {
      assert.notEqual(pid[0], pid[1])
    })

    it('the second ID returned is "greater" than the first', async () => {
      assert.ok(pid[0] < pid[1], )
    })
  })
})
