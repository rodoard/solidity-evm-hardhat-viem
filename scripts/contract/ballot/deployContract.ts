import { toHex } from "viem";
import { ballotJSON, proposals } from "./conf";
import { getContractDetails } from "./util";
interface Params {
  deployer:any,
  publicClient: any,
}
async function fn({
  deployer,
  publicClient
}:Params) {
  const name = "Ballot"
  const contractJSON = ballotJSON()
  const args = [proposals().map(p=>toHex(p, {size:32}))]
  console.log(`\nDeploying ${name} contract`);
  const {abi, bytecode} = await getContractDetails(contractJSON)
  const hash = await deployer.deployContract({
    abi,
    bytecode: bytecode as `0x${string}`,
    args
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return {
    abi,
    hash, receipt
  }
}

export default fn