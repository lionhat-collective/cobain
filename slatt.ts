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

// <Exclude<typeof methods[number], keyof typeof target>

type Methods<T extends string = ''> = T | 'get' | 'post' | 'put' | 'patch' | 'delete' | 'all'

const methods: Exclude<Methods, ''>[] = ['get' , 'post' , 'put' , 'patch' , 'delete' , 'all']

type Method<T extends typeof methods[number] = typeof methods[number]> = { [key in typeof methods[number]]: Omit<Method<T | key>, T | key> }
type SlattRouteBuilder<T extends typeof methods[number] = typeof methods[number]> = Method<T> & {
    routes: SlattRoute[]
}
// const create = <T extends typeof methods[number] = typeof methods[number]>(type: Methods = '', prevTypes: Methods[] = []): Method<T> | Method<Exclude<Methods, typeof type>> => {
const create = (type: Methods = '', prevTypes: Methods[] = []): Method<Exclude<Methods, typeof type>> => {
    // type entry = [typeof methods, Method<Exclude<Methods, typeof type>>][]
    const entries = methods.filter((t) => !(prevTypes.includes(t)))
            .map((t: typeof methods[number]) => {
                console.log(t)
                return [t, create(t, prevTypes.concat([type]))]
            })
    return Object.fromEntries(entries)
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
    let routes: SlattRoute[] = []

    // const builder: SlattRouteBuilder = Object.assign({}, create(), {
    //     routes
    // })
    const builder = create()
    
    const proxyHandler = {
        // Omit<Method<Methods | typeof prop>, Methods | typeof prop>
        get: function(target: Method | SlattRouteBuilder, prop: keyof typeof target, receiver: any): SlattRouteBuilder<Exclude<keyof typeof target, 'routes'>> | SlattRoute[] {
            // if (prop in target) {
            //     // target[prop] = new Proxy(target, proxyHandler)
            //     return 
            //     // if (typeof prop === 'function') {
            //     //     routes.push([{ path, method: 'get' }, route(path, prop as SlattMiddleware)])
            //     //     return target[prop]
            //     // }
            // }
            console.log(target, `target`)
            routes = routes.concat([[{ path, method: prop }, handler]])
            if ((target as SlattRouteBuilder).routes) {
                return routes
            }
            // if (target as SlattRouteBuilder) {
            // }
            // if (prop === '') {
            //     return Reflect.get(target, prop, receiver)
            // }
            // if (prop === 'build') return target[prop]()
            return Reflect.get(target, prop, receiver)
            // return new Proxy(create(prop, Object.keys(target) as Methods[]), proxyHandler)
            // target.routes.push([{ path, method: 'get' }, handler])
            // return target[prop]
        }
    }

    const proxy = new Proxy(builder, proxyHandler)
    // proxy.
    // console.log(routes, proxy, { x: Object.keys(proxy.get!) })
    return proxy as SlattRouteBuilder
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