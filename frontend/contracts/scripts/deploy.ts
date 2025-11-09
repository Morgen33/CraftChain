import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with account:', deployer.address);

  const CraftChainNFT = await ethers.getContractFactory('CraftChainNFT');
  const nft = await CraftChainNFT.deploy(deployer.address);

  await nft.waitForDeployment();

  console.log('CraftChainNFT deployed to:', await nft.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

