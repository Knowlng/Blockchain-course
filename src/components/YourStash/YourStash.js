import React from 'react';
import Table from 'react-bootstrap/Table';
import './YourStash.css';

function YourStash(props) {

    const handleList = (productId) => {
        props.history.push({pathname: `/editProduct/${productId}`,state: { from: 'YourStash' }});
    };

    return (
        <div className="owned-wrapper">
            <h1>Your Stashed Products</h1>
           {props.myProducts.filter(product => !product.listed).length > 0 ? (
                <Table striped bordered hover variant="dark">
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {props.myProducts
                        .filter(product => !product.listed)
                        .map((product, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{product.name}</td>
                            <td>{product.price === '0' ? '-' : window.web3.utils.fromWei(product.price.toString(), 'Ether') + ' ETH'}</td>
                            <td className="button-container">
                            <button
                                className="btn btn-primary"
                                onClick={() => handleList(product.id)}
                            >
                                List
                            </button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </Table>
                ) : (
                <p>You do not have any products stashed.</p>
            )}
        </div>
    );
}

export default YourStash;
