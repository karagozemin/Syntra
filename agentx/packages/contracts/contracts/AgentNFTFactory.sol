// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AgentNFT
 * @notice Individual AI Agent NFT Contract
 */
contract AgentNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId = 1;
    
    // Agent metadata
    string public agentName;
    string public agentDescription;
    string public agentCategory;
    string public computeModel;
    string public storageHash;
    string[] public capabilities;
    
    // Marketplace and creator info
    address public marketplace;
    address public creator;
    uint256 public price;
    bool public isListed;
    
    event AgentMinted(uint256 indexed tokenId, address indexed owner, string tokenURI);
    event AgentListed(uint256 indexed tokenId, uint256 price);
    
    constructor(
        string memory name_,
        string memory symbol_,
        string memory agentName_,
        string memory agentDescription_,
        string memory agentCategory_,
        string memory computeModel_,
        string memory storageHash_,
        string[] memory capabilities_,
        address creator_,
        address marketplace_,
        uint256 price_
    ) ERC721(name_, symbol_) Ownable(creator_) {
        agentName = agentName_;
        agentDescription = agentDescription_;
        agentCategory = agentCategory_;
        computeModel = computeModel_;
        storageHash = storageHash_;
        capabilities = capabilities_;
        creator = creator_;
        marketplace = marketplace_;
        price = price_;
    }
    
    /**
     * @notice Mint the AI Agent NFT (anyone can mint to creator)
     */
    function mint(string calldata tokenURI_) external returns (uint256 tokenId) {
        require(_nextTokenId == 1, "ALREADY_MINTED"); // Only one NFT per contract
        
        tokenId = _nextTokenId++;
        _safeMint(creator, tokenId); // Always mint to creator
        _setTokenURI(tokenId, tokenURI_);
        
        emit AgentMinted(tokenId, creator, tokenURI_);
    }
    
    /**
     * @notice List the NFT on marketplace
     */
    function listOnMarketplace() external {
        require(msg.sender == creator, "ONLY_CREATOR");
        require(!isListed, "ALREADY_LISTED");
        require(_nextTokenId > 1, "NOT_MINTED");
        
        // Approve marketplace
        approve(marketplace, 1); // tokenId is always 1
        isListed = true;
        
        emit AgentListed(1, price);
    }
    
    /**
     * @notice Hook called after token transfers to update creator
     */
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        address previousOwner = super._update(to, tokenId, auth);
        
        // Update creator if token 1 is transferred
        if (tokenId == 1 && to != address(0) && to != creator) {
            creator = to;
        }
        
        return previousOwner;
    }
    
    /**
     * @notice Buy directly from creator (if not listed on marketplace)
     */
    function buyDirect() external payable {
        require(_nextTokenId > 1, "NOT_MINTED");
        require(msg.value >= price, "INSUFFICIENT_PAYMENT");
        require(msg.sender != creator, "CANNOT_BUY_OWN");
        
        address previousCreator = creator;
        
        // Transfer NFT
        _transfer(creator, msg.sender, 1);
        creator = msg.sender;
        
        // Send payment to previous creator
        payable(previousCreator).transfer(msg.value);
        
        emit Transfer(previousCreator, msg.sender, 1);
    }
    
    /**
     * @notice Update price (only current owner)
     */
    function updatePrice(uint256 newPrice) external {
        require(msg.sender == creator, "ONLY_CREATOR");
        price = newPrice;
    }
    
    /**
     * @notice Get agent capabilities
     */
    function getCapabilities() external view returns (string[] memory) {
        return capabilities;
    }
    
    // Override required by Solidity
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
}

/**
 * @title AgentNFTFactory
 * @notice Factory for creating individual AI Agent NFT contracts
 */
contract AgentNFTFactory {
    address public marketplace;
    address public owner;
    uint256 public creationFee = 0.0001 ether; // 0.0001 MATIC creation fee
    
    // Track created agents
    mapping(address => address[]) public creatorAgents;
    address[] public allAgents;
    
    event AgentContractCreated(
        address indexed agentContract,
        address indexed creator,
        string agentName,
        uint256 price
    );
    
    constructor(address marketplace_) {
        marketplace = marketplace_;
        owner = msg.sender;
    }
    
    /**
     * @notice Create a new AI Agent NFT contract
     */
    function createAgent(
        string memory agentName_,
        string memory agentDescription_,
        string memory agentCategory_,
        string memory computeModel_,
        string memory storageHash_,
        string[] memory capabilities_,
        uint256 price_
    ) external payable returns (address agentContract) {
        require(msg.value >= creationFee, "INSUFFICIENT_FEE");
        require(bytes(agentName_).length > 0, "NAME_REQUIRED");
        
        // Create unique name and symbol
        string memory name = string(abi.encodePacked("Agent: ", agentName_));
        string memory symbol = string(abi.encodePacked("AGT", _toString(allAgents.length)));
        
        // Deploy new AgentNFT contract
        agentContract = address(new AgentNFT(
            name,
            symbol,
            agentName_,
            agentDescription_,
            agentCategory_,
            computeModel_,
            storageHash_,
            capabilities_,
            msg.sender,
            marketplace,
            price_
        ));
        
        // Track the agent
        creatorAgents[msg.sender].push(agentContract);
        allAgents.push(agentContract);
        
        // Send creation fee to owner
        if (msg.value > 0) {
            payable(owner).transfer(msg.value);
        }
        
        emit AgentContractCreated(agentContract, msg.sender, agentName_, price_);
    }
    
    struct CreateAndMintParams {
        string agentName;
        string agentDescription;
        string agentCategory;
        string computeModel;
        string storageHash;
        string[] capabilities;
        uint256 price;
        string tokenURI;
    }

    // createAndMintAgent function removed due to "stack too deep" compilation error
    // Use createAgent() followed by separate mint() call instead
    
    /**
     * @notice Get all agents created by a creator
     */
    function getCreatorAgents(address creator) external view returns (address[] memory) {
        return creatorAgents[creator];
    }
    
    /**
     * @notice Get total number of agents
     */
    function getTotalAgents() external view returns (uint256) {
        return allAgents.length;
    }
    
    /**
     * @notice Get agent contract at index
     */
    function getAgentAt(uint256 index) external view returns (address) {
        require(index < allAgents.length, "INDEX_OUT_OF_BOUNDS");
        return allAgents[index];
    }
    
    // Helper function to convert uint to string
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
    
    // Admin functions
    function updateCreationFee(uint256 newFee) external {
        require(msg.sender == owner, "ONLY_OWNER");
        creationFee = newFee;
    }
    
    function updateMarketplace(address newMarketplace) external {
        require(msg.sender == owner, "ONLY_OWNER");
        marketplace = newMarketplace;
    }
}
