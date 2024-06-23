import hardhat from 'hardhat'
import { chainName } from 'sushi/chain'
import { BENTOBOX_ADDRESS, BentoBoxChainId } from 'sushi/config'

const chainId = parseInt(process.argv[2]) as BentoBoxChainId
console.log(`Deployment code for network ${chainName[chainId]} (${chainId})`)
console.log('BentoBox: ', BENTOBOX_ADDRESS[chainId])

getCode()

async function getCode() {
  const RouteProcessor =
    await hardhat.ethers.getContractFactory('RouteProcessor5')
  const deplTrans = RouteProcessor.getDeployTransaction(
    BENTOBOX_ADDRESS[chainId] || '0x0000000000000000000000000000000000000000',
    [],
  )
  console.log(deplTrans.data)
}
