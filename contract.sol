// SPDX-License-Identifier: UNLICENSE
pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract NFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address public owner = 0xCDeF3CC7cDBdC8695674973Ad015D9f2B01dD4C4;
    uint256 public normalPrice = 150000000000000000;
    uint256 public totalMint = 0;
    uint256 public maxMint = 1000;
    string public baseUrl =
        "https://gateway.pinata.cloud/ipfs/QmToJQzZ8BpqZE4uVE8ZcRGemK3MUwbyjhHCGo7GpAtn3K/";
    bool public mintingStatus = true;

    constructor() ERC721("Description", "NFT") {}

    receive() external payable {}

    modifier onlyOwner() {
        require(msg.sender == owner, "ADMIN_ONLY");
        _;
    }

    function append(
        string memory a,
        string memory b,
        string memory c
    ) internal pure returns (string memory) {
        return string(abi.encodePacked(a, b, c));
    }

    function awardItem(address player, uint256 tokenCount) public payable {
        require(mintingStatus);
        require(totalMint <= maxMint);
        require(normalPrice * tokenCount <= msg.value);
        for (uint256 i = 0; i < tokenCount; i++) {
            uint256 newItemId = _tokenIds.current();
            _tokenIds.increment();
            _mint(player, newItemId);
            _setTokenURI(
                newItemId,
                append(baseUrl, Strings.toString(newItemId + 1), ".json")
            );
            totalMint++;
        }
    }

    function claimBalance() external onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    function changeStatus() external onlyOwner {
        mintingStatus = !mintingStatus;
    }

    function ownerAwardItem(address player, uint256 tokenCount)
        public
        payable
        onlyOwner
    {
        for (uint256 i = 0; i < tokenCount; i++) {
            uint256 newItemId = _tokenIds.current();
            _tokenIds.increment();
            _mint(player, newItemId);
            _setTokenURI(
                newItemId,
                append(baseUrl, Strings.toString(newItemId + 1), ".json")
            );
            totalMint++;
        }
    }

    function changeOwner(address adres) external onlyOwner {
        require(adres != address(0x0));
        owner = adres;
    }
}
