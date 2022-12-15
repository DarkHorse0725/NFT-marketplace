pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

interface IMoonNFT {
    function mint(address owner, string memory metadataURI) external;

    function setTokenURI(uint256 tokenId, string memory newTokenURI) external;

    function setBaseURI(string memory baseURI_) external;
}
