const http = require('node:http')
const fs = require('node:fs/promises')

const desiredPort = process.env.PORT ?? 1234

// Ejercicio 1: crear servidor HTTP con Node
function startServer () {
  const server = http.createServer(bootstrapServer)
  server.listen(desiredPort)
  return server
}

function bootstrapServer (req, res) {
  const { method } = req

  const isAllowedMethod = Object.values(METHODS).includes(method)
  if (!isAllowedMethod) return custom405MethodNotAllowed(req, res)

  if (method === METHODS.GET) {
    return handleGetPaths(req, res)
  }

  if (method === METHODS.POST) {
    return handlePostPaths(req, res)
  }
}

const handleGetPaths = (req, res) => {
  const { url } = req

  const isIndexUrl = url === APP_PATHS_CONFIG['/'].url
  if (isIndexUrl) return APP_PATHS_CONFIG['/'].get.handleGetIndex(req, res)

  const isLogoUrl = url === APP_PATHS_CONFIG['/logo.webp'].url
  if (isLogoUrl) return APP_PATHS_CONFIG['/logo.webp'].get.handleGetLogo(req, res)

  return custom404NotFound(req, res)
}

const handlePostPaths = (req, res) => {
  const { url } = req

  const isContactUrl = url === APP_PATHS_CONFIG['/contacto'].url
  if (isContactUrl) return APP_PATHS_CONFIG['/contacto'].post.handlePostContact(req, res)

  return custom405MethodNotAllowed(req, res)
}

function handleGetIndex (req, res) {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
  return res.end('<h1>¡Hola mundo!</h1>')
}

function handleGetLogo (req, res) {
  const imagePath = './assets/logo.webp'

  return fs.readFile(imagePath).then(data => {
    res.writeHead(200, {
      'Content-Type': 'image/webp'
    })
    return res.end(data)
  }).catch(_ => {
    return custom500InternalServerError(req, res)
  })
}

function handlePostContact (req, res) {
  let body = ''

  req.on('data', chunk => {
    body += chunk.toString()
  })

  req.on('end', () => {
    const data = JSON.parse(body)
    req.writeHead(201, {
      'Content-Type': 'application/json; charset=utf-8'
    })
    return res.end(JSON.stringify(data))
  })
}

const custom404NotFound = (req, res) => {
  res.statusCode = 404
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  return res.end('<h1>404</h1>')
}

const custom405MethodNotAllowed = (req, res) => {
  res.statusCode = 405
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  return res.end('<h1>405</h1>')
}

const custom500InternalServerError = (req, res) => {
  res.statusCode = 500
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  return res.end('<h1>500 Internal Server Error</h1>')
}

const METHODS = {
  GET: 'GET',
  POST: 'POST'
}

const APP_PATHS_CONFIG = {
  '/': {
    url: '/',
    get: {
      handleGetIndex
    }
  },
  '/logo.webp': {
    url: '/logo.webp',
    get: {
      handleGetLogo
    }
  },
  '/contacto': {
    url: '/contacto',
    post: {
      handlePostContact
    }
  }
}

module.exports = {
  startServer
}
