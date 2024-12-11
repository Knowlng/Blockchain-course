/* global contract, artifacts, web3 */

const MarketPlace = artifacts.require('./Marketplace.sol');

require('chai')
    .use(require('chai-as-promised'))
    .should();

contract('MarketPlace', ([deployer, seller, buyer, otherAccount]) => {
    let marketplace;

    const productName = 'Test Product';
    const productPrice = web3.utils.toWei('1', 'Ether');
    const updatedProductName = 'Updated Product';
    const updatedProductPrice = web3.utils.toWei('2', 'Ether');
    const isListed = true;

    beforeEach(async () => {
        marketplace = await MarketPlace.new();
    });

    describe('deployment', () => {
        it('deploys successfully', async () => {
            const address = await marketplace.address;
            assert.notEqual(address, 0x0);
            assert.notEqual(address, '');
            assert.notEqual(address, null);
            assert.notEqual(address, undefined);
        });

        it('has a name', async () => {
            const name = await marketplace.name();
            assert.equal(name, 'Marketplace');
        });
    });

    describe('createProduct', () => {
        it('creates a product successfully', async () => {
            const result = await marketplace.createProduct(productName, productPrice, isListed, { from: seller });
            const productCount = await marketplace.productCount();

            assert.equal(productCount.toNumber(), 1, 'Product count should increment to 1');

            const event = result.logs[0].args;
            assert.equal(event.id.toNumber(), 1, 'ID is correct');
            assert.equal(event.name, productName, 'Name is correct');
            assert.equal(event.price, productPrice, 'Price is correct');
            assert.equal(event.owner, seller, 'Owner is correct');
            assert.equal(event.listed, isListed, 'Listed status is correct');

            const product = await marketplace.products(1);
            assert.equal(product.id.toNumber(), 1);
            assert.equal(product.name, productName);
            assert.equal(product.price, productPrice);
            assert.equal(product.owner, seller);
            assert.equal(product.listed, isListed);
        });

        it('rejects a product with an empty name', async () => {
            await marketplace.createProduct('', productPrice, isListed, { from: seller }).should.be.rejected;
        });
    });

    describe('purchaseProduct', () => {
        it('allows a product to be purchased', async () => {
            await marketplace.createProduct(productName, productPrice, isListed, { from: seller });

            const sellerInitialBalance = await web3.eth.getBalance(seller);
            const buyerInitialBalance = await web3.eth.getBalance(buyer);

            const result = await marketplace.purchaseProduct(1, { from: buyer, value: productPrice });

            const event = result.logs[0].args;
            assert.equal(event.id.toNumber(), 1, 'ID is correct');
            assert.equal(event.owner, buyer, 'Owner is updated to buyer');
            assert.equal(event.listed, false, 'Product is unlisted');

            const product = await marketplace.products(1);
            assert.equal(product.owner, buyer, 'Product owner is updated');
            assert.equal(product.listed, false, 'Product is no longer listed');

            const sellerFinalBalance = await web3.eth.getBalance(seller);
            const buyerFinalBalance = await web3.eth.getBalance(buyer);

            assert.isAbove(Number(sellerFinalBalance), Number(sellerInitialBalance), 'Seller received payment');
            assert.isBelow(Number(buyerFinalBalance), Number(buyerInitialBalance), 'Buyer balance decreased');
        });

        it('rejects a purchase with insufficient funds', async () => {
            await marketplace.createProduct(productName, productPrice, isListed, { from: seller });
            const insufficientAmount = web3.utils.toWei('0.5', 'Ether');

            await marketplace.purchaseProduct(1, { from: buyer, value: insufficientAmount }).should.be.rejected;
        });

        it('rejects purchases of unlisted products', async () => {
            await marketplace.createProduct(productName, productPrice, false, { from: seller });

            await marketplace.purchaseProduct(1, { from: buyer, value: productPrice }).should.be.rejected;
        });

        it('rejects purchases by the product seller', async () => {
            await marketplace.createProduct(productName, productPrice, isListed, { from: seller });

            await marketplace.purchaseProduct(1, { from: seller, value: productPrice }).should.be.rejected;
        });
    });

    describe('getMyProducts', () => {
        it('returns products owned by the caller', async () => {
            await marketplace.createProduct('Product 1', productPrice, isListed, { from: seller });
            await marketplace.createProduct('Product 2', productPrice, isListed, { from: seller });

            await marketplace.purchaseProduct(1, { from: buyer, value: productPrice });

            const sellerProducts = await marketplace.getMyProducts({ from: seller });
            assert.equal(sellerProducts.length, 1, 'Seller should own 1 product');
            assert.equal(sellerProducts[0].toNumber(), 2, 'Seller owns Product 2');

            const buyerProducts = await marketplace.getMyProducts({ from: buyer });
            assert.equal(buyerProducts.length, 1, 'Buyer should own 1 product');
            assert.equal(buyerProducts[0].toNumber(), 1, 'Buyer owns Product 1');

            const otherProducts = await marketplace.getMyProducts({ from: otherAccount });
            assert.equal(otherProducts.length, 0, 'Other account should have no products');
        });
    });

    describe('updateProduct', () => {
        it('updates product details successfully', async () => {
            await marketplace.createProduct(productName, productPrice, isListed, { from: seller });

            const result = await marketplace.updateProduct(1, updatedProductName, false, updatedProductPrice, { from: seller });

            const event = result.logs[0].args;
            assert.equal(event.id.toNumber(), 1, 'ID is correct');
            assert.equal(event.name, updatedProductName, 'Product name is updated');
            assert.equal(event.price, updatedProductPrice, 'Product price is updated');
            assert.equal(event.listed, false, 'Listed status is updated');
            assert.equal(event.owner, seller, 'Owner is correct');

            const product = await marketplace.products(1);
            assert.equal(product.name, updatedProductName, 'Product name is updated in storage');
            assert.equal(product.price, updatedProductPrice, 'Product price is updated in storage');
            assert.equal(product.listed, false, 'Listed status is updated in storage');
        });

        it('rejects updates by non-owner', async () => {
            await marketplace.createProduct(productName, productPrice, isListed, { from: seller });
            await marketplace.updateProduct(1, updatedProductName, false, updatedProductPrice, { from: buyer }).should.be.rejected;
        });

        it('rejects updates with invalid name or price', async () => {
            await marketplace.createProduct(productName, productPrice, isListed, { from: seller });

            await marketplace.updateProduct(1, '', false, updatedProductPrice, { from: seller }).should.be.rejected;

            await marketplace.updateProduct(1, updatedProductName, false, 0, { from: seller }).should.be.rejected;
        });

        it('rejects updates for non-existing products', async () => {
            await marketplace.updateProduct(999, updatedProductName, false, updatedProductPrice, { from: seller }).should.be.rejected;
        });
    });

    describe('removeProduct', () => {
        it('removes a product successfully', async () => {
            await marketplace.createProduct(productName, productPrice, isListed, { from: seller });

            const result = await marketplace.removeProduct(1, { from: seller });

            const event = result.logs[0].args;
            assert.equal(event.id.toNumber(), 1, 'Product ID is correct');
            assert.equal(event.owner, seller, 'Owner is correct');

            const product = await marketplace.products(1);
            assert.equal(product.listed, false, 'Product is unlisted');
        });

        it('rejects removal by non-owner', async () => {
            await marketplace.createProduct(productName, productPrice, isListed, { from: seller });
            await marketplace.removeProduct(1, { from: buyer }).should.be.rejected;
        });

        it('rejects removal of already unlisted products', async () => {
            await marketplace.createProduct(productName, productPrice, false, { from: seller });
            await marketplace.removeProduct(1, { from: seller }).should.be.rejected;
        });

        it('rejects removal of non-existing products', async () => {
            await marketplace.removeProduct(999, { from: seller }).should.be.rejected;
        });
    });

    describe('RemoveProductFromOwner', () => {
    let productPrice = web3.utils.toWei('1', 'Ether');

    it('removes the product from the seller and adds it to the buyer after purchase', async () => {
        marketplace = await MarketPlace.new();

        await marketplace.createProduct('Product 1', productPrice, true, { from: seller });
        await marketplace.createProduct('Product 2', productPrice, true, { from: seller });

        let sellerProducts = await marketplace.getMyProducts({ from: seller });
        assert.equal(sellerProducts.length, 2, 'Seller initially owns 2 products');
        assert.equal(sellerProducts[0].toNumber(), 1, 'First product ID is correct');
        assert.equal(sellerProducts[1].toNumber(), 2, 'Second product ID is correct');

        await marketplace.purchaseProduct(1, { from: buyer, value: productPrice });

        sellerProducts = await marketplace.getMyProducts({ from: seller });
        assert.equal(sellerProducts.length, 1, 'Seller now owns 1 product after sale');
        assert.equal(sellerProducts[0].toNumber(), 2, 'Remaining product ID is correct');

        const buyerProducts = await marketplace.getMyProducts({ from: buyer });
        assert.equal(buyerProducts.length, 1, 'Buyer now owns 1 product after purchase');
        assert.equal(buyerProducts[0].toNumber(), 1, 'Buyer owns the purchased product ID 1');

        const product = await marketplace.products(1);
        assert.equal(product.owner, buyer, 'Product ownership transferred to buyer');
        assert.equal(product.listed, false, 'Product is unlisted after purchase');
    });

    it('does not remove a product from the seller if purchase conditions fail', async () => {
        marketplace = await MarketPlace.new();

        await marketplace.createProduct('Product 1', productPrice, true, { from: seller });

        await marketplace.purchaseProduct(1, { from: buyer, value: web3.utils.toWei('0.5', 'Ether') }).should.be.rejected;

        const sellerProducts = await marketplace.getMyProducts({ from: seller });
        assert.equal(sellerProducts.length, 1, 'Seller still owns 1 product');
        assert.equal(sellerProducts[0].toNumber(), 1, 'Product ID is correct');
    });
});

});
