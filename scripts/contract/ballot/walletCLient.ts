import { http, createWalletClient, formatEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

import * as dotenv from "dotenv";
import publicClient from "./publicClient";
dotenv.config();

const deployerPrivateKey = process.env.PRIVATE_KEY || "";
const rpcEndpoint = process.env.RPC_ENDPOINT 
const providerApiKey = process.env.ALCHEMY_API_KEY || ""

let deployer:any = null 
async function fn() {
  if (deployer === null) {
    console.log("Creating wallet client");
    const account = privateKeyToAccount(`0x${deployerPrivateKey}`);
    deployer = createWalletClient({
      account,
      chain: sepolia,
      transport: http(`${rpcEndpoint}${providerApiKey}`),
    });
  }
  console.log("Deployer address:", deployer.account.address);
  const balance = await (await publicClient()).getBalance({
    address: deployer.account.address,
  });
  console.log(
    "Deployer balance:",
    formatEther(balance),
    deployer.chain.nativeCurrency.symbol
  );
  return deployer
}

export default fn