import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'

/**
 * Dev-only bridge that serves the Vercel functions in /api through Vite,
 * so `npm run dev` and `vercel --prod` behave the same way.
 */
const API_ROUTES: Array<{ pattern: RegExp; file: string }> = [
  { pattern: /^\/api\/products\/?$/, file: 'api/products/index.ts' },
  { pattern: /^\/api\/products\/([^/]+)\/?$/, file: 'api/products/[slug].ts' },
  { pattern: /^\/api\/orders\/?$/, file: 'api/orders/index.ts' },
]

function apiDevServer(): Plugin {
  return {
    name: 'mantle-api-dev',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const rawUrl = req.url || ''
        if (!rawUrl.startsWith('/api/')) return next()

        const [pathname, search = ''] = rawUrl.split('?')
        const route = API_ROUTES.find((r) => r.pattern.test(pathname))
        if (!route) {
          res.statusCode = 404
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Not found', path: pathname }))
          return
        }

        try {
          const match = pathname.match(route.pattern)
          const query: Record<string, string> = {}
          new URLSearchParams(search).forEach((value, key) => {
            query[key] = value
          })
          if (match?.[1]) query.slug = decodeURIComponent(match[1])

          const body = await readJsonBody(req)
          const absolute = path.resolve(process.cwd(), route.file)
          const mod = await server.ssrLoadModule(absolute)
          const handler = mod.default as (req: unknown, res: unknown) => unknown

          if (typeof handler !== 'function') {
            res.statusCode = 500
            res.end(JSON.stringify({ error: `No default export in ${route.file}` }))
            return
          }

          await handler(
            { method: req.method, url: rawUrl, query, body, headers: req.headers },
            createResponseAdapter(res),
          )
        } catch (error) {
          console.error('[api-dev]', error)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Internal error', message: (error as Error).message }))
        }
      })
    },
  }
}

function readJsonBody(req: IncomingMessage): Promise<unknown> {
  if (req.method === 'GET' || req.method === 'HEAD') return Promise.resolve(undefined)
  return new Promise((resolve) => {
    let raw = ''
    req.on('data', (chunk) => {
      raw += chunk
      if (raw.length > 1_000_000) req.destroy()
    })
    req.on('end', () => {
      if (!raw) return resolve(undefined)
      try {
        resolve(JSON.parse(raw))
      } catch {
        resolve(raw)
      }
    })
    req.on('error', () => resolve(undefined))
  })
}

function createResponseAdapter(res: ServerResponse) {
  let statusCode = 200
  const headers: Record<string, string> = {}

  const adapter = {
    status(code: number) {
      statusCode = code
      return adapter
    },
    setHeader(key: string, value: string) {
      headers[key] = value
      return adapter
    },
    getHeader(key: string) {
      return headers[key]
    },
    json(payload: unknown) {
      headers['Content-Type'] = 'application/json; charset=utf-8'
      res.writeHead(statusCode, headers)
      res.end(JSON.stringify(payload))
      return adapter
    },
    send(payload: unknown) {
      res.writeHead(statusCode, headers)
      res.end(typeof payload === 'string' ? payload : JSON.stringify(payload))
      return adapter
    },
    end(payload?: string) {
      res.writeHead(statusCode, headers)
      res.end(payload)
      return adapter
    },
  }

  return adapter
}

export default defineConfig({
  plugins: [react(), apiDevServer()],
  server: { port: 5173, host: true },
  preview: { port: 4173, host: true },
  build: {
    target: 'es2020',
    sourcemap: false,
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          motion: ['framer-motion'],
        },
      },
    },
  },
})
