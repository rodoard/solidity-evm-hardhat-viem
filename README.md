# Sample Hardhat Project

This project demonstrates a basic Hardhat use case.  We develop a Ballot smart contract along with hard hat tests and viem scripts for interacting live with other users

Try running some of the following tasks:

```shell
//runs tests
npx hardhat test
REPORT_GAS=true npx hardhat test
```


```shell
//viem scripts
//deploys to sopolia testnet ballot contract which has proposals 
//that voters can cast vote on
//and reads list of proposals from testnet
npx ts-node scripts/contract/ballot/init.ts

//used to cast vote on deployed ballot smart contract and the proposal index to 
//vote  on with deployed smart contract address and proposal index as arguments
//script performs a vote and waitsg for transaction confirmation
npx ts-node scripts/contract/ballot/castVote.ts 0x12a9c8a9736bc16b755a2ca573e6fdb63d1dad50  0
```