import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FormCheck from 'react-bootstrap/FormCheck';
import './AddProduct.css';

function AddProduct(props) {
  const [listOnMarketplace, setListOnMarketplace] = useState(false);

  return (
    <div className="add-wrapper">
      <h1>Add Product</h1>
      <Form onSubmit={(event) => {
        event.preventDefault();
        let price = '0';
        const name = event.target.ProductName.value;
        if (listOnMarketplace) {
          price = window.web3.utils.toWei(event.target.ProductPrice.value.toString(), 'Ether');
        }
        props.createProduct(name, price, listOnMarketplace);
      }}>
        <Form.Group className="mb-3" controlId="ProductName">
          <Form.Label>Product Name</Form.Label>
          <Form.Control type="text" placeholder="Enter name" required />
        </Form.Group>
        
        <Form.Group className="mb-3" controlId="MarketplaceListing">
          <FormCheck 
            type="checkbox"
            label="List item on marketplace?"
            checked={listOnMarketplace}
            onChange={(e) => setListOnMarketplace(e.target.checked)}
          />
        </Form.Group>

        {listOnMarketplace && (
          <Form.Group className="mb-3" controlId="ProductPrice">
            <Form.Label>Product Price (ETH)</Form.Label>
            <Form.Control type="text" placeholder="Enter price (ETH)" required />
          </Form.Group>
        )}

        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form>
    </div>
  );
}

export default AddProduct;
