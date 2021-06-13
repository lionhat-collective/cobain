![slime love all the time](./slatt.svg)
## A (micro) web-framework for Deno
Utilizing function composition and proxies to create a cohesive and fluent web-framework.

### Todo:
 - [ ] Routing
   - [ ] Use Proxy for route function
        ```javascript
        route(/*...*/).get.post.put
        // or
        route(/*...*/).get(/* additional middleware/compositions */).post.put
        // or
        route(/*...*/) // => defaults to "get"
        ```
 - [ ] Custom App State/Context
 - [x] Middleware/Function Composition
 - [x] Server bootstrapping

### Usage:
```javascript
import type { SlattMiddleware, SlattRequestHandler } from 'https://raw.githubusercontent.com/lionhat-collective/slatt/master/slatt.ts'
import { slatt, app, route } from 'https://raw.githubusercontent.com/lionhat-collective/slatt/master/slatt.ts'
import { pipe } from 'https://deno.land/x/rambda@v6.7.0/pipe.js'

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
    )(allUsers))
)

const exampleApp = slatt({ port: 3333, hostname: '127.0.0.1' })(
    // route(middleware()),
    // middleware(),
    users
)

exampleApp.start()
```

### Attribution:
[KoaJS](https://github.com/koajs/koa) — Heavily inspired by their work, a lot of the design decisions came from the design of Koa.