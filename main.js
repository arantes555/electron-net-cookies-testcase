'use strict'

const { app, net, session } = require('electron')
const TestServer = require('./server')

const local = new TestServer()
const base = `http://${local.hostname}:${local.port}`

app.on('ready', async () => {
  const defaultSession = session.defaultSession
  defaultSession.clearStorageData({ storages: 'cookies' })

  defaultSession.webRequest.onSendHeaders({ urls: ['http://*/*'] }, ({ requestHeaders }) => {
    console.log('REQUEST-HEADERS', requestHeaders)
  })

  const doRequest = (url) => new Promise(resolve => {
    const request = net.request({ url, session: defaultSession })
    request.on('response', (response) => {
      console.log(`Response SET-COOKIE: ${response.headers['set-cookie'] || response.headers['Set-Cookie']}`) // Broken on electron7, so logs are less visible : https://github.com/electron/electron/issues/20631
      let body = ''
      response.on('data', chunk => body += chunk)
      response.on('end', () => {
        resolve(body)
      })
    })
    request.end()
  })

  const getStoredCookies = () => defaultSession.cookies.get({})
    .then(res => JSON.stringify(res.map(({name, value, domain}) => ({name, value, domain}))))


  await local.start()
  console.log('Server started')

  await doRequest(`${base}/hello`)

  console.log(`STORED COOKIES: ${await getStoredCookies()}`) // Cookies are empty

  await doRequest(`${base}/cookie`) // Going to store cookies

  console.log(`STORED COOKIES: ${await getStoredCookies()}`) // There are some cookies now

  await doRequest(`${base}/cookie`) // No cookies are sent

  await local.stop()
  app.quit()
})
