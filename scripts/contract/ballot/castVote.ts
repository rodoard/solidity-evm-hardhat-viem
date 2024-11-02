import { hexToString } from "viem";
import pbClient from "./publicClient";
import { getContractDetails, getParameters } from "./util";
import { ballotJSON } from "./conf";
import yesno from "yesno"
import walletClient from "./walletCLient"

async function fn() {
  const publicClient = await pbClient()
  const { abi} = await getContractDetails(ballotJSON())
  const {contractAddress, proposalIndex} = await getParameters(process.argv.slice(-2))
  console.log("Proposal selected: ");
  const proposal = (await publicClient.readContract({
    address: contractAddress,
    abi,
    functionName: "proposals",
    args: [BigInt(proposalIndex)],
  })) as any[];
  const name = hexToString(proposal[0], { size: 32 });
  console.log("Casting vote on proposal: ", name);
  const ok = await yesno({defaultValue: false ,question:"Confirm? (Y/n)"});
  
  if (ok) {
    const voter = await walletClient();
        const hash = await voter.writeContract({
          address: contractAddress,
          abi,
          functionName: "vote",
          args: [BigInt(proposalIndex)],
        });
        console.log("Transaction hash:", hash);
        console.log("Waiting for confirmations...");
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        console.log("Transaction confirmed");
   }  else {
    console.log("Operation cancelled");
  }
}

fn().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});