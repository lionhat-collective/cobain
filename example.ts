import { pipe } from 'https://deno.land/x/rambda@v6.7.0/pipe.js'
import { cobain, app } from './cobain.ts'
import type { CobainMiddleware, CobainRequestHandler, CobainAppLocals } from './cobain.ts'

const middleware: CobainMiddleware = (handler) => (ctx) => {
    console.log(`middleware called`)
    if (typeof handler !== 'undefined') {
        console.log(`handler`)
        return handler(ctx)
    }
    ctx.req.respond({ status: 200, body: `MIDDLEWARE` })
}

const fallthroughMiddleware: CobainMiddleware = handler => async ctx => {
    if (handler) {
        console.log(`before:TEST`)
        await handler(ctx)
        console.log(`after:Test`)
    }
}

const allUsers: CobainRequestHandler = (ctx) => {
    console.log(`useriso`)
    ctx.req.respond({ status: 200, body: `hello world` })
}

const f1 = fallthroughMiddleware
const f2 = fallthroughMiddleware

interface DefaultAppCtx extends CobainAppLocals {
    x: string
    y: number
}

const defaultApp = app<DefaultAppCtx>({
    local: {
        x: '',
        y: 0,
    },
    plugins: [],
    decorators: []
})

const app2 = app<DefaultAppCtx>({ decorators: [], plugins: [], local: { x: 'ded', y: 1 } })

const users = defaultApp(route => [
    route('/', pipe(
        f1,
        f2
    )(allUsers)),
    route('/x', app2((route) => [route('/', allUsers)]))
])

const exampleApp = cobain({ port: 3333, hostname: '127.0.0.1' })(
    // route(middleware()),
    // middleware(),
    fallthroughMiddleware(users)
)

exampleApp.start()