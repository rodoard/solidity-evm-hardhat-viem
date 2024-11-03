import { hexToString } from "viem";
import pbClient from "./publicClient";
import { getContractDetails, getVotingRightsParams } from "./util";
import { ballotJSON } from "./conf";
import yesno from "yesno"
import walletClient from "./walletCLient"

async function fn() {
  const publicClient = await pbClient()
  const { abi } = await getContractDetails(ballotJSON())
  const {contractAddress, toAddress} = await getVotingRightsParams(process.argv.slice(-2))
  console.log("Giving voting rights to : ", toAddress);
  const ok = await yesno({defaultValue: false ,question:"Confirm? (Y/n)"});
  
  if (ok) {
    const voter = await walletClient();
        const hash = await voter.writeContract({
          address: contractAddress,
          abi,
          functionName: "giveRightToVote",
          args: [toAddress],
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