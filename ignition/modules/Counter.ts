import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const CarbonRegistryModule = buildModule("CarbonRegistryModule", (m) => {
  const carbonRegistry = m.contract("CarbonRegistry");

  return { carbonRegistry };
});

export default CarbonRegistryModule;

