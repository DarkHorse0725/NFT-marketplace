pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MultiNFT is ERC1155URIStorage, Ownable {
    uint256 tokenID;

    constructor() ERC1155("ipfs://") {}

    function Mint(
        address to,
        string memory tokenURI,
        uint256 amount
    ) external {
        require(to != address(0), "Zero Address");
        _setURI(tokenID, tokenURI);
        _mint(to, tokenID, amount, "");
        tokenID = tokenID + 1;
    }
}
