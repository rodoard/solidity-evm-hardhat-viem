import { expect } from "chai";
import hre, { viem } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { toHex, fromHex, isAddressEqual, etherUnits, hexToString, maxInt56} from "viem";
import { ethers } from "ethers";

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

async function ethersGetOtherContract(contractAddress: any, otherAddress: any) {
  return await hre.ethers.getContractAt(
    "Ballot", contractAddress, 
    otherAddress
  )
} 


async function deployContract() {
  const proposalNames = PROPOSALS.map(
    function (str) {
    return toHex(str, { size: 32 })
    }
  );

  const contract = await hre.viem.deployContract("Ballot", [
        proposalNames
      ]);
  return { contract };
}

describe("Ballot", async () => {
  describe("when the contract is deployed", async () => {
    it("has the provided proposals", async () => {
      const { contract } = await loadFixture(
        deployContract
      )
      for (let i = 0; i < PROPOSALS.length; i++) {
        const proposal = await contract.read.proposals([BigInt(i)])
          expect(PROPOSALS.includes(hexToString(proposal[0], {size:32})))
      }
    });

    it("has zero votes for all proposals", async () => {
      const { contract } = await loadFixture(
        deployContract
      )
      for (let i = 0; i < PROPOSALS.length; i++) {
        const proposal = await contract.read.proposals([BigInt(i)])
          expect(proposal[1]).eq(0n)
      }
    });

    it("sets the deployer address as chairperson", async () => {
      const [owner] = await hre.viem.getWalletClients()
      const { contract } = await loadFixture(
        deployContract
      )
      expect(
       isAddressEqual(owner.account.address, await contract.read.chairperson())
      )
        
    });

    it("sets the voting weight for the chairperson as 1", async () => {
      const { contract } = await loadFixture(
        deployContract
      )
      const chairperson = await contract.read.chairperson()
      const voter = await contract.read.getVoter([chairperson])
      expect(voter.weight).eq(1n)
    });
  });

  describe("when the chairperson interacts with the giveRightToVote function in the contract", async () => {
    it("gives right to vote for another address", async () => {
      const [owner, other] = await hre.ethers.getSigners();
      const { contract } = await loadFixture(
        deployContract
      )
      const otherContract = await ethersGetOtherContract(
        contract.address,
       other
      );
      const noVotingRight = "Has no right to vote"
      const proposal = 1 
      const previousProposalVoteCount = await otherContract.getProposalVoteCount(proposal);
      await expect(otherContract.vote(proposal)).to.be.revertedWith(noVotingRight)
      await contract.write.giveRightToVote([
        hre.ethers.getAddress(
          other.address
        ) as `0x${string}`
      ])
      await expect(otherContract.vote(proposal)).to.not.be.reverted

    });
    it("can not give right to vote for someone that has voted", async () => {
      const [owner, other] = await hre.ethers.getSigners();
      const { contract } = await loadFixture(
        deployContract
      )
      const otherContract = await ethersGetOtherContract(
        contract.address,
       other
      );
      const ethersContract = await ethersGetOtherContract(
        contract.address,
       owner
      );
      const proposal = 1 
      await ethersContract.giveRightToVote(
        hre.ethers.getAddress(
          other.address
        ) as `0x${string}`
      )
      await otherContract.vote(proposal)
      await expect(
        ethersContract.giveRightToVote(
          hre.ethers.getAddress(
            other.address
          ) as `0x${string}`
        )
      ).to.revertedWith("The voter already voted.")

    });
    it("can not give right to vote for someone that has already voting rights", async () => {
      const [owner, other] = await hre.ethers.getSigners();
      const { contract } = await loadFixture(
        deployContract
      )
      const ethersContract = await ethersGetOtherContract(
        contract.address,
       owner
      );
      await expect(ethersContract.giveRightToVote(
        hre.ethers.getAddress(
          owner.address
        ) as `0x${string}`
      )).to.be.reverted
    });
  });

  describe("when the voter interacts with the vote function in the contract", async () => {
    // TODO
    it("should register the vote", async () => {
      const [owner, other] = await hre.viem.getWalletClients()
      const { contract } = await loadFixture(
        deployContract
      )
      const proposal = BigInt(1)
      const voterBefore =await contract.read.getVoter(
        [
          owner.account.address
        ]
      )
      expect(voterBefore.voted).to.eql(false)
      await expect(contract.write.vote([proposal]))
      const voterAfter =
        await contract.read.getVoter(
          [
            owner.account.address
          ]
        )
      expect(voterAfter.voted).to.eql(true)
      expect(voterAfter.vote).to.eql(proposal)

    });
  });

  describe("when the voter interacts with the delegate function in the contract", async () => {
    // TODO
    it("should transfer voting power", async () => {
      const [owner, other] = await hre.ethers.getSigners();
      const { contract } = await loadFixture(
        deployContract
      )
      const otherContract = await ethersGetOtherContract(
        contract.address,
       other
      );
      const proposal = BigInt(1)
      await expect(otherContract.vote(proposal)).to.be.revertedWith("Has no right to vote")
      await contract.write.giveRightToVote([
        hre.ethers.getAddress(
          other.address
        ) as `0x${string}`
      ])
      await contract.write.delegate([
        hre.ethers.getAddress(
          other.address
        ) as `0x${string}`
      ]);
      await expect(otherContract.vote(proposal)).to.not.be.reverted
    });
  });

  describe("when an account other than the chairperson interacts with the giveRightToVote function in the contract", async () => {
    // TODO
    it("should revert", async () => {
      const [owner, other] = await hre.ethers.getSigners();
      const { contract } = await loadFixture(
        deployContract
      )
      const otherContract = await ethersGetOtherContract(
        contract.address,
       other
      );
      await expect(otherContract.giveRightToVote(
        owner.address
      )).to.be.revertedWith(
        "Only chairperson can give right to vote."
      )
    });
  });

  describe("when an account without right to vote interacts with the vote function in the contract", async () => {
    // TODO
    it("should revert", async () => {
      const [owner, other] = await hre.ethers.getSigners();
      const { contract } = await loadFixture(
        deployContract
      )
      const otherContract = await ethersGetOtherContract(
        contract.address,
       other
      );
      const proposal = BigInt(1)
      await expect(otherContract.vote(
        proposal
      )).to.be.reverted
    });
  });

  describe("when an account without right to vote interacts with the delegate function in the contract", async () => {
    // TODO
    it("should revert", async () => {
      const [owner, other] = await hre.ethers.getSigners();
      const { contract } = await loadFixture(
        deployContract
      )
      const otherContract = await ethersGetOtherContract(
        contract.address,
       other
      );
      const proposal = BigInt(1)
      await expect(otherContract.delegate(
         owner.address
      )).to.be.reverted
    });
  });

  describe("when someone interacts with the winningProposal function before any votes are cast", async () => {
    // TODO
    it("should return 0", async () => {
      const { contract } = await loadFixture(
        deployContract
      )
      const winningProposal = await contract.read.winningProposal()
      expect(winningProposal).to.eql(0n)
    });
  });

  describe("when someone interacts with the winningProposal function after one vote is cast for the first proposal", async () => {
    // TODO
    it("should return 0", async () => {
      const { contract } = await loadFixture(
        deployContract
      )
      const proposal = BigInt(0)
      await contract.write.vote([proposal])
      const winningProposal = await contract.read.winningProposal()
      expect(winningProposal).to.eql(0n)
    });
  });

  describe("when someone interacts with the winnerName function before any votes are cast", async () => {
    // TODO
    it("should return name of proposal 0", async () => {
      const { contract } = await loadFixture(
        deployContract
      )
      const winningProposal = await contract.read.winnerName()
      expect(hexToString(winningProposal, {size:32})).to.eql(PROPOSALS[0])
    });
  });

  describe("when someone interacts with the winnerName function after one vote is cast for the first proposal", async () => {
    // TODO
    it("should return name of proposal 0", async () => {
      const { contract } = await loadFixture(
        deployContract
      )
      const proposal = BigInt(0)
      await contract.write.vote([proposal])
      const winningProposal = await contract.read.winningProposal()
      expect(winningProposal).to.eql(0n)
    });
  });

  describe("when someone interacts with the winningProposal function and winnerName after 5 random votes are cast for the proposals", async () => {
    // TODO
    it("should return the name of the winner proposal", async () => {
      const signers = (await hre.ethers.getSigners()).slice(0, 5);
      const owner = signers[0]
      const { contract } = await loadFixture(
        deployContract
      )
      const ownerContract = await ethersGetOtherContract(
        contract.address,
       owner
      );
      const count: { [key: number]: number } = {} 
      let winner = 0
      let winningCount = 0
      const contracts = await  Promise.all(signers.map(async signer => {
        if (signer != owner) {
          await ownerContract.giveRightToVote(
            signer
          )
        }
        return await ethersGetOtherContract(
          contract.address,
          signer
        )
      }
      ))
      
      for (let i = 0; i < contracts.length; i++) {
        const contract  = contracts[i]
        const proposal = Math.floor(Math.random() * PROPOSALS.length)
        await contract.vote(BigInt(proposal))
        const proposalVotes = await contract.proposals(BigInt(proposal))
        if (winningCount < proposalVotes[1]) {
          winningCount = proposalVotes[1]
          winner = proposal
        }
      }
      const winningProposal = await contracts[1].winningProposal()
      expect(winningProposal).to.eql(BigInt(winner))
      const winningName = await contracts[1].winnerName()
      expect(hexToString(winningName, {
        size:32
      })).to.eql(PROPOSALS[winningProposal])
     
    });
  });
});