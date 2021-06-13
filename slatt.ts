import { serve, HTTPOptions, ServerRequest } from "https://deno.land/std@0.98.0/http/server.ts"

const defaultSlattContext = {
    local: {},
    plugins: []
}

export const slatt: Slatt = (addr, opts: unknown = defaultSlattContext) => {
    return (...middleware) => {
        for (const fn of middleware) {
            if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!')
        }

        function createContext(req: ServerRequest): SlattContext {
            return {
                req,
                local: opts
            }
        }
        async function respond(ctx: SlattContext): Promise<void> {
            // if (ctx.req.)
            // ctx.req.
        }

        // Shoutout the Koa team (https://github.com/koajs/compose)
        const compose = (ctx: SlattContext) => {
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

export interface SlattInstance {
    start: () => Promise<void>
    handleRequest: (req: ServerRequest) => Promise<void>
}

export type Slatt = (addr: string | HTTPOptions, opts?: unknown) => 
    (...middleware: SlattRequestHandler[]) => SlattInstance

export interface SlattContext {
    local: unknown
    req: ServerRequest
}

export type SlattRequestHandler = (ctx: SlattContext) => Promise<SlattRequestHandler | void> | SlattRequestHandler | void
export type SlattMiddleware = (handler?: SlattRequestHandler) => SlattRequestHandler
export type SlattRoute = [{ path: string, method: string }, SlattRequestHandler]
export type SlattRouteHandler = (path: string, handler: SlattRequestHandler) => SlattRouteBuilder
export type SlattApp = (...routes: (SlattRouteBuilder)[]) => SlattRequestHandler


type RouteBuilder = { type: string, parent: SlattRouteBuilder }
type Methods = ('get' | 'post' | 'put' | 'patch' | 'delete' | 'all')
type Method = { [key in Methods]: SlattRouteBuilder | undefined }
type SlattRouteDef = (type: Methods, next: SlattRouteBuilder) => Method
type SlattComposedRouteDef = (type: Methods, next?: SlattRouteBuilder) => Method
type SlattRouteBuilder = Method & {
    build?: () => SlattRoute[]
}

/**
 * Creates an application that matches a request route path.
 * Route order matters!
 * @param routes The routes that are specific to this application.
 * @returns The route that matches the request.
 */
export const app: SlattApp = (...routes) => {
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
export const route: SlattRouteHandler = (path, handler) => {
    // var x = {
    //     get: function (target: any, key: any, receiver: any) {
    //         if (!(key in target)) {
    //         target[key] = Tree();  // auto-create a sub-Tree
    //         }
    //         return Reflect.get(target, key, receiver);
    //     }
    // }
    // function Tree() {
    //     return new Proxy({}, x);
    //   }

    let routes: SlattRoute[] = []

    // const routeDef: SlattRouteDef = (type, next) => new Proxy<SlattRouteBuilder>({
    //     get: next,
    //     put: next,
    //     post: next,
    //     all: next,
    //     delete: next,
    //     patch: next,
    // }, proxyHandler)
    // const composedRouteDef: SlattComposedRouteDef = (type, next) => new Proxy<SlattRouteBuilder>({
    //     get: next,
    //     put: next,
    //     post: next,
    //     all: next,
    //     delete: next,
    //     patch: next,
    // }, proxyHandler)
    const routeDef: SlattRouteDef = (type, next) => ({
        get: undefined,
        put: undefined,
        post: undefined,
        all: undefined,
        delete: undefined,
        patch: undefined,
        [type]: next,
    })
    const composedRouteDef: SlattComposedRouteDef = (type, next) => ({
        get: undefined,
        put: undefined,
        post: undefined,
        all: undefined,
        delete: undefined,
        patch: undefined,
        [type]: next,
    })
    const method: Method = {
        get: undefined,
        put: undefined,
        post: undefined,
        all: undefined,
        delete: undefined,
        patch: undefined,
    }
    
    const proxyHandler = {
        get: function(target: Method, prop: Methods, receiver: any): SlattRouteBuilder {
            // if (prop in target) {
            //     // target[prop] = new Proxy(target, proxyHandler)
            //     return 
            //     // if (typeof prop === 'function') {
            //     //     routes.push([{ path, method: 'get' }, route(path, prop as SlattMiddleware)])
            //     //     return target[prop]
            //     // }
            // }
            routes = routes.concat([[{ path, method: 'get' }, handler]])
            console.log(target, `target`)
            if (typeof target[prop] === 'undefined') {
                return target
            }
            return new Proxy(composedRouteDef(prop, target[prop]), proxyHandler)
            // target.routes.push([{ path, method: 'get' }, handler])
            // return target[prop]
        }
    }

    const proxy = new Proxy(method, proxyHandler)
    proxy.patch?.put?.put
    console.log(routes, proxy, { x: Object.keys(proxy.get!) })
    return proxy
}


/*

const allUsers = (ctx: SlattContext) => {}
const user = (ctx: SlattContext) => {}
const profile = (ctx: SlattContext) => {}

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

const myAppName = slatt()(
    auth(
        users,
        posts
    )
)

myAppName.start()

*/