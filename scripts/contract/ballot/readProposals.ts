import { hexToString } from "viem";
import { proposals } from "./conf";
import publicClient from "./publicClient";

async function fn({ receipt, abi }:{receipt:any, abi:any}) {
  console.log("Proposals: ");
  for (let index = 0; index < proposals().length; index++) {
    const proposal = (await (await publicClient()).readContract({
      address: receipt.contractAddress,
      abi,
      functionName: "proposals",
      args: [BigInt(index)],
    })) as any[];
    const name = hexToString(proposal[0], { size: 32 });
    console.log({ index, name, proposal });
  }

}

export default fn