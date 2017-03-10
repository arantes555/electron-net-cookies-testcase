const http = require('http')
const { parse } = require('url')

class TestServer {
  constructor () {
    this.server = http.createServer(this.router)
    this.port = 30001
    this.hostname = 'localhost'
    this.server.on('error', function (err) {
      console.log(err.stack)
    })
    this.server.on('connection', function (socket) {
      socket.setTimeout(1500)
    })
  }

  start () {
    return new Promise((resolve, reject) =>
      this.server.listen(this.port, this.hostname, err => err ? reject(err) : resolve())
    )
  }

  stop () {
    return new Promise((resolve, reject) =>
      this.server.close(err => err ? reject(err) : resolve())
    )
  }

  router (req, res) {
    let p = parse(req.url).pathname

    if (p === '/hello') {
      res.statusCode = 200
      res.setHeader('Content-Type', 'text/plain')
      res.end('world')
    }

    if (p === '/cookie') {
      res.statusCode = 200
      res.setHeader('Set-Cookie', [ 'a=1', 'b=1' ])
      res.end('cookie')
    }
  }
}

module.exports = TestServer

if (require.main === module) {
  const server = new TestServer()
  server.start(() => {
    console.log(`Server started listening at port ${server.port}`)
  })
}
