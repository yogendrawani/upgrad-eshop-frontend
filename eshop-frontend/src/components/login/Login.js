import React, { useContext, useState } from 'react';
import { Link, Redirect, useHistory } from 'react-router-dom';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import './Login.css';
import AppContext from '../../common/AppContext';
import Copyright from '../../common/Copyright';
import { request } from '../../common/api';

// works out if the user is an admin from whatever the api sends back
function checkAdmin(data) {
  const roles = (data && (data.roles || data.role)) || [];
  const list = Array.isArray(roles) ? roles : [roles];
  return list.some((r) => {
    const name = typeof r === 'string' ? r : r && (r.name || r.role);
    return name && name.toUpperCase().includes('ADMIN');
  });
}

function Login() {
  const { auth, login, notify } = useContext(AppContext);
  const history = useHistory();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  if (auth.token) {
    return <Redirect to="/products" />;
  }

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    try {
      const { data, headers } = await request('/auth/signin', {
        method: 'POST',
        body: { username: email, password: password },
      });
      const token = headers.get('x-auth-token') || (data && (data.token || data.accessToken));
      if (!token) {
        notify('Login failed. No token received.', 'error');
        return;
      }
      login({ token: token, isAdmin: checkAdmin(data), email: email });
      history.push('/products');
    } catch (error) {
      notify(error.status === 401 ? 'Invalid email or password' : error.message, 'error');
    }
  };

  return (
    <Container component="div" maxWidth="xs" className="login-container">
      <div className="login-paper">
        <Avatar className="login-avatar">
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <form className="login-form" onSubmit={handleSubmit} noValidate>
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
            error={!!errors.email}
            helperText={errors.email}
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
            error={!!errors.password}
            helperText={errors.password}
          />
          <Button type="submit" fullWidth variant="contained" color="primary" className="login-submit">
            Sign In
          </Button>
          <Link to="/signup" className="login-link">
            Don't have an account? Sign Up
          </Link>
        </form>
      </div>
      <div className="login-footer">
        <Copyright />
      </div>
    </Container>
  );
}

export default Login;
