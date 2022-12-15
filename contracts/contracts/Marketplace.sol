// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./IMoonNFT.sol";

contract Marketplace is AccessControl {
    int256 maxQuantity = 10;

    struct MoonProd {
        string name;
        string description;
        uint256 price;
        int256 quantity;
        address owner;
        uint8 flag;
    }

    bytes32 public constant PRODUCE_ROLE = keccak256("PRODUCE_ROLE");

    mapping(string => MoonProd) public moonProds;
    string[] public hashes;

    IMoonNFT ft;
    IERC20 moon;

    address public feeAddress;
    uint256 public feePercent;

    event ProductCreated(
        string hash,
        uint256 price,
        int256 quantity,
        address owner
    );
    event ProductSale(string hash, uint256 price, address to);

    constructor(
        IMoonNFT _ft,
        address _moon,
        uint256 _fee
    ) {
        ft = IMoonNFT(_ft);
        moon = IERC20(_moon);
        feeAddress = _msgSender();
        feePercent = _fee;
        _setupRole(PRODUCE_ROLE, _msgSender());
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

    function setMaxQuantity(int256 _quantity) public {
        maxQuantity = _quantity;
    }

    function getMaxQuantity() public view returns (int256) {
        return maxQuantity;
    }

    function compareStrings(string memory a, string memory b)
        public
        pure
        returns (bool)
    {
        return (keccak256(abi.encodePacked((a))) ==
            keccak256(abi.encodePacked((b))));
    }

    function addNewProduction(
        string memory _name,
        string memory _description,
        uint256 _price,
        int256 _quantity,
        string memory _hash
    ) public returns (bool) {
        require(
            hasRole(PRODUCE_ROLE, _msgSender()),
            "Must have produce role to mint"
        );
        require(
            _quantity <= maxQuantity,
            "Quantity cannot be higher than the maximum quantity"
        );
        require(moonProds[_hash].flag != 1);
        moonProds[_hash] = MoonProd(
            _name,
            _description,
            _price,
            _quantity,
            _msgSender(),
            1
        );
        hashes.push(_hash);

        emit ProductCreated(_hash, _price, _quantity, _msgSender());
        return true;
    }

    function getProdList() public view returns (string[] memory) {
        return hashes;
    }

    function getProdByHash(string memory _hash)
        public
        view
        returns (MoonProd memory)
    {
        return moonProds[_hash];
    }

    function setProdByHash(
        string memory _name,
        string memory _description,
        uint256 _price,
        int256 _quantity,
        string memory _hash
    ) public returns (bool) {
        require(
            hasRole(PRODUCE_ROLE, _msgSender()),
            "Must have produce role to mint"
        );
        require(
            _quantity <= maxQuantity,
            "Quantity cannot be higher than the maximum quantity"
        );
        require(moonProds[_hash].flag != 1);
        require(
            moonProds[_hash].owner == _msgSender(),
            "Only production owner can chnage the properties of nft."
        );
        moonProds[_hash] = MoonProd(
            _name,
            _description,
            _price,
            _quantity,
            _msgSender(),
            1
        );
        return true;
    }

    function deleteProdByHash(string memory _hash) public returns (bool) {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, _msgSender()) ||
                (moonProds[_hash].owner == _msgSender()),
            "Admin or product owner only can delete this."
        );
        uint256 arrIndex;
        bool isExist = false;
        for (uint256 index = 0; index < hashes.length; index++) {
            if (compareStrings(_hash, hashes[index])) {
                arrIndex = index;
                isExist = true;
            }
        }

        if (isExist) {
            hashes[arrIndex] = hashes[hashes.length - 1];
            hashes.pop();
        }

        delete moonProds[_hash];
        return true;
    }

    function buy(
        address to,
        string memory _hash,
        uint256 _amount
    ) public payable returns (int256) {
        require(
            moonProds[_hash].quantity >= 1,
            "Must have quantity more than 1"
        );
        require(
            _amount == moonProds[_hash].price * 10**18,
            "Amount should be same with price"
        );
        uint256 feeAmount = moonProds[_hash].price * feePercent / 10**4; //100 % is 10000
        require(
            moon.transferFrom(msg.sender, address(0x1), _amount - feeAmount),
            "ERC20: transfer amount exceeds allowance"
        );
        require(
            moon.transferFrom(msg.sender, feeAddress, feeAmount),
            "ERC20: transfer amount exceeds allowance"
        );
        ft.mint(to, _hash);
        moonProds[_hash].quantity = moonProds[_hash].quantity - 1;
        if (moonProds[_hash].quantity == 0) {
            deleteProdByHash(_hash);
        }
        emit ProductSale(_hash, _amount, _msgSender());
        return moonProds[_hash].quantity;
    }

    //set fee precentage
    function setFeeAmount(uint256 _feeAmount) public {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, _msgSender()),
            "Admin only can do this."
        );
        feePercent = _feeAmount;
    }

    //set fee address
    function setFeeAddress(address _feeAddress) public {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, _msgSender()),
            "Admin only can do this."
        );
        feeAddress = _feeAddress;
    }
}
