import publicClient from "./publicClient"
import walletClient from "./walletCLient"
import deployContract from "./deployContract"

async function main() {
  const pbClient = await publicClient()
  const wClient = await walletClient()
  const { hash, receipt} = await deployContract({
    deployer: wClient,
    publicClient:pbClient
  })
  console.log('Deploy hash ', hash, "  receipt ", receipt )
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});