/**
 *Submitted for verification at Etherscan.io
 */

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

/// @title Auction Core
/// @dev Contains models, variables, and internal methods for the auction.
contract ClockAuctionBase {
    // Represents an auction on an NFT
    struct Auction {
        // Current owner of NFT
        address seller;
        // Price (in wei) at beginning of auction
        uint256 startingPrice;
        // Price (in wei) at end of auction
        uint256 endingPrice;
        // Payment Type
        uint256 paymentType;
        // Duration (in seconds) of auction
        uint64 duration;
        // Time when auction started
        // NOTE: 0 if this auction has been concluded
        uint64 startedAt;
        address contractAddress;
        uint8 nftType;
    }

    address public feeAddress;

    struct Bid {
        address applicant;
        uint256 price;
    }

    // Reference to contract tracking NFT ownership
    IERC721 public nonFungibleContract;

    IERC20 public wbnb;
    IERC20 public moon;

    mapping(uint256 => IERC20) indexToPaymentType;

    // Cut owner takes on each auction, measured in basis points (1/100 of a percent).
    // Values 0-10,000 map to 0%-100%
    uint256 public ownerCut;

    // Map from token ID to their corresponding auction.
    mapping(address => mapping(uint256 => Auction)) tokenIdToAuction;
    mapping(address => mapping(uint256 => Bid[])) tokenIdToBids;
    mapping(address => mapping(address => Bid)) addressToBid;
    mapping(address => mapping(address => uint256)) public allowed;

    mapping(address => uint256[]) tokenIdsAuction;
    mapping(address => mapping(uint256 => uint256)) indexOfTokenIds;

    address[] public nftAddresses;

    event AuctionCreated(
        uint256 tokenId,
        uint256 startingPrice,
        uint256 endingPrice,
        uint256 duration
    );
    event AuctionSuccessful(
        uint256 tokenId,
        uint256 totalPrice,
        address winner
    );
    event AuctionCancelled(uint256 tokenId);

    function getIdsAuction(address contractAddress)
        public
        view
        returns (uint256[] memory)
    {
        return tokenIdsAuction[contractAddress];
    }

    function getBids(address contractAddress, uint256 tokenId)
        public
        view
        returns (Bid[] memory)
    {
        return tokenIdToBids[contractAddress][tokenId];
    }

    function getAllNFTAddress() public view returns (address[] memory) {
        return nftAddresses;
    }

    function removeIdFromAuctions(
        address _contract,
        uint256 _valueToFindAndRemove
    ) public {
        uint256 index = indexOfTokenIds[_contract][_valueToFindAndRemove];
        if (index >= 0) {
            if (tokenIdsAuction[_contract].length > 0) {
                tokenIdsAuction[_contract][index] = tokenIdsAuction[_contract][
                    tokenIdsAuction[_contract].length - 1
                ];
                indexOfTokenIds[_contract][
                    tokenIdsAuction[_contract][
                        tokenIdsAuction[_contract].length - 1
                    ]
                ] = index;
                tokenIdsAuction[_contract].pop();
            }
        }
    }

    function removeAddressfromNFTs(address _contract) public {
        uint256 arrIndex;
        bool isExist = false;
        for (uint256 index = 0; index < nftAddresses.length; index++) {
            if (_contract == nftAddresses[index]) {
                arrIndex = index;
                isExist = true;
            }
        }

        if (isExist) {
            nftAddresses[arrIndex] = nftAddresses[nftAddresses.length - 1];
            nftAddresses.pop();
        }
    }

    /// @dev Returns true if the claimant owns the token.
    /// @param _claimant - Address claiming to own the token.
    /// @param _tokenId - ID of token whose ownership to verify.
    function _owns(address _claimant, uint256 _tokenId)
        internal
        view
        returns (bool)
    {
        return (nonFungibleContract.ownerOf(_tokenId) == _claimant);
    }

    /// @dev Escrows the NFT, assigning ownership to this contract.
    function _escrow(
        address _nftContract,
        address _owner,
        uint256 _tokenId,
        uint8 _type
    ) internal {
        // it will throw if transfer fails
        if (address(nonFungibleContract) == _nftContract) {
            nonFungibleContract.transferFrom(_owner, address(this), _tokenId);
        } else {
            if (_type == 0) {
                IERC721 userNFTContract = IERC721(_nftContract);
                userNFTContract.transferFrom(_owner, address(this), _tokenId);
            } else {
                IERC1155 userNFTContract = IERC1155(_nftContract);
                userNFTContract.safeTransferFrom(
                    _owner,
                    address(this),
                    _tokenId,
                    1,
                    ""
                );
            }
        }
    }

    /// @dev Transfers an NFT owned by this contract to another address.
    function _transfer(
        address _nftContract,
        address _receiver,
        uint256 _tokenId,
        uint8 _nftType
    ) internal {
        // it will throw if transfer fails
        if (address(nonFungibleContract) == _nftContract) {
            nonFungibleContract.transferFrom(
                address(this),
                _receiver,
                _tokenId
            );
        } else {
            if (_nftType == 0) {
                IERC721 userNFTContract = IERC721(_nftContract);
                userNFTContract.transferFrom(
                    address(this),
                    _receiver,
                    _tokenId
                );
            } else {
                IERC1155 userNFTContract = IERC1155(_nftContract);
                userNFTContract.safeTransferFrom(
                    address(this),
                    _receiver,
                    _tokenId,
                    1,
                    ""
                );
            }
        }
    }

    /// @dev Adds an auction to the list of open auctions. Also fires the
    function _addAuction(
        address _contractAddress,
        uint256 _tokenId,
        Auction memory _auction
    ) internal {
        // Require that all auctions have a duration of
        // at least one minute. (Keeps our math from getting hairy!)
        require(_auction.duration >= 1 minutes, "Too short duration");

        tokenIdToAuction[_contractAddress][_tokenId] = _auction;
        indexOfTokenIds[_contractAddress][_tokenId] = tokenIdsAuction[
            _contractAddress
        ].length;

        if (tokenIdsAuction[_contractAddress].length <= 0) {
            nftAddresses.push(_contractAddress);
        }
        tokenIdsAuction[_contractAddress].push(_tokenId);

        emit AuctionCreated(
            uint256(_tokenId),
            uint256(_auction.startingPrice),
            uint256(_auction.endingPrice),
            uint256(_auction.duration)
        );
    }

    /// @dev Cancels an auction unconditionally.
    function _cancelAuction(
        address _contract,
        uint256 _tokenId,
        address _seller
    ) internal {
        uint8 nftType = tokenIdToAuction[_contract][_tokenId].nftType;
        _removeAuction(_contract, _tokenId);
        _transfer(_contract, _seller, _tokenId, nftType);
        emit AuctionCancelled(_tokenId);
    }

    /// @dev Computes the price and transfers winnings.
    /// Does NOT transfer ownership of token.
    function _bid(
        address _contract,
        uint256 _tokenId,
        uint256 _bidAmount,
        address _applicant
    ) internal returns (uint256) {
        // Get a reference to the auction struct
        Auction storage auction = tokenIdToAuction[_contract][_tokenId];

        require(_isOnAuction(auction), "Not on Auction");

        // Check that the bid is greater than or equal to the current price
        uint256 price = _currentPrice(auction);
        require(_bidAmount >= price, "Insufficient fund");

        // Grab a reference to the seller before the auction struct
        // gets deleted.
        address seller = auction.seller;

        Bid memory newBid = Bid(_applicant, uint128(_bidAmount));
        tokenIdToBids[_contract][_tokenId].push(newBid);
        addressToBid[_contract][_applicant] = newBid;

        allowed[address(this)][seller] = _bidAmount;

        return price;
    }

    function _accept(
        address _contract,
        uint256 _tokenId,
        address _applicant
    ) internal returns (uint256) {
        // Get a reference to the auction struct
        Auction storage auction = tokenIdToAuction[_contract][_tokenId];

        // Explicitly check that this auction is currently live.
        // (Because of how Ethereum mappings work, we can't just count
        // on the lookup above failing. An invalid _tokenId will just
        // return an auction object that is all zeros.)
        require(_isOnAuction(auction), "Not on Auction");

        address seller = auction.seller;

        // The bid is good! Remove the auction before sending the fees
        // to the sender so we can't have a reentrancy attack.
        _removeAuction(_contract, _tokenId);

        Bid memory bid = addressToBid[_contract][_applicant];

        // Transfer proceeds to seller (if there are any!)
        uint256 feeAmount = _computeCut(bid.price);
        uint256 sellAmount = bid.price - feeAmount;
        moon.transferFrom(_applicant, feeAddress, feeAmount);
        moon.transferFrom(_applicant, seller, sellAmount);

        //remove all candidate bids
        delete tokenIdToBids[_contract][_tokenId];

        // Tell the world!
        emit AuctionSuccessful(_tokenId, bid.price, msg.sender);

        return bid.price;
    }

    /// @dev Removes an auction from the list of open auctions.
    /// @param _tokenId - ID of NFT on auction.
    function _removeAuction(address _contract, uint256 _tokenId) internal {
        delete tokenIdToAuction[_contract][_tokenId];
        delete tokenIdToBids[_contract][_tokenId];
        removeIdFromAuctions(_contract, _tokenId);
        if (tokenIdsAuction[_contract].length <= 0) {
            removeAddressfromNFTs(_contract);
        }
    }

    /// @dev Returns true if the NFT is on auction.
    /// @param _auction - Auction to check.
    function _isOnAuction(Auction storage _auction)
        internal
        view
        returns (bool)
    {
        return (_auction.startedAt > 0);
    }

    /// @dev Returns current price of an NFT on auction. Broken into two
    ///  functions (this one, that computes the duration from the auction
    ///  structure, and the other that does the price computation) so we
    ///  can easily test that the price computation works correctly.
    function _currentPrice(Auction storage _auction)
        internal
        view
        returns (uint256)
    {
        uint256 secondsPassed = 0;

        // A bit of insurance against negative values (or wraparound).
        // Probably not necessary (since Ethereum guarnatees that the
        // now variable doesn't ever go backwards).
        if (block.timestamp > _auction.startedAt) {
            secondsPassed = block.timestamp - _auction.startedAt;
        }

        return
            _computeCurrentPrice(
                _auction.startingPrice,
                _auction.endingPrice,
                _auction.duration,
                secondsPassed
            );
    }

    /// @dev Computes the current price of an auction. Factored out
    ///  from _currentPrice so we can run extensive unit tests.
    ///  When testing, make this function public and turn on
    ///  `Current price computation` test suite.
    function _computeCurrentPrice(
        uint256 _startingPrice,
        uint256 _endingPrice,
        uint256 _duration,
        uint256 _secondsPassed
    ) internal pure returns (uint256) {
        if (_secondsPassed >= _duration) {
            // We've reached the end of the dynamic pricing portion
            // of the auction, just return the end price.
            return _endingPrice;
        } else {
            // Starting price can be higher than ending price (and often is!), so
            // this delta can be negative.
            int256 totalPriceChange = int256(_endingPrice) -
                int256(_startingPrice);

            // This multiplication can't overflow, _secondsPassed will easily fit within
            // 64-bits, and totalPriceChange will easily fit within 128-bits, their product
            // will always fit within 256-bits.
            int256 currentPriceChange = (totalPriceChange *
                int256(_secondsPassed)) / int256(_duration);

            // currentPriceChange can be negative, but if so, will have a magnitude
            // less that _startingPrice. Thus, this result will always end up positive.
            int256 currentPrice = int256(_startingPrice) + currentPriceChange;

            return uint256(currentPrice);
        }
    }

    /// @dev Computes owner's cut of a sale.
    function _computeCut(uint256 _price) internal view returns (uint256) {
        return (_price * ownerCut) / 10000;
    }

    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data
    ) external virtual returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    ) external virtual returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }
}

