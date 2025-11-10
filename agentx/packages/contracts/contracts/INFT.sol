// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract INFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId = 1;
    
    // Fee system
    uint256 public creationFee = 0.0001 ether; // 0.0001 MATIC creation fee
    address public feeRecipient;

    event AgentCreated(uint256 indexed tokenId, address indexed creator, string tokenURI);
    event CreationFeeUpdated(uint256 newFee);
    event FeeRecipientUpdated(address newRecipient);

    constructor(address _feeRecipient) ERC721("AgentX INFT", "AINFT") Ownable(msg.sender) {
        feeRecipient = _feeRecipient;
    }

    function mint(string calldata tokenURI_) external payable returns (uint256 tokenId) {
        require(msg.value >= creationFee, "INSUFFICIENT_CREATION_FEE");
        
        tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI_);
        
        // Send creation fee to fee recipient
        if (msg.value > 0) {
            (bool success, ) = payable(feeRecipient).call{value: msg.value}("");
            require(success, "FEE_TRANSFER_FAILED");
        }
        
        emit AgentCreated(tokenId, msg.sender, tokenURI_);
    }

    // Overrides required by Solidity
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return ERC721URIStorage.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    // Admin functions
    function updateCreationFee(uint256 _newFee) external onlyOwner {
        creationFee = _newFee;
        emit CreationFeeUpdated(_newFee);
    }
    
    function updateFeeRecipient(address _newRecipient) external onlyOwner {
        require(_newRecipient != address(0), "ZERO_ADDRESS");
        feeRecipient = _newRecipient;
        emit FeeRecipientUpdated(_newRecipient);
    }
    
    // Emergency withdraw function
    function emergencyWithdraw() external onlyOwner {
        (bool success, ) = payable(owner()).call{value: address(this).balance}("");
        require(success, "WITHDRAW_FAILED");
    }
}


