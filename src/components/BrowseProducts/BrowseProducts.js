import React from 'react';
import Table from 'react-bootstrap/Table';
import './BrowseProducts.css';

function BrowseProducts(props) {
  return (
    <div className="browse-wrapper">
      <h1>Browse Products</h1>
      <Table striped bordered hover variant="dark">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Price</th>
            <th>Owner</th>
            {props.account ? ( <th>Action</th> ): (null) }
          </tr>
        </thead>
       <tbody>
        {props.products
          .filter(product => product.listed && product.owner.toLowerCase() !== props.account.toLowerCase())
          .length > 0 ? (
          props.products
            .filter(product => product.listed && product.owner.toLowerCase() !== props.account.toLowerCase())
            .map((product, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{product.name}</td>
                <td>{window.web3.utils.fromWei(product.price.toString(), 'Ether')} ETH</td>
                <td>{product.owner}</td>
                {props.account ? (
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => props.purchaseProduct(product.id, product.price)}
                    >
                      Buy
                    </button>
                  </td>
                ) : null}
              </tr>
            ))
        ) : (
          <tr>
            <td colSpan="5">
              <p className="text-center">No products listed on the marketplace currently</p>
            </td>
          </tr>
        )}
      </tbody>
      </Table>
    </div>
  );
}

export default BrowseProducts;
