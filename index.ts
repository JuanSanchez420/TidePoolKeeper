import { pk, TidePool } from "./config"
import { TIDEPOOL_FACTORY_ABI, TIDEPOOL_ABI } from "./abi"
import { Network, networks } from "./network"
import { createPublicClient, http, getContract, createWalletClient } from "viem"
import { arbitrum, bsc, Chain, mainnet, optimism, polygon } from "viem/chains"
import { privateKeyToAccount } from "viem/accounts"

let tidePools: TidePool[] = []

const printException = (e: any) => {
  if (e.error) console.log(`error: ${e.error}`)
  if (e.reason) console.log(`reason: ${e.reason}`)
  if (e.code) console.log(`code: ${e.code}`)
  if (e.body) console.log(`body: ${e.body}`)
  if (e.message) console.log(`message: ${e.message}`)
}

const fetchAllTidePools = async () => {
  tidePools = []
  await fetchTidePools(networks.POLYGON)
  await fetchTidePools(networks.ARBITRUM)
  await fetchTidePools(networks.ETHEREUM)
  await fetchTidePools(networks.OPTIMISM)
  await fetchTidePools(networks.BSC)
}

const getChain = (network: Network): Chain => {
  switch (network.name) {
    case "Ethereum":
      return mainnet
    case "Arbitrum":
      return arbitrum
    case "Optimism":
      return optimism
    case "Polygon":
      return polygon
    default:
      return bsc
  }
}

const fetchTidePools = async (network: Network) => {
  const client = createPublicClient({
    chain: getChain(network),
    transport: http(network.rpc),
  })

  const tpf = getContract({
    address: network.factory,
    abi: TIDEPOOL_FACTORY_ABI,
    publicClient: client,
  })

  const temp: string[] = []
  let error = false
  let index = 0
  while (!error) {
    try {
      const tp = await tpf.read.tidePools([BigInt(index)])
      index++
      temp.push(tp)
    } catch (e: any) {
      if (e.code !== "SERVER_ERROR") {
        error = true
      } else {
        continue
      }
    }
  }
  tidePools.push({ network, contracts: temp })
  console.log(`found ${temp.length} tidepools on ${network.name}`)
}

const rebalance = async () => {
  for (const t of tidePools) {
    try {
      const account = privateKeyToAccount(`0x${pk}`)

      const client = createPublicClient({
        chain: getChain(t.network),
        transport: http(t.network.rpc),
      })

      const wallet = createWalletClient({
        account,
        chain: getChain(t.network),
        transport: http(t.network.rpc),
      })

      for (const contractAddress of t.contracts) {
        const contractRead = getContract({
          address: contractAddress as `0x${string}`,
          abi: TIDEPOOL_ABI,
          publicClient: client,
        })
        const contractWrite = getContract({
          address: contractAddress as `0x${string}`,
          abi: TIDEPOOL_ABI,
          walletClient: wallet,
        })

        const needsRebalance = await contractRead.read.needsRebalance()
        const now = new Date()

        if (needsRebalance) {
          const gas = await client.estimateContractGas({
            address: contractAddress as `0x${string}`,
            abi: TIDEPOOL_ABI,
            functionName: "rebalance",
            account,
          })
          await contractWrite.write.rebalance({ gas })

          console.log(
            `Rebalance completed for ${contractAddress} on ${
              t.network.name
            } at ${now.toLocaleString()}`
          )
        }
      }
    } catch (e) {
      printException(e)
      console.log(`Error rebalancing on network: ${t.network.name}`)
      continue
    }
  }
}

const main = async () => {
  await fetchAllTidePools()
  await rebalance()
  setInterval(rebalance, 300000)
}

console.log("Starting rebalance bot...")
main().catch((e) => console.log(e))
