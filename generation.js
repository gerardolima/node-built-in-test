import fs from 'node:fs/promises'

/** Decimal presentation of the hex number `FFFFFFF` */
const MAX_VALUE = 268_435_455

/**
 * Returns a generator of IDs.
 * 
 * Each ID is an integer number formatted as zero padded, 7 characters hex
 * string. Each sequence is persisted at the given `filePath`.
 * 
 * When consuming IDs, use `.next(<number>)` to pre-allocate a number of IDs
 * and avoid disk operation on bulk operations.
 * 
 * @param {string} filePath  - this file will be used to persist the sequence
 * @param {number} allocSize - default amount of IDs allocated in each disk operation
 * @returns {AsyncGenerator<string, never, number>}
 */
export async function* generate(filePath = '.sequence', allocSize = 1) {
  allocSize = Math.trunc(allocSize)
  if(allocSize < 0) throw new RangeError(`allocSize must be a positive number: received ${allocSize}`)

  // Read next ID from file. Use 0 when creating a new sequence. The file used
  // for persistence is kept as string to make its inspection easier. In the
  // case a better performance is need, a binary typed buffer can be used.

  // const buf = await fs.readFile(filePath, {encoding: 'utf-8', flags: fs.constants.O_CREAT })
  // let next = parseInt(buf, 10) || 0

  let next = 0
  try {
    const buf = await fs.readFile(filePath, {encoding: 'utf-8', flags: fs.constants.O_CREAT })
    next = parseInt(buf, 10) || 0
  } catch (err) {
    if(err.code !== 'ENOENT') throw err
  }
  

  // Set initial value of watermark to -1, forcing a new allocation whenever a
  // new generator is created. This strategy creates to non-continuous
  // sequences, but ensures that no repeated value is returned.
  let watermark = -1

  // This variable provides a means to pre-allocate IDs when using `.next()`.
  let allocBulk = 0

  while (true) {
    if(next > MAX_VALUE) throw RangeError('overflow')
    if(next + allocBulk > watermark) {
      watermark = next + Math.max(allocSize, allocBulk)
      await fs.writeFile(filePath, watermark.toString(), {
        encoding: 'utf-8',
        flags: fs.constants.O_DIRECT,
      })
    }
    
    // Returns the next ID formatted as a zero padded, 7 characters hex string.
    // `allocBulk` receives the optional parameter passed to `.next(<allocBulk>)`.
    allocBulk = yield next.toString(16).padStart(7, '0').toUpperCase()
    
    allocBulk = parseInt(allocBulk, 10) || 0
    if(allocBulk < 0) throw new TypeError(`allocBulk must be a positive number: received ${allocBulk}`)

    next++
  }
}
