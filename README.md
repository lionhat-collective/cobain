![cobain](./cobain.svg)
## A web-framework for Deno
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
```typescript
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

const users = app(
    route('/', pipe(f1, f2)(allUsers)),
    route('/x', app(route('/', allUsers)))
)

const exampleApp = cobain({ port: 3333, hostname: '127.0.0.1' })(
    // route(middleware()),
    // middleware(),
    fallthroughMiddleware(users)
)

exampleApp.start()
```

### Attribution:
[KoaJS](https://github.com/koajs/koa) — Heavily inspired by their work, a lot of the design decisions came from the design of Koa.