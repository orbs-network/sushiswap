import { Protocol } from '@sushiswap/database'
import timeout from 'connect-timeout'
import express from 'express'
import { z } from 'zod'

import { execute as incentives } from './incentives.js'
import { execute as pools } from './pools.js'
import { prices } from './price.js'

const app = express()

const protocolSchema = z.object({
  protocol: z.nativeEnum(Protocol),
})

app.get(
  '/pools',
  async (req, res) => {
    req.setTimeout(600000)

    const result = protocolSchema.safeParse(req.query)
    if (result.success === false) {
      return res.status(400).send(result.error.format())
    }

    const { protocol } = result.data
    try {
      await pools(protocol)
      res.sendStatus(200)
    } catch (err) {
      res.status(500).send(err)
    }
  },
  timeout('600s')
)

app.get(
  '/incentives',
  async (req, res) => {
    req.setTimeout(600000)
    try {
      await incentives()
      res.sendStatus(200)
    } catch (err) {
      res.status(500).send(err)
    }
  },
  timeout('600s')
)

app.get(
  '/prices',
  async (req, res) => {
    req.setTimeout(600000)
    try {
      await prices()
      res.sendStatus(200)
    } catch (err) {
      res.status(500).send(err)
    }
  },
  timeout('600s')
)

app.listen(8080)