/**
 * @title Pausable
 * @dev Base contract which allows children to implement an emergency stop mechanism.
 */
contract Pausable is Ownable {
    event Pause();
    event Unpause();

    bool public paused = false;

    /**
     * @dev modifier to allow actions only when the contract IS paused
     */
    modifier whenNotPaused() {
        require(!paused, "Paused");
        _;
    }

    /**
     * @dev modifier to allow actions only when the contract IS NOT paused
     */
    modifier whenPaused() {
        require(paused, "Working");
        _;
    }

    /**
     * @dev called by the owner to pause, triggers stopped state
     */
    function pause() public onlyOwner whenNotPaused returns (bool) {
        paused = true;
        emit Pause();
        return true;
    }

    /**
     * @dev called by the owner to unpause, returns to normal state
     */
    function unpause() public onlyOwner whenPaused returns (bool) {
        paused = false;
        emit Unpause();
        return true;
    }
}

/// @title Clock auction for non-fungible tokens.
/// @notice We omit a fallback function to prevent accidental sends to this contract.
contract ClockAuction is Pausable, ClockAuctionBase {
    /// @dev The ERC-165 interface signature for ERC-721.
    bytes4 constant InterfaceSignature_IERC721 = bytes4(0x9a20483d);

    /// @dev Constructor creates a reference to the NFT ownership contract
    ///  and verifies the owner cut is in the valid range.
    constructor(
        address _nftAddress,
        address _wmatic,
        address _moon,
        uint256 _cut
    ) {
        require(_cut <= 10000, "Cut is out of max");
        ownerCut = _cut;

        IERC721 candidateContract = IERC721(_nftAddress);
        // require(candidateContract.supportsInterface(InterfaceSignature_ERC721));
        nonFungibleContract = candidateContract;
        wbnb = IERC20(_wmatic);
        moon = IERC20(_moon);

        indexToPaymentType[0] = wbnb;
        indexToPaymentType[1] = moon;
    }

    /// @dev Remove all Ether from the contract, which is the owner's cuts
    function withdrawBalance() external {
        address nftAddress = address(nonFungibleContract);

        require(
            msg.sender == owner() || msg.sender == nftAddress,
            "Non-allowed address"
        );
        // We are using this boolean method to make sure that even if one fails it will still work
        bool res = payable(nftAddress).send(address(this).balance);
    }

    /// @dev Creates and begins a new auction.
    function createAuction(
        uint256 _tokenId,
        uint256 _startingPrice,
        uint256 _endingPrice,
        uint256 _duration,
        uint256 _payment,
        address _seller,
        address _nftAddress,
        uint8 _type
    ) external virtual whenNotPaused {
        // Sanity check that no inputs overflow how many bits we've allocated
        // to store them in the auction struct.
        require(_startingPrice == uint256(uint128(_startingPrice)));
        require(_endingPrice == uint256(uint128(_endingPrice)));
        require(_duration == uint256(uint64(_duration)));

        require(_owns(msg.sender, _tokenId), "Not owner of NFT");
        _escrow(_nftAddress, msg.sender, _tokenId, _type);
        //_escrow(nonFungibleContract, _tokenId);
        Auction memory auction = Auction(
            _seller,
            uint128(_startingPrice),
            uint128(_endingPrice),
            uint128(_payment),
            uint64(_duration),
            uint64(block.timestamp),
            _nftAddress,
            uint8(_type)
        );
        _addAuction(_nftAddress, _tokenId, auction);
    }

    /// @dev Bids on an open auction, completing the auction and transferring
    function bid(
        address _nftAddress,
        uint256 _tokenId,
        uint256 _amount
    ) external virtual whenNotPaused {
        // _bid will throw if the bid or funds transfer fails
        _bid(_nftAddress, _tokenId, _amount, msg.sender);
        // _transfer(msg.sender, _tokenId);
    }

    function accept(
        address _nftAddress,
        uint256 _tokenId,
        address _applicant
    ) external payable virtual whenNotPaused {
        // _bid will throw if the bid or funds transfer fails
        uint8 nftType = tokenIdToAuction[_nftAddress][_tokenId].nftType;
        _accept(_nftAddress, _tokenId, _applicant);
        _transfer(_nftAddress, _applicant, _tokenId, nftType);
    }

    /// @dev Cancels an auction that hasn't been won yet.
    function cancelAuction(address _nftAddress, uint256 _tokenId) external {
        Auction storage auction = tokenIdToAuction[_nftAddress][_tokenId];
        require(_isOnAuction(auction), "Not on Auction");
        address seller = auction.seller;
        require(msg.sender == seller, "Not seller");
        _cancelAuction(_nftAddress, _tokenId, seller);
    }

    /// @dev Cancels an auction when the contract is paused.
    function cancelAuctionWhenPaused(address _nftAddress, uint256 _tokenId)
        external
        whenPaused
        onlyOwner
    {
        Auction storage auction = tokenIdToAuction[_nftAddress][_tokenId];
        require(_isOnAuction(auction), "Not on Auction");
        _cancelAuction(_nftAddress, _tokenId, auction.seller);
    }

    /// @dev Returns auction info for an NFT on auction.
    /// @param _tokenId - ID of NFT on auction.
    function getAuction(address _nftAddress, uint256 _tokenId)
        external
        view
        returns (
            address seller,
            uint256 startingPrice,
            uint256 endingPrice,
            uint256 duration,
            uint256 startedAt,
            address nftAddress,
            uint8 nftType
        )
    {
        Auction storage auction = tokenIdToAuction[_nftAddress][_tokenId];
        require(_isOnAuction(auction), "Not on Auction");
        return (
            auction.seller,
            auction.startingPrice,
            auction.endingPrice,
            auction.duration,
            auction.startedAt,
            auction.contractAddress,
            auction.nftType
        );
    }

    /// @dev Returns the current price of an auction.
    /// @param _tokenId - ID of the token price we are checking.
    function getCurrentPrice(address _nftAddress, uint256 _tokenId)
        external
        view
        returns (uint256)
    {
        Auction storage auction = tokenIdToAuction[_nftAddress][_tokenId];
        require(_isOnAuction(auction), "Not on Auction");
        return _currentPrice(auction);
    }
}

