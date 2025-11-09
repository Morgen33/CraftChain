// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract CraftChainNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    // Mapping from token ID to order ID
    mapping(uint256 => string) public tokenToOrder;
    
    // Mapping from order ID to token ID
    mapping(string => uint256) public orderToToken;
    
    event NFTMinted(
        uint256 indexed tokenId,
        address indexed to,
        string orderId,
        string tokenURI
    );
    
    constructor(address initialOwner) ERC721("CraftChain NFT", "CCNFT") Ownable(initialOwner) {}
    
    function mint(
        address to,
        string memory orderId,
        string memory tokenURI
    ) public onlyOwner returns (uint256) {
        require(orderToToken[orderId] == 0, "Order already has NFT");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        tokenToOrder[tokenId] = orderId;
        orderToToken[orderId] = tokenId;
        
        emit NFTMinted(tokenId, to, orderId, tokenURI);
        
        return tokenId;
    }
    
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721) returns (address) {
        return super._update(to, tokenId, auth);
    }
    
    function _increaseBalance(
        address account,
        uint128 value
    ) internal override(ERC721) {
        super._increaseBalance(account, value);
    }
    
    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}

