// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title TrashCoin - A token for incentivizing recycling and waste management
/// @notice This contract represents a fungible token that is minted when waste is verified by authorized verifiers.
/// Each token corresponds to one unit of recyclable material collected and verified. Users can redeem (burn)
/// their tokens once they have been credited. Only the contract owner can add or remove verifiers.
contract TrashCoin is ERC20, Ownable {
    // Mapping to track which addresses are authorized as verifiers
    mapping(address => bool) public verifiers;

    /// @notice Emitted when a new verifier is added
    /// @param verifier The address that was added as a verifier
    event VerifierAdded(address indexed verifier);

    /// @notice Emitted when a verifier is removed
    /// @param verifier The address that was removed as a verifier
    event VerifierRemoved(address indexed verifier);

    /// @notice Emitted when waste is verified and tokens are minted
    /// @param user The address receiving newly minted tokens
    /// @param verifier The address that performed the verification
    /// @param amount The number of tokens minted
    /// @param wasteType A short description of the type of waste verified
    event WasteVerified(address indexed user, address indexed verifier, uint256 amount, string wasteType);

    /// @dev Constructor initializes the ERC20 token with name and symbol. No initial supply is minted;
    /// tokens are minted only through verification.
    constructor() ERC20("TrashCoin", "TRASH") {}

    /// @notice Override decimals to return zero so that 1 token equals exactly 1 unit of waste
    /// @return uint8 Always returns 0
    function decimals() public view virtual override returns (uint8) {
        return 0;
    }

    /// @notice Modifier to allow only authorized verifiers to call certain functions
    modifier onlyVerifier() {
        require(verifiers[msg.sender], "Caller is not a verifier");
        _;
    }

    /// @notice Add a new verifier. Only callable by the contract owner.
    /// @param verifier The address to authorize as a verifier
    function addVerifier(address verifier) external onlyOwner {
        require(verifier != address(0), "Invalid verifier address");
        verifiers[verifier] = true;
        emit VerifierAdded(verifier);
    }

    /// @notice Remove an existing verifier. Only callable by the contract owner.
    /// @param verifier The address to deauthorize as a verifier
    function removeVerifier(address verifier) external onlyOwner {
        require(verifier != address(0), "Invalid verifier address");
        verifiers[verifier] = false;
        emit VerifierRemoved(verifier);
    }

    /// @notice Verify waste submitted by a user and mint corresponding TrashCoin tokens
    /// @dev Only callable by an authorized verifier. Each token represents one unit of waste.
    /// @param user The address that will receive newly minted tokens
    /// @param amount The number of units of waste verified (and therefore the number of tokens minted)
    /// @param wasteType A short string describing the type of waste (e.g., "plastic", "metal")
    function verifyAndMint(address user, uint256 amount, string calldata wasteType) external onlyVerifier {
        require(user != address(0), "Invalid user address");
        require(amount > 0, "Amount must be greater than zero");
        // Mint the specified amount of tokens to the user
        _mint(user, amount);
        emit WasteVerified(user, msg.sender, amount, wasteType);
    }

    /// @notice Redeem (burn) a specified amount of TrashCoin tokens
    /// @dev Users can burn their tokens as a form of redemption. For example, this could correspond to exchanging
    /// tokens for goods or services off-chain. Burning reduces the user's balance and total supply.
    /// @param amount The number of tokens to burn from the caller's balance
    function redeem(uint256 amount) external {
        require(amount > 0, "Amount must be greater than zero");
        _burn(msg.sender, amount);
    }
}