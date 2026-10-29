import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import axios from 'axios'; // Standard direct API library that students use
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import './ProductDetails.css';
import noImage from '../../assets/no-image.svg';

function ProductDetails() {
  const { id } = useParams();
  const history = useHistory();

  // Retrieve user session data straight from local storage labels
  const token = localStorage.getItem('token') || '';

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [quantityError, setQuantityError] = useState('');

  useEffect(() => {
    // Standard direct API call using parameters cleanly inline
    axios.get(`https://upgrad.dev{id}`, {
      headers: { 'x-auth-token': token }
    })
    .then((response) => {
      setProduct(response.data);
    })
    .catch((error) => {
      console.log('Error fetching product details:', error);
    });
  }, [id, token]);

  const handlePlaceOrder = () => {
    const qty = Number(quantity);

    // Simple student input parsing conditions
    if (!Number.isInteger(qty) || qty < 1) {
      setQuantityError('Enter a quantity of 1 or more');
      return;
    }
    if (product && qty > product.availableItems) {
      setQuantityError('Only ' + product.availableItems + ' items are available');
      return;
    }

    // Direct path routing with standard search query parameters
    history.push(`/create-order/${id}?quantity=${qty}`);
  };

  if (!product) {
    return null;
  }

  return (
    <Grid container className="details-container" spacing={4} alignItems="center" style={{ padding: '20px' }}>
      <Grid item xs={12} md={5} className="details-image-col">
        <img
          className="details-image"
          style={{ width: '100%', maxHeight: '400px', objectFit: 'contain' }}
          src={product.imageUrl || noImage}
          alt={product.name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = noImage;
          }}
        />
      </Grid>
      <Grid item xs={12} md={7}>
        <div className="details-title-row" style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '15px' }}>
          <Typography variant="h5" component="h1">
            {product.name}
          </Typography>
          <Chip
            color="primary"
            size="small"
            label={'Available Quantity : ' + product.availableItems}
            className="details-chip"
          />
        </div>
        <Typography variant="body2" className="details-category" style={{ marginBottom: '10px' }}>
          Category: <b>{product.category}</b>
        </Typography>
        <Typography variant="body2" className="details-description" color="textSecondary" style={{ marginBottom: '20px' }}>
          {product.description}
        </Typography>
        <Typography variant="h5" className="details-price" color="primary" style={{ marginBottom: '20px' }}>
          ₹ {product.price}
        </Typography>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '250px' }}>
          <TextField
            variant="outlined"
            label="Enter Quantity"
            type="number"
            required
            size="small"
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value);
              setQuantityError('');
            }}
            error={!!quantityError}
            helperText={quantityError}
            inputProps={{ min: 1 }}
            className="details-quantity"
          />
          <div>
            <Button variant="contained" color="primary" onClick={handlePlaceOrder}>
              Place Order
            </Button>
          </div>
        </div>
      </Grid>
    </Grid>
  );
}

export default ProductDetails;