import http from 'http'
import express from 'express'
import logger from 'morgan'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

const app = express()
const port = process.env.PORT || '4000'

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({extended: false}))

/** catch 404 and forward to error handler */
app.use('*', (req, res) => {
  return res.status(404).json({
    success: false,
    message: "API endpoint doesn't exist",
  })
})

/** Create HTTP server. */
const server = http.createServer(app)
server.listen(port)
server.on('listening', () => {
  console.log(`Listening on port:: http://localhost:${port}/`)
})
