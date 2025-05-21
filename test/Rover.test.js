const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");



describe("ROVER Contract", function () {
    async function deployROVERFixture() {
      const [admin, alice, bob, AdminContract] = await ethers.getSigners();
      const ROVER = await ethers.getContractFactory("ROVER");
      const rover = await ROVER.deploy();

      await rover.setAdminContract(AdminContract.address);
      return { AdminContract, admin, alice, bob, rover };
    }








    

    describe("Deployment", function () {
        it("Should set correct initial roles", async function () {
          const { rover, admin } = await loadFixture(deployROVERFixture);
          expect(await rover.hasRole(await rover.DEFAULT_ADMIN_ROLE(), admin.address)).to.be.true;
        });
    
        it("Should initialize Admin contract", async function () {
          const { rover, AdminContract } = await loadFixture(deployROVERFixture);
          expect(await rover.AdminContract()).to.equal(AdminContract.address);
        });
      });
  











    

      describe("Claim Mechanism", function () {
        it("Should allow Admin Contract to mint initial tokens", async function () {
          const { rover, AdminContract, alice } = await loadFixture(deployROVERFixture);
          
          await expect(rover.connect(AdminContract).claimInitial(alice.address))
            .to.emit(rover, "Claimed")
            .withArgs(alice.address);
    
          expect(await rover.balanceOf(alice)).to.equal(100n * 10n ** 18n);
          expect(await rover.hasClaimed(alice)).to.be.true;
        });
    
        
        
        
        it("Should block non-admin Contracts from claiming", async function () {
          const { rover, bob, alice } = await loadFixture(deployROVERFixture);
          await expect(rover.connect(bob).claimInitial(alice))
            .to.be.revertedWithCustomError(rover, "UrNotAdminContract");
        });
      });












      describe("Burn Functionality", function () {
        it("Should allow Admin Contract to burn tokens", async function () {
          const { rover, AdminContract, alice } = await loadFixture(deployROVERFixture);
          await rover.connect(AdminContract).claimInitial(alice.address);
          
          const burnAmount = 50n * 10n ** 18n;
          await expect(rover.connect(AdminContract).burnFrom(alice.address, burnAmount))
            .to.emit(rover, "Burned")
            .withArgs(alice.address, burnAmount);
    
          expect(await rover.balanceOf(alice.address)).to.equal(50n * 10n ** 18n);
        });
    
        it("Should prevent non-Admin from burning", async function () {
          const { rover, bob, alice } = await loadFixture(deployROVERFixture);
          await expect(rover.connect(bob).burnFrom(alice.address, 100))
            .to.be.revertedWithCustomError(rover, "UrNotAdminContract");
        });
      });










      describe("Transfer Restrictions", function () {
        it("Should block regular transfers", async function () {
          const { rover, AdminContract, alice, bob } = await loadFixture(deployROVERFixture);
          await rover.connect(AdminContract).claimInitial(alice.address);
          
          await expect(rover.connect(alice).transfer(bob.address, 100))
            .to.be.revertedWithCustomError(rover, "RoverIsNonTransferable");
        });
    
        it("Should allow minting (zero-address to user)", async function () {
          const { rover, AdminContract, alice } = await loadFixture(deployROVERFixture);
          await expect(rover.connect(AdminContract).claimInitial(alice.address))
            .to.changeTokenBalance(rover, alice, 100n * 10n ** 18n);
        });
    
        it("Should allow burning (user to zero-address)", async function () {
          const { rover, AdminContract, alice } = await loadFixture(deployROVERFixture);
          await rover.connect(AdminContract).claimInitial(alice.address);
          
          await expect(rover.connect(AdminContract).burnFrom(alice.address, 50n * 10n ** 18n))
            .to.changeTokenBalance(rover, alice, -50n * 10n ** 18n);
        });
      });












  describe("Admin Functions", function () {
    it("Should allow admin to pause/unpause", async function () {
      const { rover, admin, AdminContract, alice } = await loadFixture(deployROVERFixture);
      
      await rover.connect(admin).pause();
      await expect(rover.connect(AdminContract).claimInitial(alice.address))
        .to.be.revertedWithCustomError(rover, "EnforcedPause");

      await rover.connect(admin).unpause();
      await expect(rover.connect(AdminContract).claimInitial(alice.address))
        .not.to.be.reverted;
    });

    it("Should prevent non-admin from changing Admin Contract", async function () {
      const { rover, bob } = await loadFixture(deployROVERFixture);
      await expect(rover.connect(bob).setAdminContract(bob.address))
        .to.be.reverted;
    });
    
    it("Should emit event when Admin Contract changes", async function () {
      const { rover, admin, bob } = await loadFixture(deployROVERFixture);
      await expect(rover.connect(admin).setAdminContract(bob.address))
        .to.emit(rover, "AdminContractUpdated")
        .withArgs(bob.address);
    });
  });






});