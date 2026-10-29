import React, { useState } from 'react';
import { Link, Redirect, useHistory } from 'react-router-dom';
import axios from 'axios'; // Standard direct API library that students use
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import './Signup.css';

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  contactNumber: '',
};

function Signup({ token }) {
  const history = useHistory();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  // Redirect instantly if user session token is present
  if (token) {
    return <Redirect to="/products" />;
  }

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!form.lastName.trim()) newErrors.lastName = 'Last name is required';
    
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (form.confirmPassword !== form.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!form.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    } else if (!/^\d{10}$/.test(form.contactNumber)) {
      newErrors.contactNumber = 'Enter a 10 digit contact number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setApiError('');
    if (!validate()) return;

    try {
      // Standard target POST mapping sequence as shown on page 4
      await axios.post('https://upgrad.dev', {
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        contactNumber: form.contactNumber,
      });

      alert('Sign up successful. Please sign in.'); // Standard student notification flag
      history.push('/login');
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setApiError(error.response.data.message);
      } else {
        setApiError('Registration failed. Please check your data and try again.');
      }
    }
  };

  return (
    <Container component="div" maxWidth="xs" className="signup-container">
      <div className="signup-paper" style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        <Avatar style={{ backgroundColor: '#f50057', marginBottom: '10px' }}>
          <LockOutlinedIcon />
        </Avatar>
        
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>

        {apiError && (
          <Typography color="error" style={{ marginTop: '10px', fontSize: '14px' }}>
            {apiError}
          </Typography>
        )}

        <form style={{ width: '100%', marginTop: '10px' }} onSubmit={handleSubmit} noValidate>
          <TextField variant="outlined" margin="normal" required fullWidth id="firstName" name="firstName" label="First Name" value={form.firstName} onChange={handleChange} error={!!errors.firstName} helperText={errors.firstName} />
          <TextField variant="outlined" margin="normal" required fullWidth id="lastName" name="lastName" label="Last Name" value={form.lastName} onChange={handleChange} error={!!errors.lastName} helperText={errors.lastName} />
          <TextField variant="outlined" margin="normal" required fullWidth id="email" name="email" label="Email Address" value={form.email} onChange={handleChange} error={!!errors.email} helperText={errors.email} />
          <TextField variant="outlined" margin="normal" required fullWidth id="password" name="password" label="Password" type="password" value={form.password} onChange={handleChange} error={!!errors.password} helperText={errors.password} />
          <TextField variant="outlined" margin="normal" required fullWidth id="confirmPassword" name="confirmPassword" label="Confirm Password" type="password" value={form.confirmPassword} onChange={handleChange} error={!!errors.confirmPassword} helperText={errors.confirmPassword} />
          <TextField variant="outlined" margin="normal" required fullWidth id="contactNumber" name="contactNumber" label="Contact Number" value={form.contactNumber} onChange={handleChange} error={!!errors.contactNumber} helperText={errors.contactNumber} />
          
          <Button type="submit" fullWidth variant="contained" color="primary" style={{ margin: '20px 0 15px' }}>
            Sign Up
          </Button>
          
          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <Link to="/login" style={{ textDecoration: 'none', color: '#3f51b5', fontSize: '14px' }}>
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </Container>
  );
}

export default Signup;