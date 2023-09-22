import React from 'react';
import { Navbar, NavDropdown, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function AppNavbar() {
    return (
        <div className='d-flex justify-content-between w-100 bg-body-tertiary mb-4'>
            <Navbar expand="lg">
                <Container>
                    <Navbar.Brand href="#home">React-Bootstrap</Navbar.Brand>
                </Container>
            </Navbar>
            <Navbar expand="lg">
                <Container>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Link to="/app">Dashboard</Link>
                            <Link to="/app/profile">Profile</Link>
                            <Link to="/app/settings">Settings</Link>
                            <Link to="/logout">Logout</Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </div>
    )
}
