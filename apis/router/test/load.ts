import fs from 'fs'
import path from 'path'

enum TestMode {
  KNOWN_TOKENS = 0,
  ONE_UNKNOWN_TOKEN = 1,
  BOTH_UNKNOWN_TOKENS = 2,
}

const RPS = 5
const TEST_MODE = TestMode.KNOWN_TOKENS
const SWAP_AMOUNT = 10

const routerServer = 'http://localhost:1338'
const chainId = 1
const tokensFile = './tokens-1'

interface Token {
  address: string
  name: string
  symbol: string
  decimals: number
}

const delay = async (ms: number) => new Promise((res) => setTimeout(res, ms))

function loadAllTokens(): Token[] {
  const fileName = path.resolve(__dirname, tokensFile)
  const file = fs.readFileSync(fileName, 'utf8')
  const res: Token[] = file
    .split('\n')
    .map((s) => (s === '' ? undefined : (JSON.parse(s) as Token)))
    .filter((t) => t !== undefined) as Token[]
  res.unshift({
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    name: 'Native',
    symbol: 'Native',
    decimals: 18,
  })
  return res
}

async function route(tokenIn: Token, tokenOut: Token, amount: bigint) {
  const query = `/swap/v3.2?chainId=${chainId}&tokenIn=${
    tokenIn.address
  }&tokenOut=${tokenOut.address}&amount=${amount.toString()}`
  const urlR = routerServer + query

  try {
    const start = performance.now()
    //for (let i = 0; i < 3; ++i) {
    const resR = await fetch(urlR)
    if (resR.status !== 200) {
      console.log('Response status: ', resR.status, urlR)
      return
    }
    const dataR = (await resR.json()) as { status: string }
    console.log(
      `${tokenIn.symbol} -> ${tokenOut.symbol} ${amount.toString()} ${
        dataR.status
      } ${Math.round(performance.now() - start)}ms`,
    )
    //await delay(1000)
    //}
  } catch (e) {
    console.log(
      `${tokenIn.symbol} -> ${
        tokenOut.symbol
      } ${amount.toString()} Error: ${e}`,
    )
    //await delay(1000)
  }
}

// Arbitrary 2 tokens
function getRandomPair1(num: number): [number, number] {
  const first = Math.floor(Math.random() * num)
  let second = Math.floor(Math.random() * (num - 1))
  if (second >= first) ++second
  return [first, second]
}

// arbitrary token against arbitrary first 5 tokens
function getRandomPair2(num: number): [number, number] {
  const best = Math.min(num - 1, 6)
  const first = Math.floor(Math.random() * best)
  let second = Math.floor(Math.random() * (num - 1))
  if (second >= first) ++second
  return Math.random() < 0.5 ? [first, second] : [second, first]
}

function getRandomPair3(num: number): [number, number] {
  const best = Math.min(num - 1, 6)
  const first = Math.floor(Math.random() * best)
  let second = Math.floor(Math.random() * (best - 1))
  if (second >= first) ++second
  return Math.random() < 0.5 ? [first, second] : [second, first]
}

function getRandomPair(num: number, mode: TestMode): [number, number] {
  const func =
    mode === TestMode.KNOWN_TOKENS
      ? getRandomPair3
      : mode === TestMode.ONE_UNKNOWN_TOKEN
      ? getRandomPair2
      : getRandomPair1
  return func(num)
}

async function test() {
  const tokens = loadAllTokens()
  for (;;) {
    const timeout = delay(1000 / RPS)
    const [from, to] = getRandomPair(tokens.length, TEST_MODE)
    const amount = BigInt(SWAP_AMOUNT * 10 ** tokens[from].decimals)
    route(tokens[from], tokens[to], amount)
    await timeout
  }
}

test()
