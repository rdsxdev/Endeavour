// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { CarbonRegistry } from "./CarbonRegistry.sol";

contract CarbonRegistryTest is Test {
    CarbonRegistry registry;
    address admin = address(this);
    address alice = address(0xA11CE);
    address bob = address(0xB0B);

    event CreditCreated(
        uint256 indexed id,
        string project,
        string country,
        uint256 vintageYear,
        address indexed owner
    );
    event CreditVerified(uint256 indexed id);
    event CreditRetired(uint256 indexed id, address indexed retiredBy);
    event CreditTransferred(
        uint256 indexed id,
        address indexed from,
        address indexed to
    );

    function setUp() public {
        // Warp to 2025-01-01 so vintageYear checks pass.
        // Hardhat 3 EDR starts at block.timestamp = 0 (year 1970),
        // which rejects any vintage year in the 2000s as "future".
        vm.warp(1735689600);
        registry = new CarbonRegistry();
        vm.deal(alice, 1 ether);
        vm.deal(bob, 1 ether);
    }

    function _createAs(address who, string memory project, string memory country, uint256 year) internal {
        vm.prank(who);
        registry.createCredit(project, country, year);
    }

    function test_CreateCredit_Valid() public {
        vm.expectEmit(true, true, false, true);
        emit CreditCreated(0, "Rimba Raya Reserve", "Indonesia", 2024, alice);
        _createAs(alice, "Rimba Raya Reserve", "Indonesia", 2024);

        (
            uint256 id,
            string memory project,
            string memory country,
            uint256 vintageYear,
            address owner,
            bool verified,
            bool retired,
            uint256 createdAt
        ) = registry.getCredit(0);

        assertEq(id, 0);
        assertEq(project, "Rimba Raya Reserve");
        assertEq(country, "Indonesia");
        assertEq(vintageYear, 2024);
        assertEq(owner, alice);
        assertFalse(verified);
        assertFalse(retired);
        assertGt(createdAt, 0);
        assertEq(registry.nextCreditId(), 1);
        assertEq(registry.creditCount(), 1);
    }

    function test_CreateCredit_EmptyProject() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(CarbonRegistry.EmptyString.selector, "project"));
        registry.createCredit("", "Indonesia", 2024);
    }

    function test_CreateCredit_EmptyCountry() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(CarbonRegistry.EmptyString.selector, "country"));
        registry.createCredit("Rimba Raya Reserve", "", 2024);
    }

    function test_CreateCredit_ProjectTooLong() public {
        bytes memory tooLong = new bytes(121);
        for (uint256 i = 0; i < 121; i++) tooLong[i] = "a";
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(CarbonRegistry.StringTooLong.selector, "project"));
        registry.createCredit(string(tooLong), "Indonesia", 2024);
    }

    function test_CreateCredit_InvalidVintageYearLow() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(CarbonRegistry.InvalidVintageYear.selector, uint256(1989)));
        registry.createCredit("Rimba Raya Reserve", "Indonesia", 1989);
    }

    function test_CreateCredit_InvalidVintageYearFuture() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(CarbonRegistry.InvalidVintageYear.selector, uint256(3000)));
        registry.createCredit("Rimba Raya Reserve", "Indonesia", 3000);
    }

    function test_CreateCredit_OwnershipAndIncrementingIds() public {
        _createAs(alice, "Project Alpha Forest", "Kenya", 2023);
        _createAs(bob, "Project Beta Wind", "India", 2024);
        (, , , , address owner0, , , ) = registry.getCredit(0);
        (, , , , address owner1, , , ) = registry.getCredit(1);
        assertEq(owner0, alice);
        assertEq(owner1, bob);
        assertEq(registry.nextCreditId(), 2);
    }

    function test_GetCredit_Nonexistent() public {
        vm.expectRevert(CarbonRegistry.CreditNotFound.selector);
        registry.getCredit(0);
    }

    function test_RetireCredit_OwnerCanRetireAfterVerify() public {
        _createAs(alice, "Rimba Raya Reserve", "Indonesia", 2024);
        registry.verifyCredit(0);
        vm.expectEmit(true, true, false, true);
        emit CreditRetired(0, alice);
        vm.prank(alice);
        registry.retireCredit(0);
        (, , , , , , bool retired, ) = registry.getCredit(0);
        assertTrue(retired);
    }

    function test_RetireCredit_NonOwnerCannot() public {
        _createAs(alice, "Rimba Raya Reserve", "Indonesia", 2024);
        registry.verifyCredit(0);
        vm.prank(bob);
        vm.expectRevert(CarbonRegistry.NotOwner.selector);
        registry.retireCredit(0);
    }

    function test_RetireCredit_AlreadyRetired() public {
        _createAs(alice, "Rimba Raya Reserve", "Indonesia", 2024);
        registry.verifyCredit(0);
        vm.prank(alice);
        registry.retireCredit(0);
        vm.prank(alice);
        vm.expectRevert(CarbonRegistry.AlreadyRetired.selector);
        registry.retireCredit(0);
    }

    function test_RetireCredit_NotVerified() public {
        _createAs(alice, "Rimba Raya Reserve", "Indonesia", 2024);
        vm.prank(alice);
        vm.expectRevert(CarbonRegistry.NotVerified.selector);
        registry.retireCredit(0);
    }

    function test_RetireCredit_Nonexistent() public {
        vm.expectRevert(CarbonRegistry.CreditNotFound.selector);
        registry.retireCredit(99);
    }

    function test_TransferCredit_OwnerCanTransfer() public {
        _createAs(alice, "Rimba Raya Reserve", "Indonesia", 2024);
        vm.expectEmit(true, true, true, true);
        emit CreditTransferred(0, alice, bob);
        vm.prank(alice);
        registry.transferCredit(0, bob);
        (, , , , address owner, , , ) = registry.getCredit(0);
        assertEq(owner, bob);
    }

    function test_TransferCredit_NonOwnerCannot() public {
        _createAs(alice, "Rimba Raya Reserve", "Indonesia", 2024);
        vm.prank(bob);
        vm.expectRevert(CarbonRegistry.NotOwner.selector);
        registry.transferCredit(0, bob);
    }

    function test_TransferCredit_RetiredCannotTransfer() public {
        _createAs(alice, "Rimba Raya Reserve", "Indonesia", 2024);
        registry.verifyCredit(0);
        vm.prank(alice);
        registry.retireCredit(0);
        vm.prank(alice);
        vm.expectRevert(CarbonRegistry.AlreadyRetired.selector);
        registry.transferCredit(0, bob);
    }

    function test_TransferCredit_ZeroAddressRejected() public {
        _createAs(alice, "Rimba Raya Reserve", "Indonesia", 2024);
        vm.prank(alice);
        vm.expectRevert(CarbonRegistry.InvalidAddress.selector);
        registry.transferCredit(0, address(0));
    }

    function test_TransferCredit_SameOwnerRejected() public {
        _createAs(alice, "Rimba Raya Reserve", "Indonesia", 2024);
        vm.prank(alice);
        vm.expectRevert(CarbonRegistry.SameOwner.selector);
        registry.transferCredit(0, alice);
    }

    function test_VerifyCredit_OnlyAdmin() public {
        _createAs(alice, "Rimba Raya Reserve", "Indonesia", 2024);
        vm.prank(alice);
        vm.expectRevert(CarbonRegistry.NotAdmin.selector);
        registry.verifyCredit(0);
        vm.expectEmit(true, false, false, true);
        emit CreditVerified(0);
        registry.verifyCredit(0);
        (, , , , , bool verified, , ) = registry.getCredit(0);
        assertTrue(verified);
    }

    function test_VerifyCredit_AlreadyVerified() public {
        _createAs(alice, "Rimba Raya Reserve", "Indonesia", 2024);
        registry.verifyCredit(0);
        vm.expectRevert(CarbonRegistry.AlreadyVerified.selector);
        registry.verifyCredit(0);
    }

    function test_PauseBlocksMutations() public {
        registry.pause();
        vm.prank(alice);
        vm.expectRevert(CarbonRegistry.ContractPaused.selector);
        registry.createCredit("Rimba Raya Reserve", "Indonesia", 2024);
        registry.unpause();
        _createAs(alice, "Rimba Raya Reserve", "Indonesia", 2024);
        assertEq(registry.nextCreditId(), 1);
    }

    function test_TransferAdmin() public {
        registry.transferAdmin(alice);
        assertEq(registry.admin(), alice);
        vm.prank(alice);
        registry.pause();
        assertTrue(registry.paused());
    }

    function test_TransferAdmin_ZeroAddress() public {
        vm.expectRevert(CarbonRegistry.InvalidAddress.selector);
        registry.transferAdmin(address(0));
    }
}
