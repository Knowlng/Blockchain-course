pragma solidity ^0.5.0;

contract Marketplace {
    string public name;
    uint public productCount = 0;
    mapping(uint => Product) public products;
    mapping(address => uint[]) public ownerProducts;

    struct Product {
        uint id;
        string name;
        uint price;
        address payable owner;
        bool listed; 
    }

    event ProductPurchased(
        uint id,
        string name,
        uint price,
        address payable owner,
        bool listed
    );

    event ProductCreated(
        uint id,
        string name,
        uint price,
        address payable owner,
        bool listed
    );

    event ProductUpdated(
        uint id,
        string name,
        uint price,
        bool listed,
        address owner
    );

    event ProductRemoved(
        uint id,
        address owner
    );

    constructor() public {
        name = "Marketplace";
    }

    function createProduct(string memory _name, uint _price, bool _listed) public {
        require(bytes(_name).length > 0);
        require(_listed == true || _listed == false);

        productCount++;
        products[productCount] = Product(productCount, _name, _price, msg.sender, _listed);
        ownerProducts[msg.sender].push(productCount);

        emit ProductCreated(productCount, _name, _price, msg.sender, _listed);
    }

    function purchaseProduct(uint _id) public payable {
        Product storage product = products[_id];
        address payable _seller = product.owner;

        require(product.id > 0 && product.id <= productCount);
        require(msg.value >= product.price);
        require(product.listed);
        require(_seller != msg.sender);

        product.owner = msg.sender;
        product.listed = false;

        removeProductFromOwner(_seller, _id);

        ownerProducts[msg.sender].push(_id);

        _seller.transfer(msg.value);

        emit ProductPurchased(product.id, product.name, product.price, msg.sender, false);
    }

    function getMyProducts() public view returns (uint[] memory) {
        return ownerProducts[msg.sender];
    }

    function updateProduct(uint _id, string memory _newName, bool _listed, uint _newPrice) public {
        Product storage product = products[_id];

        require(product.id != 0);
        require(_listed == true || _listed == false);
        require(msg.sender == product.owner);
        require(bytes(_newName).length > 0);
        require(_newPrice > 0);

        product.name = _newName;
        product.price = _newPrice;
        product.listed = _listed;

        emit ProductUpdated(_id, _newName, _newPrice, _listed, msg.sender);
    }

    function removeProduct(uint _id) public {
        Product storage product = products[_id];

        require(product.id != 0);
        require(product.listed);
        require(msg.sender == product.owner);

        product.listed = false;

        emit ProductRemoved(_id, msg.sender);
    }

    function removeProductFromOwner(address _owner, uint _productId) private {
        uint length = ownerProducts[_owner].length;
        for (uint i = 0; i < length; i++) {
            if (ownerProducts[_owner][i] == _productId) {
                ownerProducts[_owner][i] = ownerProducts[_owner][length - 1];
                ownerProducts[_owner].length--;
                break;
            }
        }
    }
}
