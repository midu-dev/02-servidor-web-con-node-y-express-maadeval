const { describe, it, before, after } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const { startServer } = require('../express.js')

const getPort = () => {
  const { PORT = 1234 } = process.env
  return PORT
}

describe('2. express', () => {
  let server

  after(() => {
    server.close()
  })

  before(() => {
    server = startServer()
  })

  it('2.2. get html from expected route', async (t) => {
    let html

    try {
      const res = await fetch(`http://localhost:${getPort()}/`)
      html = await res.text()
    } catch (e) {
      assert.ifError(e)
    }

    assert.strictEqual(html, '<h1>¡Hola mundo!</h1>')
  })

  it('2.2 post html from unexpected route should return 405', async (t) => {
    try {
      const res = await fetch(`http://localhost:${getPort()}/`, {
        method: 'POST'
      })

      assert.strictEqual(res.status, 405)
    } catch (e) {
      assert.ifError(e)
    }
  })

  it('2.3. get image from expected route', async (t) => {
    let image

    try {
      const res = await fetch(`http://localhost:${getPort()}/logo.webp`)

      assert.deepStrictEqual(res.headers.get('content-type'), 'image/webp')
      image = await res.text()
    } catch (e) {
      assert.ifError(e)
    }

    const expectedImage = fs.readFileSync(path.join('assets', 'logo.webp'))

    assert.deepStrictEqual(image, expectedImage.toString())
  })

  it('2.4. get 404 from unexpected route', async (t) => {
    let html

    try {
      const res = await fetch(`http://localhost:${getPort()}/404`)
      assert.strictEqual(res.status, 404)
      html = await res.text()
    } catch (e) {
      assert.ifError(e)
    }

    assert.strictEqual(html, '<h1>404</h1>')
  })

  it('2.5 handle a POST request', async (t) => {
    const data = {
      name: 'midudev',
      email: 'midudev@gmail.com',
      message: 'Hola mundo'
    }

    try {
      const res = await fetch(`http://localhost:${getPort()}/contacto`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      const json = await res.json()

      assert.strictEqual(res.status, 201)
      assert.deepStrictEqual(json, data)
    } catch (e) {
      assert.ifError(e)
    }
  })

  it('2.5 avoid handle something other than POST request', async (t) => {
    const data = {
      name: 'midudev',
      email: 'midudev@gmail.com',
      message: 'Hola mundo'
    }

    try {
      const res = await fetch(`http://localhost:${getPort()}/contacto`, {
        method: 'PUT',
        body: JSON.stringify(data)
      })

      assert.strictEqual(res.status, 405)
    } catch (e) {
      assert.ifError(e)
    }
  })
})
