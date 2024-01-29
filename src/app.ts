import express from 'express'
import compression from 'compression'
import cors from 'cors'

const app = express()

app.set('port', process.env.PORT ?? 3000)
app.use(
  cors({
    credentials: true,
  }),
)
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

export default app
