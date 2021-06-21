import { serve, HTTPOptions, ServerRequest } from "https://deno.land/std@0.98.0/http/server.ts"

const defaultCobainContext = {
    local: {},
    plugins: []
}

export const cobain: Cobain = (addr, opts: unknown = defaultCobainContext) => {
    return (...middleware) => {
        for (const fn of middleware) {
            if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!')
        }

        function createContext(req: ServerRequest): CobainContext {
            return {
                req,
                local: opts
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

export type Cobain = (addr: string | HTTPOptions, opts?: unknown) => 
    (...middleware: CobainRequestHandler[]) => CobainInstance

export interface CobainContext {
    local: unknown
    req: ServerRequest
}

export type CobainRequestHandler = (ctx: CobainContext) => Promise<CobainRequestHandler | void> | CobainRequestHandler | void
export type CobainMiddleware = (handler?: CobainRequestHandler) => CobainRequestHandler
export type CobainRoute = [{ path: string, method: string }, CobainRequestHandler]
export type CobainRouteHandler = (path: string, handler: CobainRequestHandler) => CobainRouteBuilder
export type CobainApp = (...routes: (CobainRouteBuilder)[]) => CobainRequestHandler

// <Exclude<typeof methods[number], keyof typeof target>

type Methods<T extends string = ''> = T | 'get' | 'post' | 'put' | 'patch' | 'delete' | 'all'

const methods: Exclude<Methods, ''>[] = ['get' , 'post' , 'put' , 'patch' , 'delete' , 'all']

type Method<T extends typeof methods[number] = typeof methods[number]> = {
    [key in typeof methods[number]]: Omit<Method<T | key>, T | key>
}
type CobainRouteBuilder<T extends typeof methods[number] = typeof methods[number]> = Method<T> & {
    routes: CobainRoute[]
}
// const create = <T extends typeof methods[number] = typeof methods[number]>(type: Methods = '', prevTypes: Methods[] = []): Method<T> | Method<Exclude<Methods, typeof type>> => {
const create = (type: Methods = '', prevTypes: typeof methods[number][] = []): Method<Exclude<Methods, typeof type>> => {
    // type entry = [typeof methods, Method<Exclude<Methods, typeof type>>][]
    const entries = methods.filter((t) => !(prevTypes.includes(t)))
            .map((t: typeof methods[number]) => {
                console.log(t)
                return [t, create(t, type === '' ? [] : prevTypes.concat([type]))]
            })
    return Object.fromEntries(entries)
}

/**
 * Creates an application that matches a request route path.
 * Route order matters!
 * @param routes The routes that are specific to this application.
 * @returns The route that matches the request.
 */
export const app: CobainApp = (...routes) => {
    // const [, handler] = routes[0].routes[0]
    console.log(routes, { routes: routes[0] })
    return (ctx) => ctx.req.respond({ status: 200, body: `fkoap` })
}

/**
 * Creates a route handler for usage inside an app.
 * @param path The path to match against.
 * @param handler The request handler.
 * @returns A route definition [path, handler]
 */
export const route: CobainRouteHandler = (path, handler) => {
    let routes: CobainRoute[] = []

    // const builder: CobainRouteBuilder = Object.assign({}, create(), {
    //     routes
    // })
    const builder = create()
    
    const proxyHandler = (type: Methods = '') => ({
        // Omit<Method<Methods | typeof prop>, Methods | typeof prop>
        get: function(target: CobainRouteBuilder<Exclude<Methods, typeof type>>, prop: keyof typeof target, receiver: any): CobainRouteBuilder<Exclude<Methods, typeof type>> {
            // if (prop in target) {
            //     // target[prop] = new Proxy(target, proxyHandler)
            //     return 
            //     // if (typeof prop === 'function') {
            //     //     routes.push([{ path, method: 'get' }, route(path, prop as CobainMiddleware)])
            //     //     return target[prop]
            //     // }
            // }
            console.log(target, `target`)
            routes = routes.concat([[{ path, method: prop }, handler]])
            // if (target as CobainRouteBuilder) {
            // }
            if (prop === 'routes') {
                return target
            }
            // const keys = Object.keys(target) as Exclude<typeof methods, typeof type>
            // if (prop === 'build') return target[prop]()
            // return Reflect.get(target, prop, receiver)
            return new Proxy({
                ...create(prop),
                routes
            }, proxyHandler(prop))
            // target.routes.push([{ path, method: 'get' }, handler])
            // return target[prop]
        }
    })

    const proxy = new Proxy({ ...builder, routes }, proxyHandler())

    // console.log(routes, proxy, { x: Object.keys(proxy.get!) })
    return proxy
}


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

const posts = app({
    route('/', auth(allUsers)).get,
    route('/:id', user).get.post(auth).patch(auth),
    route('/:id',user).destroy(auth)
    route('/:id/profile', profile) // defaults to .get
})

const myAppName = cobain()(
    auth(
        users,
        posts
    )
)

myAppName.start()

*/