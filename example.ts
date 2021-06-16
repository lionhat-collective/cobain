import { slatt, app, route } from './slatt.ts'
import { pipe } from 'https://deno.land/x/rambda@v6.7.0/pipe.js'
import type { SlattMiddleware, SlattRequestHandler } from './slatt.ts'

const middleware: SlattMiddleware = (handler) => (ctx) => {
    console.log(`middleware called`)
    if (typeof handler !== 'undefined') {
        console.log(`handler bb`)
        return handler(ctx)
    }
    ctx.req.respond({ status: 200, body: `MIDDLEWARE` })
}

const fallthroughMiddleware: SlattMiddleware = handler => async ctx => {
    if (handler) {
        console.log(`before:TEST`)
        await handler(ctx)
        console.log(`after:Test`)
    }
}

const allUsers: SlattRequestHandler = (ctx) => {
    console.log(`useriso`)
    ctx.req.respond({ status: 200, body: `hello world` })
}

const users = app(
    route('/', pipe(
        fallthroughMiddleware,
        fallthroughMiddleware
    )(allUsers)).get,
    route('/x', app(route('/', allUsers)))
)

const exampleApp = slatt({ port: 3333, hostname: '127.0.0.1' })(
    // route(middleware()),
    // middleware(),
    fallthroughMiddleware(users)
)

exampleApp.start()