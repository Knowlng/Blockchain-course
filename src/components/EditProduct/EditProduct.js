import React from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Web3 from 'web3';
import { withRouter } from 'react-router-dom';
import './EditProduct.css';

function EditProduct(props) {
    const product = props.currentProduct;
    const productPriceEther = product.price ? Web3.utils.fromWei(product.price.toString(), 'Ether') : '';
    let returnPath = '/yourListedProducts';
    let header = (props.location.state && props.location.state.from === 'YourStash') ? 'Listing Product' : 'Editing Product';

    const handleSubmit = async (event) => {
        event.preventDefault();
        const price = window.web3.utils.toWei(
            event.target.ProductPrice.value.toString(), 'Ether'
        );
        const name = event.target.ProductName.value;
        const listed = true;

        try {
            await props.updateProduct(product.id, name, listed, price);
            props.history.push(returnPath);
        } catch (error) {
            props.history.push(returnPath);
            alert('Update failed. Please try again.');
        }
    };

    return (
        <div className="edit-wrapper">
            <h1>{header}</h1>
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="ProductName">
                    <Form.Label>Product name</Form.Label>
                    <Form.Control
                        placeholder="Enter name"
                        defaultValue={product.name}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="ProductPrice">
                    <Form.Label>Product price (ETH)</Form.Label>
                    <Form.Control
                        placeholder="Enter price (ETH)"
                        defaultValue={productPriceEther === '0' ? '' : productPriceEther}
                        required
                    />
                </Form.Group>
                <Button variant="primary" type="submit">
                    Submit
                </Button>
            </Form>
        </div>
    );
}

export default withRouter(EditProduct);

