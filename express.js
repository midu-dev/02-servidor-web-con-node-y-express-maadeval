const express = require('express')

const desiredPort = process.env.PORT ?? 1234

const app = express()
app.use(express.json())
app.use(express.static('assets'))

app.disable('x-powered-by')

// Ejercicio 2: crear servidor HTTP con Express
function startServer () {
  app.use((req, res, next) => {
    const isAvailableMethod = Object.values(METHODS).includes(req.method)
    if (!isAvailableMethod) return res.sendStatus(405)
    next()
  })

  app.all(APP_PATHS['/'], (req, res) => {
    if (!isGetMethod(req, res)) return
    res.send('<h1>¡Hola mundo!</h1>')
  })

  app.all(APP_PATHS['/logo.webp'], (req, res) => {
    if (!isGetMethod(req, res)) return
    res.sendFile('logo.webp')
  })

  app.all(APP_PATHS['/contacto'], (req, res) => {
    if (!isPostMethod(req, res)) return
    res.status(201).json(req.body)
  })

  app.use((_, res) => {
    res.status(404).send('<h1>404</h1>')
  })

  const server = app.listen(desiredPort)
  return server
}

const METHODS = {
  GET: 'GET',
  POST: 'POST'
}

const APP_PATHS = {
  '/': '/',
  '/logo.webp': '/logo.webp',
  '/contacto': '/contacto'
}

const isGetMethod = (req, res) => {
  const isGetMethod = req.method === METHODS.GET
  if (!isGetMethod) res.sendStatus(405)

  return isGetMethod
}

const isPostMethod = (req, res) => {
  const isPostMethod = req.method === METHODS.POST
  if (!isPostMethod) res.sendStatus(405)

  return isPostMethod
}

module.exports = {
  startServer
}
