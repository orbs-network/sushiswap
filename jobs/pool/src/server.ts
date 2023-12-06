import 'dotenv/config'

import timeout from 'connect-timeout'
import express from 'express'

import { steer } from './steer.js'

process.env['NEXT_PUBLIC_EVM_APP_BASE_URL'] = 'https://www.sushi.com/'

const app = express()

app.get(
  '/steer',
  async (req, res) => {
    req.setTimeout(600_000)
    try {
      await steer()
      res.sendStatus(200)
    } catch (err) {
      res.status(500).send(err)
    }
  },
  timeout('600s'),
)

app.listen(8080)
