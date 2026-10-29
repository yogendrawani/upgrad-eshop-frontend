import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import InputBase from '@material-ui/core/InputBase';
import ShoppingCart from '@material-ui/icons/ShoppingCart';
import SearchIcon from '@material-ui/icons/Search';
import './Navbar.css';

function Navbar({ token, isAdmin, onLogout, search, setSearch }) {
  const history = useHistory();

  const handleSearch = (event) => {
    setSearch(event.target.value);
    // automatically bounce the user to the products view if they try typing while on checkout/details
    if (history.location.pathname !== '/products') {
      history.push('/products');
    }
  };

  const handleLogoutClick = () => {
    onLogout();
    history.push('/login');
  };

  return (
    <AppBar position="static" style={{ backgroundColor: '#3f51b5' }}>
      <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
        
        {/* Logo and Brand Branding Element */}
        <div className="nav-logo" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => history.push('/products')}>
          <ShoppingCart style={{ marginRight: '8px' }} />
          <Typography variant="h6" className="nav-title">
            upGrad E-Shop
          </Typography>
        </div>

        {/* Dynamic Search Box Input */}
        <div className="nav-middle">
          {token && (
            <div className="nav-search" style={{ position: 'relative', display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.15)', padding: '2px 10px', borderRadius: '4px', width: '250px' }}>
              <SearchIcon style={{ marginRight: '8px', fontSize: '20px' }} />
              <InputBase
                placeholder="Search..."
                value={search}
                onChange={handleSearch}
                className="nav-search-input"
                style={{ color: 'white', width: '100%' }}
                inputProps={{ 'aria-label': 'search products' }}
              />
            </div>
          )}
        </div>

        {/* Navigation Action Buttons */}
        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {!token ? (
            <>
              <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>Login</Link>
              <Link to="/signup" style={{ color: 'white', textDecoration: 'none' }}>Sign Up</Link>
            </>
          ) : (
            <>
              <Link to="/products" style={{ color: 'white', textDecoration: 'none' }}>Home</Link>
              {isAdmin && (
                <Link to="/add-product" style={{ color: 'white', textDecoration: 'none' }}>Add Product</Link>
              )}
              <Button variant="contained" color="secondary" size="small" onClick={handleLogoutClick} style={{ marginLeft: '10px' }}>
                Logout
              </Button>
            </>
          )}
        </div>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;