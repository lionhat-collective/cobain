import { serve, HTTPOptions, ServerRequest } from "https://deno.land/std@0.98.0/http/server.ts"

export const cobain: Cobain = (addr) => {
    return (...middleware) => {
        for (const fn of middleware) {
            if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!')
        }

        function createContext(req: ServerRequest): CobainContext {
            return {
                req,
                local: {},
                plugins: [],
            }
        }
        async function respond(ctx: CobainContext): Promise<void> {
            // if (ctx.req.)
            // ctx.req.
        }

        // Shoutout the Koa team (https://github.com/koajs/compose)
        const compose = (ctx: CobainContext) => {
            let index = -1
            return dispatch(0)
            function dispatch (i: number) {
                if (i <= index) return Promise.reject(new Error('next() called multiple times'))
                index = i
                let fn = middleware[i]
                if (i === middleware.length) fn = dispatch.bind(null, i + 1)
                if (!fn) return Promise.resolve()
                try {
                    return Promise.resolve(fn(ctx));
                } catch (err) {
                    return Promise.reject(err)
                }
            }
        }
        
        return {
            async handleRequest(req: ServerRequest) {
                const ctx = createContext(req)
                const handleResponse = () => respond(ctx)
                try {
                    await compose(ctx)
                    handleResponse()
                    // TODO: handle response?
                } catch (_err) {
                    // TODO: catch
                }
            },
            async start() {
                const server = serve(addr)
                for await (const request of server) {
                    this.handleRequest(request)
                    // console.log(request.headers.get('user-agent') || 'unknown')
                }
            }
        }
    }
}
export interface CobainInstance {
    start: () => Promise<void>
    handleRequest: (req: ServerRequest) => Promise<void>
}

export type Cobain = (addr: string | HTTPOptions) => 
    (...middleware: CobainRequestHandler[]) => CobainInstance

export type CobainContext<AppCtx extends CobainAppContext = CobainAppContext> = Omit<AppCtx, 'decorators'> & {
    req: ServerRequest
}

export type CobainRequestHandler<Ctx extends CobainContext = CobainContext> = (ctx: Ctx) => 
    Promise<CobainRequestHandler<Ctx> | void> | CobainRequestHandler<Ctx> | void

export type CobainMiddleware<
    Ctx extends CobainContext = CobainContext
> = (handler?: CobainRequestHandler<Ctx>) => CobainRequestHandler<Ctx>

type CobainAppLocals = Record<string, unknown>
type CobainAppContext<L extends CobainAppLocals = CobainAppLocals> = {
    local?: L
    plugins?: unknown[]
    decorators: Decorators[]
}

export type CobainRoute<Ctx extends CobainContext = CobainContext> = [
    { path: string, method: string }, 
    CobainRequestHandler<Ctx>
]
export type CobainRouteHandler<AppCtx extends CobainAppContext> = (path: string, handler: CobainRequestHandler<CobainContext<AppCtx>>) => CobainRouteBuilder<AppCtx>

type CobainRouteDecorators<AppCtx extends CobainAppContext> = <D extends Decorators<AppCtx['decorators'][number]>>
    (decorator: D, prevDecorators?: Decorators<AppCtx['decorators'][number]>[]) => CobainRouteBuilder<AppCtx, D>

type CobainAppContextDecorators<AppCtx extends CobainAppContext = CobainAppContext> = Decorators<AppCtx['decorators'][number]>

type CobainRouteBuilder<
    AppCtx extends CobainAppContext = CobainAppContext,
    D extends CobainAppContextDecorators<AppCtx> = CobainAppContextDecorators<AppCtx>
> = {
    [key in CobainAppContextDecorators<AppCtx>]: key extends 'routes' ? CobainRoute[] : Omit<CobainRouteBuilder<AppCtx, D | key>, D | key>
}

type CobainAppRouteContext<AppCtx extends CobainAppContext = CobainAppContext> = (route: CobainRouteHandler<AppCtx>) => CobainRouteBuilder<AppCtx>[]

export type CobainApp = <L extends CobainAppLocals>(appContext: CobainAppContext<L>) => 
    (routeCtx: CobainAppRouteContext<typeof appContext>) => CobainRequestHandler<CobainContext<typeof appContext>>


type Decorators<D extends string = ''> = D | '' | 'get' | 'post' | 'put' | 'patch' | 'delete' | 'all' | 'routes'

/**
 * Creates an application that matches a request route path.
 * Route order matters!
 * @param routes The routes that are specific to this application.
 * @returns The route that matches the request.
 */
 export const app: CobainApp = appContext => {
    /**
     * Creates a route handler for usage inside an app.
     * @param path The path to match against.
     * @param handler The request handler.
     * @returns A route definition [path, handler]
     * TODO: do this just-in-time for better perf.
     */
    const route: CobainRouteHandler<typeof appContext> = (path, handler) => {
        const create: CobainRouteDecorators<typeof appContext> = (decorator, prevDecorators = []) => {
            const entries = appContext.decorators.filter((t) => !(prevDecorators.includes(t)))
                    .map((t: CobainAppContextDecorators<typeof appContext>) => [
                        t,
                        create(t, decorator === '' ? [] : prevDecorators.concat([decorator]))
                    ])
            return Object.assign({}, Object.fromEntries(entries), { routes: prevDecorators.map(method => [{ path, method }, handler]) })
        }
        return create('')
    }
    return (routeCtx) => {
        const routes = routeCtx(route)
        console.log(routes)
        return ctx => {
            return routes[0].routes[0][1](ctx) // for testing!
            // ctx.req.respond({ status: 200, body: `we made it!` })
        }
    }
    // return ((route) => []) => {
    //     // const [, handler] = routes[0].routes[0]
    //     console.log(routes, { routes: routes[0] })
    //     return (ctx) => ctx.req.respond({ status: 200, body: `fkoap` })
    // }
}

app<{
    x: number
}>({
    local: {
        x: 0
    },
    decorators: []
})(route => [
    route('/', () => {}),
    route('/:id', () => {})
])



























// const create = <T extends typeof methods[number] = typeof methods[number]>(type: Methods = '', prevTypes: Methods[] = []): Method<T> | Method<Exclude<Methods, typeof type>> => {




/*

const allUsers = (ctx: CobainContext) => {}
const user = (ctx: CobainContext) => {}
const profile = (ctx: CobainContext) => {}

const users = app({
    '/': route(auth(allUsers)).get,
    '/:id': route(user).get.post(auth).patch(auth),
    '/:id': route(user).destroy(auth)
    '/:id/profile': route(profile).get
})

export default users

const posts = app()(route => [
    route('/', auth(allUsers)).get,
    route('/:id', user).get.post(auth).patch(auth),
    route('/:id',user).destroy(auth)
    route('/:id/profile', profile) // defaults to .get
])

//

const myAppName = cobain()(
    auth(
        users,
        posts
    )
)

myAppName.start()

*/