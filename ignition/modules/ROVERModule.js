const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("ROVER", (m) => {
  const rover = m.contract("ROVER"); 
  return { rover };
});