/// @title Clock auction modified for sale of kitties
/// @notice We omit a fallback function to prevent accidental sends to this contract.
contract SaleClockAuction is ClockAuction {
    // @dev Sanity check that allows us to ensure that we are pointing to the
    //  right auction in our setSaleAuctionAddress() call.
    bool public isSaleClockAuction = true;

    // Tracks last 5 sale price of gen0 kitty sales
    uint256 public gen0SaleCount;
    uint256[5] public lastGen0SalePrices;

    // Delegate constructor
    constructor(
        address _nftAddr,
        address _wmatic,
        address _moon,
        uint256 _cut
    ) ClockAuction(_nftAddr, _wmatic, _moon, _cut) {}

    /// @dev Creates and begins a new auction.
    function createAuction(
        uint256 _tokenId,
        uint256 _startingPrice,
        uint256 _endingPrice,
        uint256 _payment,
        uint256 _duration,
        address _seller,
        address _nftAddress,
        uint8 _type
    ) external override {
        // Sanity check that no inputs overflow how many bits we've allocated
        // to store them in the auction struct.
        require(_startingPrice == uint256(uint128(_startingPrice)));
        require(_endingPrice == uint256(uint128(_endingPrice)));
        require(_duration == uint256(uint64(_duration)));

        // require(msg.sender == address(nonFungibleContract));
        _escrow(_nftAddress, _seller, _tokenId, _type);
        Auction memory auction = Auction(
            _seller,
            uint128(_startingPrice),
            uint128(_endingPrice),
            uint128(_payment),
            uint64(_duration),
            uint64(block.timestamp),
            _nftAddress,
            uint8(_type)
        );
        _addAuction(_nftAddress, _tokenId, auction);
    }

    /// @dev Updates lastSalePrice if seller is the nft contract
    /// Otherwise, works the same as default bid method.
    function bid(
        address _nftAddress,
        uint256 _tokenId,
        uint256 _amount // returns (address buyer, uint256 value, uint retPrice)
    ) external override {
        // _bid verifies token ID size
        address seller = tokenIdToAuction[_nftAddress][_tokenId].seller;
        uint256 price = _bid(_nftAddress, _tokenId, _amount, msg.sender);
        // return (seller, msg.value, price);
        // _transfer(msg.sender, _tokenId);
    }

    function accept(
        address _nftAddress,
        uint256 _tokenId,
        address _applicant // returns (address buyer, uint256 value, uint retPrice)
    ) external payable override {
        uint8 nftType = tokenIdToAuction[_nftAddress][_tokenId].nftType;
        // _bid verifies token ID size
        _accept(_nftAddress, _tokenId, _applicant);
        // return (seller, msg.value, price);
        _transfer(_nftAddress, _applicant, _tokenId, nftType);
    }

    function setFeeAddress(address _feeGuy) public onlyOwner {
        feeAddress = _feeGuy;
    }

    function setFee(uint256 _fee) public onlyOwner {
        ownerCut = _fee;
    }
}
