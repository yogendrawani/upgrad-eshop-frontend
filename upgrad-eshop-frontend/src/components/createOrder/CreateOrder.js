import React, { useEffect, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import './CreateOrder.css';

const steps = ['Items', 'Select Address', 'Confirm Order'];

const emptyAddress = {
  name: '',
  contactNumber: '',
  street: '',
  city: '',
  state: '',
  landmark: '',
  zipcode: '',
};

function CreateOrder() {
  const { id } = useParams();
  const location = useLocation();
  const history = useHistory();

  // Retrieve auth details directly from localStorage to keep state lightweight and natural
  const token = localStorage.getItem('token') || '';

  const quantity = Number(new URLSearchParams(location.search).get('quantity')) || 1;

  const [activeStep, setActiveStep] = useState(0);
  const [product, setProduct] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [newAddress, setNewAddress] = useState(emptyAddress);
  const [errors, setErrors] = useState({});
  const [errorMsg, setErrorMsg] = useState('');

  const loadAddresses = () => {
    axios.get('https://upgrad.dev', {
      headers: { 'x-auth-token': token }
    })
    .then((response) => {
      setAddresses(Array.isArray(response.data) ? response.data : []);
    })
    .catch((error) => {
      console.log('Error loading addresses:', error);
    });
  };

  useEffect(() => {
    // Fetch product details directly
    axios.get(`https://upgrad.dev{id}`, {
      headers: { 'x-auth-token': token }
    })
    .then((response) => {
      setProduct(response.data);
    })
    .catch((error) => {
      console.log('Error loading product details:', error);
    });

    loadAddresses();
  }, [id, token]);

  const handleAddressChange = (event) => {
    setNewAddress({ ...newAddress, [event.target.name]: event.target.value });
  };

  const validateAddress = () => {
    const newErrors = {};
    if (!newAddress.name.trim()) newErrors.name = 'Required';
    if (!newAddress.contactNumber.trim()) newErrors.contactNumber = 'Required';
    if (!newAddress.street.trim()) newErrors.street = 'Required';
    if (!newAddress.city.trim()) newErrors.city = 'Required';
    if (!newAddress.state.trim()) newErrors.state = 'Required';
    if (!newAddress.zipcode.trim()) newErrors.zipcode = 'Required';

    if (newAddress.contactNumber && !/^\d{10}$/.test(newAddress.contactNumber)) {
      newErrors.contactNumber = 'Enter a 10 digit number';
    }
    if (newAddress.zipcode && !/^\d{6}$/.test(newAddress.zipcode)) {
      newErrors.zipcode = 'Enter a 6 digit zip code';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveAddress = () => {
    if (!validateAddress()) return;
    setErrorMsg('');

    axios.post('https://upgrad.dev', newAddress, {
      headers: { 'x-auth-token': token }
    })
    .then(() => {
      alert('Address saved successfully'); // Direct simple student notification
      setNewAddress(emptyAddress);
      loadAddresses();
    })
    .catch((error) => {
      setErrorMsg('Failed to save address.');
    });
  };

  const handleNext = () => {
    // Exact requirement check from manual page 20
    if (activeStep === 1 && !selectedAddress) {
      alert('Please select address!');
      return;
    }
    setActiveStep(activeStep + 1);
  };

  const placeOrder = () => {
    axios.post('https://upgrad.dev', {
      quantity: quantity,
      product: id,
      address: selectedAddress
    }, {
      headers: { 'x-auth-token': token }
    })
    .then(() => {
      alert('Order placed successfully!'); // Direct target requirement
      history.push('/products');
    })
    .catch((error) => {
      alert('Error placing order.');
    });
  };

  // Safe mapping of database properties without hidden helper definitions
  const chosenAddress = addresses.find((a) => (a.id || a._id) === selectedAddress);

  return (
    <div className="order-page" style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <Paper className="order-paper" style={{ padding: '20px' }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <div className="order-step-body" style={{ margin: '30px 0' }}>
          {/* Step 1 View */}
          {activeStep === 0 && product && (
            <div className="order-summary">
              <Typography variant="h5">{product.name}</Typography>
              <Typography variant="body1" style={{ marginTop: '10px' }}>Quantity: <b>{quantity}</b></Typography>
              <Typography variant="body1">Category: <b>{product.category}</b></Typography>
              <Typography variant="body2" color="textSecondary" style={{ margin: '15px 0' }}>{product.description}</Typography>
              <Typography variant="h6" color="primary">Total Price : ₹ {product.price * quantity}</Typography>
            </div>
          )}

          {/* Step 2 View */}
          {activeStep === 1 && (
            <div className="order-address-step">
              {errorMsg && <Typography color="error">{errorMsg}</Typography>}
              
              <TextField
                select
                fullWidth
                variant="outlined"
                size="small"
                label="Select Address"
                value={selectedAddress}
                onChange={(e) => setSelectedAddress(e.target.value)}
              >
                {addresses.map((a) => {
                  const addrId = a.id || a._id;
                  return (
                    <MenuItem key={addrId} value={addrId}>
                      {`${a.name} --> ${a.street}, ${a.city}`}
                    </MenuItem>
                  );
                })}
              </TextField>

              <Typography align="center" style={{ margin: '20px 0', fontWeight: 'bold' }}>-OR-</Typography>
              <Typography variant="h6" align="center" style={{ marginBottom: '15px' }}>Add Address</Typography>
              
              <div className="order-address-form" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <TextField variant="outlined" size="small" fullWidth required name="name" label="Name" value={newAddress.name} onChange={handleAddressChange} error={!!errors.name} helperText={errors.name} />
                <TextField variant="outlined" size="small" fullWidth required name="contactNumber" label="Contact Number" value={newAddress.contactNumber} onChange={handleAddressChange} error={!!errors.contactNumber} helperText={errors.contactNumber} />
                <TextField variant="outlined" size="small" fullWidth required name="street" label="Street" value={newAddress.street} onChange={handleAddressChange} error={!!errors.street} helperText={errors.street} />
                <TextField variant="outlined" size="small" fullWidth required name="city" label="City" value={newAddress.city} onChange={handleAddressChange} error={!!errors.city} helperText={errors.city} />
                <TextField variant="outlined" size="small" fullWidth required name="state" label="State" value={newAddress.state} onChange={handleAddressChange} error={!!errors.state} helperText={errors.state} />
                <TextField variant="outlined" size="small" fullWidth name="landmark" label="Landmark" value={newAddress.landmark} onChange={handleAddressChange} />
                <TextField variant="outlined" size="small" fullWidth required name="zipcode" label="Zip Code" value={newAddress.zipcode} onChange={handleAddressChange} error={!!errors.zipcode} helperText={errors.zipcode} />
                
                <Button fullWidth variant="contained" color="primary" onClick={saveAddress}>
                  Save Address
                </Button>
              </div>
            </div>
          )}

          {/* Step 3 View */}
          {activeStep === 2 && product && chosenAddress && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={7}>
                <Typography variant="h5">{product.name}</Typography>
                <Typography variant="body1" style={{ marginTop: '10px' }}>Quantity: <b>{quantity}</b></Typography>
                <Typography variant="body1">Category: <b>{product.category}</b></Typography>
                <Typography variant="body2" color="textSecondary" style={{ margin: '15px 0' }}>{product.description}</Typography>
                <Typography variant="h6" color="primary">Total Price : ₹ {product.price * quantity}</Typography>
              </Grid>
              <Grid item xs={12} md={5} style={{ borderLeft: '1px solid #ccc', paddingLeft: '20px' }}>
                <Typography variant="h5" style={{ marginBottom: '10px' }}>Address Details :</Typography>
                <Typography variant="body1"><b>{chosenAddress.name}</b></Typography>
                <Typography variant="body2">Contact Number: {chosenAddress.contactNumber}</Typography>
                <Typography variant="body2">{chosenAddress.street}, {chosenAddress.city}</Typography>
                <Typography variant="body2">{chosenAddress.state}</Typography>
                <Typography variant="body2">{chosenAddress.zipcode}</Typography>
              </Grid>