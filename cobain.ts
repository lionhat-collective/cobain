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
                if (i <= index) return Promise.reject(new Error('handler() called multiple times'))
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

export type CobainRequestHandler = <Ctx extends CobainContext>(ctx: Ctx) => 
    Promise<CobainRequestHandler | void> | CobainRequestHandler | void

export type CobainMiddleware = (handler?: CobainRequestHandler) => CobainRequestHandler

export type CobainAppLocals = Record<string, unknown>
type CobainAppContext<L extends CobainAppLocals = CobainAppLocals> = {
    local: L
    plugins: unknown[]
    decorators: string[]
}

export type CobainRoute = [
    { path: string, method: string }, 
    CobainRequestHandler
]

export type CobainRouteHandler<
    AppCtx extends CobainAppContext, 
    D extends CobainAppContextDecorators<AppCtx> = CobainAppContextDecorators<AppCtx>
> = (path: string, handler: CobainRequestHandler) => Omit<CobainRouteBuilder<AppCtx, D>, D>

type CobainRouteDecorators<AppCtx extends CobainAppContext> = (
    decorator: CobainAppContextDecorators<AppCtx>,
    prevDecorators?: CobainAppContextDecorators<AppCtx>[]
) => CobainRouteBuilder<AppCtx, Exclude<CobainAppContextDecorators<AppCtx>, typeof decorator>>

type CobainAppContextDecorators<AppCtx extends CobainAppContext> = Decorators<AppCtx['decorators'][number]>

// type CobainOmittedRouteBuilder<
//     AppCtx extends CobainAppContext = CobainAppContext,
//     D extends CobainAppContextDecorators<AppCtx> = CobainAppContextDecorators<AppCtx>
// > = D extends 'routes' ? CobainRoute[] : Omit<CobainRouteBuilder<AppCtx, D>, D>

type CobainRouteBuilder<
    AppCtx extends CobainAppContext,
    D extends CobainAppContextDecorators<AppCtx> = CobainAppContextDecorators<AppCtx>
> = {
    [key in CobainAppContextDecorators<AppCtx>]: key extends 'routes' ? CobainRoute[] : Omit<CobainRouteBuilder<AppCtx, D | key>, D | key>
}

type CobainAppRouteContext<AppCtx extends CobainAppContext, D extends CobainAppContextDecorators<AppCtx>> = (route: CobainRouteHandler<AppCtx>) => Omit<CobainRouteBuilder<AppCtx, D>, D>[]

export type CobainApp = <L extends CobainAppLocals>(appContext: CobainAppContext<L>) => 
    (route: CobainAppRouteContext<typeof appContext, typeof appContext['decorators'][number]>) => CobainRequestHandler


type Decorators<D extends string = ''> = D | '' | 'get' | 'post' | 'put' | 'patch' | 'delete' | 'all' | 'paths'

/**
 * Creates an application that matches a request route path.
 * Route order matters!
 * @param routes The routes that are specific to this application.
 * @returns The route that matches the request.
 */
 export const app: CobainApp = appContext => {
    const appDecorators: CobainAppContextDecorators<typeof appContext>[] = [
        '', 'get', 'post', 'put', 'patch', 'delete', 'all', 'paths'
    ].concat(appContext.decorators)
    const totalDecorators = appDecorators.length

    const createDecorators = (totalDecorators: number) => {
        const decoratorsFor = (decorator) => {
            for (let i = 0; i < totalDecorators; i++) {
                
            }
        }
        const decorators = appDecorators
            .map(decorator => [decorator, decoratorsFor(decorator)])
        // const entries = appDecorators
            //     .filter((t) => !(prevDecorators.includes(t)))
            //     .map((t) => [
            //         t,
            //         t === 'routes' && decorator === '' ? [] : 
            //             t === 'routes' ? [prevDecorators.map(method => [{ path, method }, handler])] : 
            //                 create(t, prevDecorators.concat([decorator]))
            //     ])
            // return Object.fromEntries(entries)
    }

    const decorators = createDecorators(totalDecorators)

    // const decorators = {}
    // for (let i = 0; i < appDecorators.length; i++) {
        
    // }

    /**
     * Creates a route handler for usage inside an app.
     * @param path The path to match against.
     * @param handler The request handler.
     * @returns A route definition [path, handler]
     * TODO: do this just-in-time for better perf.
     */
    const route: CobainRouteHandler<typeof appContext> = (path, handler) => {
        // const create: CobainRouteDecorators<typeof appContext> = (decorator, prevDecorators = []) => {
            
            
        // }
        return Object.assign({}, decorators)
    }
    return (appRoutes) => {
        console.log(route('/', () => {}))

        const routes = appRoutes(route)
        console.log(routes)
        return ctx => {
            // return routes[0].routes[0][1](ctx) // for testing!
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
    plugins: [],
    decorators: []
})(route => {
    return [
        route('/', () => {}),
        route('/:id', () => {})
    ]
})({
    local: { x: 1 },
    plugins: [],
    req: new ServerRequest()
})


























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