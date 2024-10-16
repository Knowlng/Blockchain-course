/* migrations */
const MarketPlace = artifacts.require("Marketplace");

module.exports = function(deployer) {
  deployer.deploy(MarketPlace);
};
