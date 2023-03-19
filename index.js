import Koa from 'koa'
import Router from 'koa-router'
import {generate} from './generation.js'

const port = '3000' ?? process.env['PORT']

const app = new Koa()
const router = new Router()

/** @type {AsyncGenerator<string, never, number>} */
const generator = generate()

router.get('/sequence', async (ctx) => {
  const id = await generator.next()
  ctx.body = JSON.stringify(id.value)
})

router.get('/sequence/:size', async (ctx) => {
  const size = parseInt(ctx.params.size, 10)
  if(isNaN(size)) {
    ctx.status = 400
    return
  }

  const resp = []
  resp.push(await generator.next(size))
  for(let i=0; i<size; i++) {
    const id = await generator.next()
    resp.push(id.value)
  }
  
  ctx.body = JSON.stringify(resp)
})

app.use(async (ctx, next) => {
  ctx.set('Content-Type', 'application/json')
  await next()
})

app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    ctx.status = 500
    ctx.app.emit('error', err, ctx)
  }
})

app.use(router.routes())
app.use(router.allowedMethods())

app.listen(port)
console.log(`server running on ${port}`)
