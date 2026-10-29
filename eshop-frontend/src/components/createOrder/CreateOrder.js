import React, { useContext, useEffect, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
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
import AppContext from '../../common/AppContext';
import { request, toList, getId } from '../../common/api';

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
  const { auth, notify } = useContext(AppContext);

  const quantity = Number(new URLSearchParams(location.search).get('quantity')) || 1;

  const [activeStep, setActiveStep] = useState(0);
  const [product, setProduct] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [newAddress, setNewAddress] = useState(emptyAddress);
  const [errors, setErrors] = useState({});

  const loadAddresses = async () => {
    try {
      const { data } = await request('/addresses', { token: auth.token });
      setAddresses(toList(data));
    } catch (error) {
      notify(error.message, 'error');
    }
  };

  useEffect(() => {
    request('/products/' + id, { token: auth.token })
      .then(({ data }) => setProduct(data))
      .catch((error) => notify(error.message, 'error'));
    loadAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAddressChange = (event) => {
    setNewAddress({ ...newAddress, [event.target.name]: event.target.value });
  };

  const validateAddress = () => {
    const newErrors = {};
    ['name', 'contactNumber', 'street', 'city', 'state', 'zipcode'].forEach((key) => {
      if (!newAddress[key].trim()) newErrors[key] = 'Required';
    });
    if (newAddress.contactNumber && !/^\d{10}$/.test(newAddress.contactNumber)) {
      newErrors.contactNumber = 'Enter a 10 digit number';
    }
    if (newAddress.zipcode && !/^\d{6}$/.test(newAddress.zipcode)) {
      newErrors.zipcode = 'Enter a 6 digit zip code';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveAddress = async () => {
    if (!validateAddress()) return;
    try {
      await request('/addresses', { method: 'POST', body: newAddress, token: auth.token });
      notify('Address saved successfully');
      setNewAddress(emptyAddress);
      loadAddresses();
    } catch (error) {
      notify(error.message, 'error');
    }
  };

  const handleNext = () => {
    if (activeStep === 1 && !selectedAddress) {
      notify('Please select address!', 'error');
      return;
    }
    setActiveStep(activeStep + 1);
  };

  const placeOrder = async () => {
    try {
      await request('/orders', {
        method: 'POST',
        token: auth.token,
        body: { quantity: quantity, product: id, address: selectedAddress },
      });
      history.push('/products');
      notify('Order placed successfully!');
    } catch (error) {
      notify(error.message, 'error');
    }
  };

  const addressText = (a) => a.name + ' --> ' + a.street + ', ' + a.city;
  const chosenAddress = addresses.find((a) => getId(a) === selectedAddress);

  const textField = (name, label, required = true) => (
    <TextField
      variant="outlined"
      size="small"
      margin="dense"
      fullWidth
      required={required}
      name={name}
      label={label}
      value={newAddress[name]}
      onChange={handleAddressChange}
      error={!!errors[name]}
      helperText={errors[name]}
    />
  );

  const itemsStep = product && (
    <div className="order-summary">
      <Typography variant="h5">{product.name}</Typography>
      <Typography variant="body2" className="order-line">Quantity: <b>{quantity}</b></Typography>
      <Typography variant="body2" className="order-line">Category: <b>{product.category}</b></Typography>
      <Typography variant="body2" className="order-line order-description">{product.description}</Typography>
      <Typography variant="h6" className="order-total">Total Price : ₹ {product.price * quantity}</Typography>
    </div>
  );

  const addressStep = (
    <div className="order-address-step">
      <TextField
        select
        fullWidth
        size="small"
        label="Select Address"
        value={selectedAddress}
        onChange={(e) => setSelectedAddress(e.target.value)}
      >
        {addresses.map((a) => (
          <MenuItem key={getId(a)} value={getId(a)}>
            {addressText(a)}
          </MenuItem>
        ))}
      </TextField>

      <Typography align="center" className="order-or">-OR-</Typography>
      <Typography variant="h6" align="center">Add Address</Typography>
      <div className="order-address-form">
        {textField('name', 'Name')}
        {textField('contactNumber', 'Contact Number')}
        {textField('street', 'Street')}
        {textField('city', 'City')}
        {textField('state', 'State')}
        {textField('landmark', 'Landmark', false)}
        {textField('zipcode', 'Zip Code')}
        <Button fullWidth variant="contained" color="primary" onClick={saveAddress} className="order-save">
          Save Address
        </Button>
      </div>
    </div>
  );

  const confirmStep = product && chosenAddress && (
    <Grid container>
      <Grid item xs={12} md={7} className="order-confirm-left">
        {itemsStep}
      </Grid>
      <Grid item xs={12} md={5} className="order-confirm-right">
        <Typography variant="h5">Address Details :</Typography>
        <Typography variant="body2" className="order-line">{chosenAddress.name}</Typography>
        <Typography variant="body2" className="order-line">Contact Number: {chosenAddress.contactNumber}</Typography>
        <Typography variant="body2" className="order-line">{chosenAddress.street}, {chosenAddress.city}</Typography>
        <Typography variant="body2" className="order-line">{chosenAddress.state}</Typography>
        <Typography variant="body2" className="order-line">{chosenAddress.zipcode}</Typography>
      </Grid>
    </Grid>
  );

  return (
    <div className="order-page">
      <Paper className="order-paper">
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <div className="order-step-body">
          {activeStep === 0 && itemsStep}
          {activeStep === 1 && addressStep}
          {activeStep === 2 && confirmStep}
        </div>

        <div className="order-buttons">
          <Button
            disabled={activeStep === 0}
            onClick={() => setActiveStep(activeStep - 1)}
          >
            Back
          </Button>
          {activeStep < 2 ? (
            <Button variant="contained" color="primary" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button variant="contained" color="primary" onClick={placeOrder}>
              Place Order
            </Button>
          )}
        </div>
      </Paper>
    </div>
  );
}

export default CreateOrder;
