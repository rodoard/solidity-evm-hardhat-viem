import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";
dotenv.config();

const providerApiKey = process.env.ALCHEMY_API_KEY || "";
const rpcEndpoint = process.env.RPC_ENDPOINT 

let publicClient:any = null 
async function fn() {
  if (publicClient === null) {
    console.log("Creating public client");
    publicClient = createPublicClient({
      chain: sepolia,
      transport: http(`${rpcEndpoint}${providerApiKey}`),
    });
  }
  const blockNumber = await publicClient.getBlockNumber();
  console.log("Last block number:", blockNumber);
  return publicClient
}

export  default fn 