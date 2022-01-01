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
        }
    }
}

const difference = <T>(a: T[], b: T[]) => a.filter(ai => !b.includes(ai))

export const mount = (instance: CobainInstance) =>
    (ctx: CobainContext) => instance.handleRequest(ctx.req)

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

type CobainRouter = <Decorator extends CobainDecorator = CobainDecorator>(route: CobainRouteHandler) => 
    Omit<CobainRouteBuilder<Decorator>, Exclude<CobainDecorator, 'paths'>>[]

export interface CobainInstance {
    start: () => Promise<void>
    handleRequest: (req: ServerRequest) => Promise<void>
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

export type CobainRouteHandler<Decorator extends CobainDecorator = CobainDecorator> = (path: string, handler: CobainRequestHandler) => CobainRouteBuilder<Decorator>

type CobainRouteBuilder<Decorator extends CobainDecorator = CobainDecorator> = {
    [key in CobainDecorator]: key extends 'paths' ? CobainRoute[] : Omit<CobainRouteBuilder<Decorator | key>, Decorator | key>
}

type CobainDecorator = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'paths' | 'all'
const cobainDecorators: CobainDecorator[] = [
    'get', 'post', 'put', 'patch', 'delete', 'paths', 'all'
]
type CobainDecoratorMap = (prevDecorators: CobainDecorator[]) => CobainRouteBuilder<typeof prevDecorators[number]>
























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