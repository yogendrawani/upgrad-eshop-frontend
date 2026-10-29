import React, { useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import InputBase from '@material-ui/core/InputBase';
import ShoppingCart from '@material-ui/icons/ShoppingCart';
import SearchIcon from '@material-ui/icons/Search';
import './Navbar.css';
import AppContext from '../../common/AppContext';

function Navbar() {
  const { auth, logout, search, setSearch } = useContext(AppContext);
  const history = useHistory();

  const handleSearch = (event) => {
    setSearch(event.target.value);
    // searching only makes sense on the products page
    if (history.location.pathname !== '/products') {
      history.push('/products');
    }
  };

  const handleLogout = () => {
    logout();
    history.push('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <div className="nav-logo">
          <ShoppingCart />
          <Typography variant="h6" className="nav-title">
            upGrad E-Shop
          </Typography>
        </div>

        <div className="nav-middle">
          {auth.token && (
            <div className="nav-search">
              <div className="nav-search-icon">
                <SearchIcon />
              </div>
              <InputBase
                placeholder="Search..."
                value={search}
                onChange={handleSearch}
                className="nav-search-input"
                inputProps={{ 'aria-label': 'search products' }}
              />
            </div>
          )}
        </div>

        <div className="nav-links">
          {!auth.token ? (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/signup" className="nav-link">Sign Up</Link>
            </>
          ) : (
            <>
              <Link to="/products" className="nav-link">Home</Link>
              {auth.isAdmin && (
                <Link to="/add-product" className="nav-link">Add Product</Link>
              )}
              <Button variant="contained" color="secondary" size="small" onClick={handleLogout}>
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
