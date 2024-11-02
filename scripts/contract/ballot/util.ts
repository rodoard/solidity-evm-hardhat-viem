export async function getParameters(parameters:string[]) {
  if (!parameters || parameters.length < 2)
    throw new Error("Parameters not provided");
  const contractAddress = parameters[0] as `0x${string}`;
  if (!contractAddress) throw new Error("Contract address not provided");
  console.log(" >>>>>>",contractAddress, "<<<<<<")
  if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress))
    throw new Error("Invalid contract address");
  const proposalIndex = parameters[1];
  if (isNaN(Number(proposalIndex))) throw new Error("Invalid proposal index");
  return {
    contractAddress,
    proposalIndex
 }
}

export async function getContractDetails(path: string) {
  const contractData = await import(path);
  return { abi: contractData.abi, bytecode: contractData.bytecode };
}