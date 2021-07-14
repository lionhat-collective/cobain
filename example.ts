import { pipe } from 'https://deno.land/x/rambda@v6.7.0/pipe.js'
import { cobain, app, route } from './cobain.ts'
import type { CobainMiddleware, CobainRequestHandler } from './cobain.ts'

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
const defaultApp = app<{
    x: string
    y: number
}>({
    local: {
        x: '',
        y: 0,
    }
})

const users = defaultApp(
    route('/', pipe(
        f1,
        f2
    )(allUsers)),
    route('/x', defaultApp(route('/', allUsers)))
)

const exampleApp = cobain({ port: 3333, hostname: '127.0.0.1' })(
    // route(middleware()),
    // middleware(),
    fallthroughMiddleware(users)
)

exampleApp.start()