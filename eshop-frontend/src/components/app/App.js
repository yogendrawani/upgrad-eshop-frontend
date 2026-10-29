import React, { useState } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import './App.css';
import AppContext from '../../common/AppContext';
import ProtectedRoute from '../../common/ProtectedRoute';
import Notification from '../../common/Notification';
import Navbar from '../navbar/Navbar';
import CategoryTabs from '../categoryTabs/CategoryTabs';
import Login from '../login/Login';
import Signup from '../signup/Signup';
import Products from '../products/Products';
import ProductDetails from '../productDetails/ProductDetails';
import CreateOrder from '../createOrder/CreateOrder';
import ProductForm from '../productForm/ProductForm';

const STORAGE_KEY = 'eshop-auth';
const emptyAuth = { token: '', isAdmin: false, email: '' };

function readSavedAuth() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : emptyAuth;
  } catch (e) {
    return emptyAuth;
  }
}

function App() {
  const [auth, setAuth] = useState(readSavedAuth());
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const login = (userAuth) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userAuth));
    setAuth(userAuth);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAuth(emptyAuth);
    setSearch('');
    setCategory('all');
  };

  const notify = (message, severity = 'success') => {
    setToast({ open: true, message, severity });
  };

  const closeToast = (event, reason) => {
    if (reason === 'clickaway') return;
    setToast({ ...toast, open: false });
  };

  const contextValue = { auth, login, logout, notify, search, setSearch, category, setCategory };

  return (
    <AppContext.Provider value={contextValue}>
      <Navbar />
      {auth.token && <CategoryTabs />}
      <main className="app-content">
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/signup" component={Signup} />
          <ProtectedRoute exact path="/products" component={Products} />
          <ProtectedRoute path="/products/:id" component={ProductDetails} />
          <ProtectedRoute path="/create-order/:id" component={CreateOrder} />
          <ProtectedRoute adminOnly path="/add-product" component={ProductForm} />
          <ProtectedRoute adminOnly path="/modify-product/:id" component={ProductForm} />
          <Redirect to={auth.token ? '/products' : '/login'} />
        </Switch>
      </main>
      <Notification
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={closeToast}
      />
    </AppContext.Provider>
  );
}

export default App;
