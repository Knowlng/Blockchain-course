import React, { useState, useEffect, useRef } from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import './YourListedProducts.css';

function YourListedProducts(props) {

    const [show, setShow] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    const handleShow = (productId) => {
        setSelectedProductId(productId);
        setShow(true);
    };

    const handleClose = () => {
        setSelectedProductId(null);
        setShow(false);
    };

    const handleRemove = async () => {
        try {
            await props.removeProduct(selectedProductId);
            if (isMounted.current) {
                setShow(false);
            }
        } catch (error) {
            if (isMounted.current) {
                alert('Remove failed. Please try again.');
                setShow(false);
            }
        }
    };

    const handleEdit = (productId) => {
        props.history.push({pathname: `/editProduct/${productId}`, state: { from: 'YourListedProducts' }});
    };

    return (
        <div className="listed-wrapper">
            <h1>Your Listed Products</h1>
           {props.myProducts.filter(product => product.listed).length > 0 ? (
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
                        .filter(product => product.listed)
                        .map((product, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{product.name}</td>
                            <td>{window.web3.utils.fromWei(product.price.toString(), 'Ether')} ETH</td>
                            <td className="button-container">
                            <button
                                className="btn btn-primary"
                                onClick={() => handleEdit(product.id)}
                            >
                                Edit
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={() => handleShow(product.id.toString())}
                            >
                                Remove
                            </button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </Table>
                ) : (
                <p>You have not listed any products yet.</p>
            )}
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to remove this listing?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleRemove}>
                        Remove
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default YourListedProducts;
