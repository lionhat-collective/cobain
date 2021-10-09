import { serve, HTTPOptions, ServerRequest } from "https://deno.land/std@0.98.0/http/server.ts"

export const cobain: Cobain = (...middleware) => {
    for (const fn of middleware) {
        if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!')
    }

    function createContext(req: ServerRequest): CobainContext {
        return {
            req,
            local: {},
            decorators: [],
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

    return (addr) => {
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
                if (!addr) throw new Error('No address specified')

                const server = serve(addr)
                for await (const request of server) {
                    this.handleRequest(request)
                    // console.log(request.headers.get('user-agent') || 'unknown')
                }
            },
            mount() {
                return middleware
            },
        }
    }
}

type CobainRouter = (route: CobainRouteHandler) => Omit<CobainRouteBuilder, Exclude<CobainDecorator, 'paths'>>[]

export const router = (route: CobainRouter): CobainRequestHandler => {
    const routeHandler: CobainRouteHandler = (path, handler) => {
        const getPaths = (decorators: CobainDecorator[]): CobainRoute[] =>
            decorators
                .filter(method => method !== 'paths')
                .map(method => [{ path, method }, handler])
        const safeMap: CobainDecoratorMap = prev => {
            const entries = prev.map((decorator, idx) => {
                const next = prev.slice(0, idx).concat(prev.slice(idx + 1))
                if (decorator === 'paths') {
                    return [decorator, getPaths(difference(cobainDecorators, next))]
                }
                return [decorator, safeMap(next)]
            })
            return Object.fromEntries(entries)
        }
        return safeMap(cobainDecorators)
    }
    const routes = route(routeHandler)
    // execute plugins, act on decorators, etc.
    return routes[0].paths[0][1]
}

export interface CobainInstance {
    start: () => Promise<void>
    handleRequest: (req: ServerRequest) => Promise<void>
    mount: () => CobainRequestHandler[]
}

export type Cobain = (...middleware: CobainRequestHandler[]) => (addr?: string | HTTPOptions) => CobainInstance

export type CobainAppLocals = Record<string, unknown>

export type CobainContext = {
    local: Record<string, unknown>
    plugins: unknown[]
    decorators: string[]
    req: ServerRequest
}

export type CobainRequestHandler = (ctx: CobainContext) => Promise<CobainRequestHandler | void> | CobainRequestHandler | void

export type CobainMiddleware = (handler?: CobainRequestHandler) => CobainRequestHandler

export type CobainRoute = [
    def: { path: string, method: string },
    handler: CobainRequestHandler
]

export type CobainRouteHandler = (path: string, handler: CobainRequestHandler) => CobainRouteBuilder

type CobainRouteBuilder = {
    [key in CobainDecorator]: key extends 'paths' ? CobainRoute[] : Omit<CobainRouteBuilder, | key>
}

type CobainDecorator = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'paths' | 'all'
const cobainDecorators: CobainDecorator[] = [
    'get', 'post', 'put', 'patch', 'delete', 'paths', 'all'
]
type CobainDecoratorMap = (prevDecorators: CobainDecorator[]) => CobainRouteBuilder

const difference = <T>(a: T[], b: T[]) => a.filter(ai => !b.includes(ai))

/*

const usersApp = cobain(route => (
    fallthroughMiddleware,
    route('/', () => {}).get.post.put
))

const app = cobain(
    routes(route => [
        route('/', () => {}).get.post.put,
    ])
)({
    port: 3333
})

*/

// /**
//  * Creates an application that matches a request route path.
//  * Route order matters!
//  * @param routes The routes that are specific to this application.
//  * @returns The route that matches the request.
//  */
//  export const app: CobainApp = appContext => {
//    const route: CobainRouteHandler<typeof appContext> = (path, handler) => {
//         const getPaths = (decorators: CobainDecorator[]): CobainRoute<typeof appContext>[] => 
//             decorators
//                 .filter(method => method !== 'paths')
//                 .map(method => [{ path, method }, handler])
//         const safeMap: CobainDecoratorMap<typeof appContext> = prev => {
//             const entries = prev.map((decorator, idx) => {
//                 const next = prev.slice(0, idx).concat(prev.slice(idx + 1))
//                 if (decorator === 'paths') {
//                     return [decorator, getPaths(difference(cobainDecorators, next))]
//                 }
//                 return [decorator, safeMap(next)]
//             })
//             return Object.fromEntries(entries)
//         }
//         return safeMap(cobainDecorators)
//     }

//     return (appRoutes) => {
//         const routes = appRoutes(route)
//         // console.log(routes)
//         return ctx => {
//             // do app specific things here:
//             // execute plugins, act on decorators, etc.
//             return routes[0].paths[0][1](ctx) // for testing!
//             // ctx.req.respond({ status: 200, body: `we made it!` })
//         }
//     }
//     // return ((route) => []) => {
//     //     // const [, handler] = routes[0].routes[0]
//     //     console.log(routes, { routes: routes[0] })
//     //     return (ctx) => ctx.req.respond({ status: 200, body: `fkoap` })
//     // }
// }


























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