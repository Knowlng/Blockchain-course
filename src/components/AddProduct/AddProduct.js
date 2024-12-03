import React from 'react'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import './AddProduct.css';

function AddProduct(props) {
  return (
  <div className="add-wrapper">
    <h1>Add product</h1>
    <Form onSubmit={(event) => {
      event.preventDefault();
      const price = window.web3.utils.toWei(event.target.ProductPrice.value.toString(), 'Ether');
      const name = event.target.ProductName.value;
      props.createProduct(name, price);
    }}>
      <Form.Group className="mb-3" controlId="ProductName">
        <Form.Label>Product name</Form.Label>
        <Form.Control placeholder="Enter name" />
      </Form.Group>
      <Form.Group className="mb-3" controlId="ProductPrice">
        <Form.Label>Product price</Form.Label>
        <Form.Control placeholder="Enter price (ETH)" />
      </Form.Group>
      <Button variant="primary" type="submit">
        Submit
      </Button>
    </Form>
  </div>

  );
}

export default AddProduct;