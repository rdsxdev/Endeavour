// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * CarbonRegistry — production-hardened
 *
 * Changes from v1:
 *  - Owner / admin role (only admin can verify credits)
 *  - credits[id].exists guard so ID 0 is distinguishable from "not found"
 *  - vintageYear must be <= current year (no future credits)
 *  - transferCredit: cannot transfer to self
 *  - retireCredit: must be verified before retiring
 *  - Custom errors (cheaper gas than revert strings)
 *  - Pausable: admin can halt all state-changing ops in an emergency
 *  - Event data enriched (owner on CreditCreated, newOwner on CreditTransferred)
 */
contract CarbonRegistry {

    /* ------------------------------------------------------------------ */
    /* Errors                                                               */
    /* ------------------------------------------------------------------ */

    error NotAdmin();
    error NotOwner();
    error AlreadyRetired();
    error NotVerified();
    error AlreadyVerified();
    error InvalidAddress();
    error SameOwner();
    error CreditNotFound();
    error EmptyString(string field);
    error InvalidVintageYear(uint256 year);
    error ContractPaused();

    /* ------------------------------------------------------------------ */
    /* Storage                                                              */
    /* ------------------------------------------------------------------ */

    struct Credit {
        uint256 id;
        string  project;
        string  country;
        uint256 vintageYear;
        address owner;
        bool    verified;
        bool    retired;
        uint256 createdAt;
        bool    exists;
    }

    address public admin;
    bool    public paused;
    uint256 public nextCreditId;

    mapping(uint256 => Credit) public credits;

    /* ------------------------------------------------------------------ */
    /* Events                                                               */
    /* ------------------------------------------------------------------ */

    event CreditCreated(
        uint256 indexed id,
        string  project,
        string  country,
        uint256 vintageYear,
        address indexed owner
    );

    event CreditVerified(uint256 indexed id);

    event CreditRetired(
        uint256 indexed id,
        address indexed retiredBy
    );

    event CreditTransferred(
        uint256 indexed id,
        address indexed from,
        address indexed to
    );

    event AdminTransferred(address indexed oldAdmin, address indexed newAdmin);
    event Paused(address by);
    event Unpaused(address by);

    /* ------------------------------------------------------------------ */
    /* Modifiers                                                            */
    /* ------------------------------------------------------------------ */

    modifier onlyAdmin() {
        if (msg.sender != admin) revert NotAdmin();
        _;
    }

    modifier whenNotPaused() {
        if (paused) revert ContractPaused();
        _;
    }

    modifier creditExists(uint256 id) {
        if (!credits[id].exists) revert CreditNotFound();
        _;
    }

    /* ------------------------------------------------------------------ */
    /* Constructor                                                          */
    /* ------------------------------------------------------------------ */

    constructor() {
        admin = msg.sender;
    }

    /* ------------------------------------------------------------------ */
    /* Admin                                                                */
    /* ------------------------------------------------------------------ */

    function transferAdmin(address newAdmin) external onlyAdmin {
        if (newAdmin == address(0)) revert InvalidAddress();
        emit AdminTransferred(admin, newAdmin);
        admin = newAdmin;
    }

    function pause() external onlyAdmin {
        paused = true;
        emit Paused(msg.sender);
    }

    function unpause() external onlyAdmin {
        paused = false;
        emit Unpaused(msg.sender);
    }

    function verifyCredit(uint256 id)
        external
        onlyAdmin
        whenNotPaused
        creditExists(id)
    {
        if (credits[id].verified) revert AlreadyVerified();
        credits[id].verified = true;
        emit CreditVerified(id);
    }

    /* ------------------------------------------------------------------ */
    /* Core                                                                 */
    /* ------------------------------------------------------------------ */

    function createCredit(
        string memory project,
        string memory country,
        uint256 vintageYear
    ) external whenNotPaused {
        if (bytes(project).length == 0)  revert EmptyString("project");
        if (bytes(country).length == 0)  revert EmptyString("country");

        uint256 currentYear = (block.timestamp / 365 days) + 1970;
        if (vintageYear < 1990 || vintageYear > currentYear) {
            revert InvalidVintageYear(vintageYear);
        }

        uint256 id = nextCreditId;

        credits[id] = Credit({
            id:          id,
            project:     project,
            country:     country,
            vintageYear: vintageYear,
            owner:       msg.sender,
            verified:    false,       // requires admin verification
            retired:     false,
            createdAt:   block.timestamp,
            exists:      true
        });

        emit CreditCreated(id, project, country, vintageYear, msg.sender);

        unchecked { nextCreditId++; }
    }

    function retireCredit(uint256 id)
        external
        whenNotPaused
        creditExists(id)
    {
        Credit storage c = credits[id];
        if (c.owner != msg.sender) revert NotOwner();
        if (c.retired)             revert AlreadyRetired();
        if (!c.verified)           revert NotVerified();

        c.retired = true;
        emit CreditRetired(id, msg.sender);
    }

    function transferCredit(uint256 id, address newOwner)
        external
        whenNotPaused
        creditExists(id)
    {
        Credit storage c = credits[id];
        if (c.owner != msg.sender)   revert NotOwner();
        if (c.retired)               revert AlreadyRetired();
        if (newOwner == address(0))  revert InvalidAddress();
        if (newOwner == msg.sender)  revert SameOwner();

        address oldOwner = c.owner;
        c.owner = newOwner;

        emit CreditTransferred(id, oldOwner, newOwner);
    }

    /* ------------------------------------------------------------------ */
    /* View                                                                 */
    /* ------------------------------------------------------------------ */

    function getCredit(uint256 id)
        external
        view
        creditExists(id)
        returns (
            uint256 _id,
            string memory project,
            string memory country,
            uint256 vintageYear,
            address owner,
            bool verified,
            bool retired,
            uint256 createdAt
        )
    {
        Credit memory c = credits[id];
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

    function creditCount() external view returns (uint256) {
        return nextCreditId;
    }
}