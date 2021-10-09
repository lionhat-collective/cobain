import { pipe } from 'https://deno.land/x/rambda@v6.7.0/pipe.js'
import { cobain, router } from './cobain.ts'
import type { CobainMiddleware, CobainRequestHandler, CobainAppLocals } from './cobain.ts'

const middleware: CobainMiddleware = (handler) => (ctx) => {
    console.log(`middleware called`)
    if (typeof handler !== 'undefined') {
        console.log(`handler`)
        return handler(ctx)
    }
    ctx.req.respond({ status: 200, body: `MIDDLEWARE` })
}

let count = 0

const fallthroughMiddleware: CobainMiddleware = handler => async ctx => {
    count += 1
    if (handler) {
        console.log(`[${count}]: before:TEST`)
        await handler(ctx)
        console.log(`[${count}]: after:Test`)
    }
}

const allUsers: CobainRequestHandler = (ctx) => {
    console.log(ctx.local)
    console.log(`useriso`)
    ctx.req.respond({ status: 200, body: `hello world ${ctx?.local?.x ?? -1}, ${ctx?.local?.y ?? -1}` })
}

const f1 = fallthroughMiddleware
const f2 = fallthroughMiddleware

interface AppLocals extends CobainAppLocals {
    x: number
    y: number
}

// const defaultApp = cobain({
//     local: {
//         x: 42,
//         y: 24,
//     },
//     plugins: [],
//     decorators: []
// })

// const app2 = app<AppLocals>({ decorators: [], plugins: [], local: { x: 24, y: 42 } })

const authApp = cobain(
    fallthroughMiddleware(ctx => {
        ctx.req.respond({ status: 200, body: `auth` })
    })
)

const usersRouter = router(route => [
    route('/', pipe(
        fallthroughMiddleware,
        fallthroughMiddleware,
    )(allUsers)).get
])

const app = cobain(
    usersRouter,
    ...authApp().mount(),
)({ port: 3333, hostname: '127.0.0.1' })

await app.start()

// const usersApp = defaultApp(route => [
//     route('/', pipe(
//         f1,
//         f2
//     )(allUsers)).get.post,
//     route('/x', app2((route) => [route('/', allUsers)]))
// ])

// const exampleApp = cobain({ port: 3333, hostname: '127.0.0.1' })(
//     // route(middleware()),
//     // middleware(),
//     fallthroughMiddleware(usersApp)
// )

// exampleApp.start()