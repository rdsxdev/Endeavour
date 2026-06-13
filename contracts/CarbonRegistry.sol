// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract CarbonRegistry {

    struct Credit {
        uint256 id;
        string project;
        string country;
        uint256 vintageYear;
        address owner;
        bool verified;
        bool retired;
        uint256 createdAt;
    }

    uint256 public nextCreditId;

    mapping(uint256 => Credit) public credits;

    event CreditCreated(
        uint256 indexed id,
        string project,
        address indexed owner
    );

    event CreditRetired(
        uint256 indexed id
    );

    event CreditTransferred(
        uint256 indexed id,
        address indexed from,
        address indexed to
    );

    function createCredit(
        string memory project,
        string memory country,
        uint256 vintageYear
    ) public {

        require(
            bytes(project).length > 0,
            "Project required"
        );

        require(
            bytes(country).length > 0,
            "Country required"
        );

        require(
            vintageYear >= 1900 &&
            vintageYear <= 2100,
            "Invalid vintage year"
        );

        credits[nextCreditId] = Credit({
            id: nextCreditId,
            project: project,
            country: country,
            vintageYear: vintageYear,
            owner: msg.sender,
            verified: true,
            retired: false,
            createdAt: block.timestamp
        });

        emit CreditCreated(
            nextCreditId,
            project,
            msg.sender
        );

        nextCreditId++;
    }

    function retireCredit(
        uint256 id
    ) public {

        require(
            credits[id].owner == msg.sender,
            "Not owner"
        );

        require(
            !credits[id].retired,
            "Already retired"
        );

        credits[id].retired = true;

        emit CreditRetired(id);
    }

    function transferCredit(
        uint256 id,
        address newOwner
    ) public {

        require(
            credits[id].owner == msg.sender,
            "Not owner"
        );

        require(
            !credits[id].retired,
            "Credit retired"
        );

        require(
            newOwner != address(0),
            "Invalid owner"
        );

        address oldOwner =
            credits[id].owner;

        credits[id].owner =
            newOwner;

        emit CreditTransferred(
            id,
            oldOwner,
            newOwner
        );
    }

    function getCredit(
        uint256 id
    )
        public
        view
        returns (
            uint256,
            string memory,
            string memory,
            uint256,
            address,
            bool,
            bool,
            uint256
        )
    {
        Credit memory c =
            credits[id];

        return (
            c.id,
            c.project,
            c.country,
            c.vintageYear,
            c.owner,
            c.verified,
            c.retired,
            c.createdAt
        );
    }
}
