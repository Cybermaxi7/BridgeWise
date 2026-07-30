import { expect } from "chai";
import hre from "hardhat";

describe("BridgeGateway", () => {
  let ethers: any;
  let owner: any;
  let user: any;
  let token: any;
  let wrappedToken: any;
  let srcGateway: any;
  let dstGateway: any;

  const SRC_CHAIN_ID = 1;
  const DST_CHAIN_ID = 2;
  const AMOUNT = 100n * 10n ** 18n;
  const RECIPIENT_BYTES32 = "0x" + "ab".repeat(32);
  const MSG_HASH = "0x" + "cd".repeat(32);

  before(async () => {
    const connection = await hre.network.create();
    ethers = connection.ethers;
  });

  async function deploy() {
    [owner, user] = await ethers.getSigners();

    const TokenFactory = await ethers.getContractFactory("MockERC20");
    token = await TokenFactory.deploy("Test Token", "TST");
    await token.waitForDeployment();

    const WrappedFactory = await ethers.getContractFactory("BridgeWrappedToken");
    wrappedToken = await WrappedFactory.deploy(
      "Bridged Test", "bwTST",
      owner.address,
      owner.address
    );
    await wrappedToken.waitForDeployment();

    const GatewayFactory = await ethers.getContractFactory("BridgeGateway");
    srcGateway = await GatewayFactory.deploy(SRC_CHAIN_ID, await wrappedToken.getAddress());
    await srcGateway.waitForDeployment();
    dstGateway = await GatewayFactory.deploy(DST_CHAIN_ID, await wrappedToken.getAddress());
    await dstGateway.waitForDeployment();

    await wrappedToken.grantRole(await wrappedToken.MINTER_ROLE(), await srcGateway.getAddress());
    await wrappedToken.grantRole(await wrappedToken.BURNER_ROLE(), await srcGateway.getAddress());
    await wrappedToken.grantRole(await wrappedToken.MINTER_ROLE(), await dstGateway.getAddress());
    await wrappedToken.grantRole(await wrappedToken.BURNER_ROLE(), await dstGateway.getAddress());

    await token.mint(user.address, AMOUNT * 2n);
    await token.connect(user).approve(await srcGateway.getAddress(), AMOUNT * 2n);
  }

  describe("lock (source)", () => {
    beforeEach(async () => {
      await deploy();
    });

    it("starts with nonce 0", async () => {
      expect(await srcGateway.outboundNonces(DST_CHAIN_ID)).to.equal(0);
    });

    it("increments nonce per lock", async () => {
      const addr = await token.getAddress();
      await srcGateway.connect(user).lock(DST_CHAIN_ID, addr, AMOUNT, RECIPIENT_BYTES32);
      expect(await srcGateway.outboundNonces(DST_CHAIN_ID)).to.equal(1);

      await srcGateway.connect(user).lock(DST_CHAIN_ID, addr, AMOUNT, RECIPIENT_BYTES32);
      expect(await srcGateway.outboundNonces(DST_CHAIN_ID)).to.equal(2);
    });

    it("transfers tokens into the gateway", async () => {
      await srcGateway.connect(user).lock(DST_CHAIN_ID, await token.getAddress(), AMOUNT, RECIPIENT_BYTES32);
      expect(await token.balanceOf(await srcGateway.getAddress())).to.equal(AMOUNT);
    });

    it("emits MessageSent with indexed msgHash, srcChainId, dstChainId", async () => {
      const addr = await token.getAddress();
      const tx = await srcGateway.connect(user).lock(DST_CHAIN_ID, addr, AMOUNT, RECIPIENT_BYTES32);

      const nonce = 0;
      const msgHash = ethers.solidityPackedKeccak256(
        ["uint32", "uint32", "uint64", "address", "uint256", "bytes32"],
        [SRC_CHAIN_ID, DST_CHAIN_ID, nonce, addr, AMOUNT, RECIPIENT_BYTES32]
      );

      await expect(tx)
        .to.emit(srcGateway, "MessageSent")
        .withArgs(msgHash, SRC_CHAIN_ID, DST_CHAIN_ID, nonce);
    });

    it("reverts on zero token address", async () => {
      await expect(
        srcGateway.connect(user).lock(DST_CHAIN_ID, ethers.ZeroAddress, AMOUNT, RECIPIENT_BYTES32)
      ).to.be.revertedWithCustomError(srcGateway, "ZeroAddress");
    });

    it("reverts on zero amount", async () => {
      await expect(
        srcGateway.connect(user).lock(DST_CHAIN_ID, await token.getAddress(), 0, RECIPIENT_BYTES32)
      ).to.be.revertedWithCustomError(srcGateway, "ZeroAmount");
    });
  });

  describe("burn (source)", () => {
    beforeEach(async () => {
      await deploy();
      await wrappedToken.mint(user.address, AMOUNT);
      await wrappedToken.connect(user).approve(await srcGateway.getAddress(), AMOUNT);
    });

    it("burns wrapped tokens", async () => {
      await srcGateway.connect(user).burn(DST_CHAIN_ID, user.address, AMOUNT, RECIPIENT_BYTES32);
      expect(await wrappedToken.balanceOf(user.address)).to.equal(0);
    });

    it("emits MessageSent with indexed parameters", async () => {
      const tx = await srcGateway.connect(user).burn(DST_CHAIN_ID, user.address, AMOUNT, RECIPIENT_BYTES32);

      const nonce = 0;
      const msgHash = ethers.solidityPackedKeccak256(
        ["uint32", "uint32", "uint64", "address", "uint256", "bytes32"],
        [SRC_CHAIN_ID, DST_CHAIN_ID, nonce, user.address, AMOUNT, RECIPIENT_BYTES32]
      );

      await expect(tx)
        .to.emit(srcGateway, "MessageSent")
        .withArgs(msgHash, SRC_CHAIN_ID, DST_CHAIN_ID, nonce);
    });

    it("reverts on zero account", async () => {
      await expect(
        srcGateway.connect(user).burn(DST_CHAIN_ID, ethers.ZeroAddress, AMOUNT, RECIPIENT_BYTES32)
      ).to.be.revertedWithCustomError(srcGateway, "ZeroAddress");
    });
  });

  describe("mint (destination)", () => {
    beforeEach(async () => {
      await deploy();
    });

    it("mints wrapped tokens and emits MessageDelivered", async () => {
      const tx = await dstGateway.mint(MSG_HASH, SRC_CHAIN_ID, user.address, AMOUNT);

      expect(await wrappedToken.balanceOf(user.address)).to.equal(AMOUNT);
      await expect(tx)
        .to.emit(dstGateway, "MessageDelivered")
        .withArgs(MSG_HASH, SRC_CHAIN_ID, DST_CHAIN_ID, true);
    });
  });

  describe("unlock (destination)", () => {
    beforeEach(async () => {
      await deploy();
      await token.mint(await dstGateway.getAddress(), AMOUNT);
    });

    it("transfers tokens and emits MessageDelivered", async () => {
      const tx = await dstGateway.unlock(MSG_HASH, SRC_CHAIN_ID, await token.getAddress(), user.address, AMOUNT);

      expect(await token.balanceOf(user.address)).to.equal(AMOUNT * 3n);
      await expect(tx)
        .to.emit(dstGateway, "MessageDelivered")
        .withArgs(MSG_HASH, SRC_CHAIN_ID, DST_CHAIN_ID, true);
    });
  });

  describe("fail (destination)", () => {
    beforeEach(async () => {
      await deploy();
    });

    it("emits MessageFailed with indexed parameters", async () => {
      const tx = await dstGateway.fail(MSG_HASH, SRC_CHAIN_ID, user.address, await token.getAddress(), AMOUNT);

      await expect(tx)
        .to.emit(dstGateway, "MessageFailed")
        .withArgs(MSG_HASH, SRC_CHAIN_ID, DST_CHAIN_ID, user.address, await token.getAddress(), AMOUNT);
    });
  });

  describe("event topic indexing", () => {
    beforeEach(async () => {
      await deploy();
    });

    it("MessageSent has three indexed topics (msgHash, srcChainId, dstChainId)", async () => {
      await token.mint(user.address, AMOUNT);
      await token.connect(user).approve(await srcGateway.getAddress(), AMOUNT);

      const tx = await srcGateway.connect(user).lock(
        DST_CHAIN_ID, await token.getAddress(), AMOUNT, RECIPIENT_BYTES32
      );
      const receipt = await tx.wait();

      const log = receipt.logs.find((l: any) => l.fragment?.name === "MessageSent");
      expect(log).to.not.be.undefined;
      expect(log.args[0]).to.not.be.undefined;
      expect(log.args[1]).to.equal(SRC_CHAIN_ID);
      expect(log.args[2]).to.equal(DST_CHAIN_ID);
    });

    it("MessageDelivered has three indexed topics (msgHash, srcChainId, dstChainId)", async () => {
      await token.mint(await dstGateway.getAddress(), AMOUNT);

      const tx = await dstGateway.unlock(MSG_HASH, SRC_CHAIN_ID, await token.getAddress(), user.address, AMOUNT);
      const receipt = await tx.wait();

      const log = receipt.logs.find((l: any) => l.fragment?.name === "MessageDelivered");
      expect(log).to.not.be.undefined;
      expect(log.args[0]).to.equal(MSG_HASH);
      expect(log.args[1]).to.equal(SRC_CHAIN_ID);
      expect(log.args[2]).to.equal(DST_CHAIN_ID);
    });

    it("MessageFailed has three indexed topics (msgHash, srcChainId, dstChainId)", async () => {
      const tx = await dstGateway.fail(MSG_HASH, SRC_CHAIN_ID, user.address, await token.getAddress(), AMOUNT);
      const receipt = await tx.wait();

      const log = receipt.logs.find((l: any) => l.fragment?.name === "MessageFailed");
      expect(log).to.not.be.undefined;
      expect(log.args[0]).to.equal(MSG_HASH);
      expect(log.args[1]).to.equal(SRC_CHAIN_ID);
      expect(log.args[2]).to.equal(DST_CHAIN_ID);
      expect(log.args[3]).to.equal(user.address);
    });
  });
});
