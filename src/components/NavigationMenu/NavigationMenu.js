import React from 'react';
import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import Nav from 'react-bootstrap/Nav';
import './NavigationMenu.css';


function NavigationMenu(props) {
  return (
    <Navbar className="bg-body-tertiary" bg="dark" data-bs-theme="dark">
      <Container>
        <Navbar.Brand as={Link} to="/">Marketplace</Navbar.Brand>
        <Nav>
          <Nav.Link as={Link} to="/BrowseProducts">Browse Products</Nav.Link>
        </Nav>
       {props.account ? (
          <>
            <Nav>
              <Nav.Link as={Link} to="/addProduct">Add Product</Nav.Link>
            </Nav>
            <Nav>
              <Nav.Link as={Link} to="/yourListedProducts">Your Listed Products</Nav.Link>
            </Nav>
            <Nav>
              <Nav.Link as={Link} to="/yourStash">Stash</Nav.Link>
            </Nav>
          </>
        ) : null}
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text className="account-container" >{props.account}</Navbar.Text>
           { !props.account ? <Button variant="secondary" onClick={props.loginMetamask}>Login</Button> : null }
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavigationMenu;