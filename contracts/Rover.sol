// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";         // ERC-20 core
import "@openzeppelin/contracts/access/AccessControl.sol";       // Role‐based access
import "@openzeppelin/contracts/utils/Pausable.sol";             // Pausable checks

error UrNotAdminContract();
error RoverIsNonTransferable();


contract ROVER is ERC20, AccessControl, Pausable {
    event AdminContractUpdated(address indexed newAdminContract);
    event Claimed(address indexed user);
    event Burned(address indexed user,uint256 amount);




    address public AdminContract;
    mapping(address => bool) public hasClaimed;


    modifier onlyAdminContract() {
        if (msg.sender != AdminContract) revert UrNotAdminContract();
        _;
    }


    
    function setAdminContract(address _admin_contract) external onlyRole(DEFAULT_ADMIN_ROLE) {
        AdminContract = _admin_contract;
        emit AdminContractUpdated(_admin_contract);
    }




    


    constructor() ERC20("ROVER Token", "ROT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        AdminContract=msg.sender;
    }

    

    
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    

    
    function claimInitial(address _user) external onlyAdminContract  {
        
        hasClaimed[_user] = true;
        _mint(_user, 100 * 10 ** decimals());
        emit Claimed(_user);
    }

    
    function burnFrom(address _from, uint256 _amount) external onlyAdminContract {
        _burn(_from, _amount);
        emit Burned(_from,_amount);
    }

    /// @dev Central hook for all balance changes; block transfers
    function _update(
        address from,
        address to,
        uint256 amount
    ) internal virtual override whenNotPaused  {
        // Allow minting (from == zero), burning (to == zero), or calls from Admin Contract
        if (
            from != address(0) &&           // not mint
            to   != address(0)            // not burn    
        ) {
            revert RoverIsNonTransferable();
        }
        super._update(from, to, amount);
    }
}
