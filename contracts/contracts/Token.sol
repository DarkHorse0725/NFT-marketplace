pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MOON is ERC20 {
    constructor() ERC20("MOON", "MOON") {
        _mint(msg.sender, 10**36);
    }
}
