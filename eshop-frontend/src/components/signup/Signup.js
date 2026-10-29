import React, { useContext, useState } from 'react';
import { Link, Redirect, useHistory } from 'react-router-dom';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import './Signup.css';
import AppContext from '../../common/AppContext';
import Copyright from '../../common/Copyright';
import { request } from '../../common/api';

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  contactNumber: '',
};

function Signup() {
  const { auth, notify } = useContext(AppContext);
  const history = useHistory();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  if (auth.token) {
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
    if (!validate()) return;

    try {
      await request('/auth/signup', {
        method: 'POST',
        body: {
          email: form.email,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
          contactNumber: form.contactNumber,
        },
      });
      notify('Sign up successful. Please sign in.');
      history.push('/login');
    } catch (error) {
      notify(error.message, 'error');
    }
  };

  const field = (name, label, type = 'text') => (
    <TextField
      variant="outlined"
      margin="normal"
      required
      fullWidth
      id={name}
      name={name}
      label={label}
      type={type}
      value={form[name]}
      onChange={handleChange}
      error={!!errors[name]}
      helperText={errors[name]}
    />
  );

  return (
    <Container component="div" maxWidth="xs" className="signup-container">
      <div className="signup-paper">
        <Avatar className="signup-avatar">
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <form className="signup-form" onSubmit={handleSubmit} noValidate>
          {field('firstName', 'First Name')}
          {field('lastName', 'Last Name')}
          {field('email', 'Email Address')}
          {field('password', 'Password', 'password')}
          {field('confirmPassword', 'Confirm Password', 'password')}
          {field('contactNumber', 'Contact Number')}
          <Button type="submit" fullWidth variant="contained" color="primary" className="signup-submit">
            Sign Up
          </Button>
          <div className="signup-link-row">
            <Link to="/login" className="signup-link">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
      <div className="signup-footer">
        <Copyright />
      </div>
    </Container>
  );
}

export default Signup;
