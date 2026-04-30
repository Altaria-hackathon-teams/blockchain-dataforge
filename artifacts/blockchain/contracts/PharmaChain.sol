// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract PharmaChain {
    enum Status { Manufactured, InTransit, Delivered }

    struct Medication {
        string batchId;
        address manufacturer;
        address currentHolder;
        Status status;
        uint256 predictedDemandScore;
        string suggestedRouteHash;
    }

    mapping(string => Medication) public medications;
    mapping(address => bool) public isManufacturer;
    mapping(address => bool) public isDistributor;
    mapping(address => bool) public isLocalShop;

    event BatchMinted(string batchId, address indexed manufacturer, uint256 demandScore, string routeHash);
    event TransitUpdated(string batchId, address indexed distributor);
    event DeliveryConfirmed(string batchId, address indexed shop);
    event RoleRegistered(address indexed account, string role);

    // For demo purposes, we allow self-registration of roles
    function registerRole(string memory _role) public {
        if (keccak256(abi.encodePacked(_role)) == keccak256(abi.encodePacked("Manufacturer"))) {
            isManufacturer[msg.sender] = true;
        } else if (keccak256(abi.encodePacked(_role)) == keccak256(abi.encodePacked("Distributor"))) {
            isDistributor[msg.sender] = true;
        } else if (keccak256(abi.encodePacked(_role)) == keccak256(abi.encodePacked("LocalShop"))) {
            isLocalShop[msg.sender] = true;
        }
        emit RoleRegistered(msg.sender, _role);
    }

    function mintBatch(string memory _batchId, uint256 _predictedDemandScore, string memory _suggestedRouteHash) public {
        require(isManufacturer[msg.sender], "Only Manufacturer can mint");
        require(medications[_batchId].manufacturer == address(0), "Batch already exists");

        medications[_batchId] = Medication({
            batchId: _batchId,
            manufacturer: msg.sender,
            currentHolder: msg.sender,
            status: Status.Manufactured,
            predictedDemandScore: _predictedDemandScore,
            suggestedRouteHash: _suggestedRouteHash
        });

        emit BatchMinted(_batchId, msg.sender, _predictedDemandScore, _suggestedRouteHash);
    }

    function updateTransit(string memory _batchId) public {
        require(isDistributor[msg.sender], "Only Distributor can update transit");
        require(medications[_batchId].manufacturer != address(0), "Batch does not exist");
        require(medications[_batchId].status == Status.Manufactured, "Batch is not in Manufactured state");

        medications[_batchId].currentHolder = msg.sender;
        medications[_batchId].status = Status.InTransit;

        emit TransitUpdated(_batchId, msg.sender);
    }

    function confirmDelivery(string memory _batchId) public {
        require(isLocalShop[msg.sender], "Only Local Shop can confirm delivery");
        require(medications[_batchId].manufacturer != address(0), "Batch does not exist");
        require(medications[_batchId].status == Status.InTransit, "Batch is not in InTransit state");

        medications[_batchId].currentHolder = msg.sender;
        medications[_batchId].status = Status.Delivered;

        emit DeliveryConfirmed(_batchId, msg.sender);
    }
}
