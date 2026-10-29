import React, { useContext, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import './ProductDetails.css';
import AppContext from '../../common/AppContext';
import { request } from '../../common/api';
import noImage from '../../assets/no-image.svg';

function ProductDetails() {
  const { id } = useParams();
  const history = useHistory();
  const { auth, notify } = useContext(AppContext);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [quantityError, setQuantityError] = useState('');

  useEffect(() => {
    request('/products/' + id, { token: auth.token })
      .then(({ data }) => setProduct(data))
      .catch((error) => notify(error.message, 'error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handlePlaceOrder = () => {
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1) {
      setQuantityError('Enter a quantity of 1 or more');
      return;
    }
    if (qty > product.availableItems) {
      setQuantityError('Only ' + product.availableItems + ' items are available');
      return;
    }
    history.push('/create-order/' + id + '?quantity=' + qty);
  };

  if (!product) {
    return null;
  }

  return (
    <Grid container className="details-container" spacing={4} alignItems="center">
      <Grid item xs={12} md={5} className="details-image-col">
        <img
          className="details-image"
          src={product.imageUrl || noImage}
          alt={product.name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = noImage;
          }}
        />
      </Grid>
      <Grid item xs={12} md={7}>
        <div className="details-title-row">
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
        <Typography variant="body2" className="details-category">
          Category: <b>{product.category}</b>
        </Typography>
        <Typography variant="body2" className="details-description">
          {product.description}
        </Typography>
        <Typography variant="h5" className="details-price">
          ₹ {product.price}
        </Typography>
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
      </Grid>
    </Grid>
  );
}

export default ProductDetails;
