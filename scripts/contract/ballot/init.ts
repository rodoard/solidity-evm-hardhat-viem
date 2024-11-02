import publicClient from "./publicClient"
import walletClient from "./walletCLient"
import deployContract from "./deployContract"
import readProposals from "./readProposals"

async function main() {
  const pbClient = await publicClient()
  const wClient = await walletClient()
  const { abi, hash, receipt} = await deployContract({
    deployer: wClient,
    publicClient:pbClient
  })
  console.log("Contract deployed abi", abi, "\nhash: ", hash, "\nreceipt: ", receipt )
  console.log("Read proposals")
  await readProposals({abi, receipt})
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});