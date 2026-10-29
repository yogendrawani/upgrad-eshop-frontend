import React, { useState } from 'react';
import { Link, Redirect, useHistory } from 'react-router-dom';
import axios from 'axios'; // Standard direct API library that students use
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import './Login.css';

function Login({ setToken, setIsAdmin, token }) {
  const history = useHistory();
  
  // Simple form input and error states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [apiError, setApiError] = useState('');

  // Redirect instantly if the token is already present
  if (token) {
    return <Redirect to="/products" />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Clear old errors
    setEmailError('');
    setPasswordError('');
    setApiError('');

    // Standard local input validation
    let isValid = true;
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    }
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    }

    if (!isValid) return;

    try {
      // Direct post request to the specified development API endpoint
      const response = await axios.post('https://upgrad.dev', {
        username: email,
        password: password
      });

      // Reading the authentic token header value
      const authToken = response.headers['x-auth-token'] || response.data.token;
      
      if (authToken) {
        localStorage.setItem('token', authToken);
        setToken(authToken);

        // Straightforward check to see if the user has an admin role
        const userRole = response.data.role || response.data.roles;
        const isAdminUser = userRole === 'ADMIN' || userRole === 'admin';
        
        localStorage.setItem('isAdmin', isAdminUser);
        setIsAdmin(isAdminUser);

        // Move directly to the catalog overview
        history.push('/products');
      } else {
        setApiError('Login failed. No security token received.');
      }

    } catch (error) {
      if (error.response && error.response.status === 401) {
        setApiError('Invalid email or password');
      } else {
        setApiError('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <Container component="div" maxWidth="xs" className="login-container">
      <div className="login-paper" style={{ marginTop: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        <Avatar style={{ backgroundColor: '#f50057', marginBottom: '10px' }}>
          <LockOutlinedIcon />
        </Avatar>

        <Typography component="h1" variant="h5">
          Sign in
        </Typography>

        {apiError && (
          <Typography color="error" style={{ marginTop: '10px', fontSize: '14px' }}>
            {apiError}
          </Typography>
        )}

        <form style={{ width: '100%', marginTop: '10px' }} onSubmit={handleSubmit} noValidate>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!emailError}
            helperText={emailError}
          />

          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!passwordError}
            helperText={passwordError}
          />

          <Button 
            type="submit" 
            fullWidth 
            variant="contained" 
            color="primary" 
            style={{ margin: '20px 0 15px' }}
          >
            Sign In
          </Button>

          <div style={{ textAlign: 'center' }}>
            <Link to="/signup" style={{ textDecoration: 'none', color: '#3f51b5', fontSize: '14px' }}>
              Don't have an account? Sign Up
            </Link>
          </div>
        </form>
      </div>
    </Container>
  );
}

export default Login;