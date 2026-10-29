import React from 'react';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import './ProductCard.css';
import noImage from '../../assets/no-image.svg';

function ProductCard({ product, isAdmin, onBuy, onEdit, onDelete }) {
  const handleImageError = (event) => {
    event.target.onerror = null;
    event.target.src = noImage;
  };

  return (
    <Card className="product-card">
      <CardMedia
        component="img"
        className="product-card-image"
        image={product.imageUrl || noImage}
        alt={product.name}
        onError={handleImageError}
      />
      <CardContent className="product-card-content">
        <div className="product-card-heading">
          <Typography gutterBottom variant="h6" component="h2" className="product-card-name">
            {product.name}
          </Typography>
          <Typography gutterBottom variant="h6" component="h2">
            ₹ {product.price}
          </Typography>
        </div>
        <Typography variant="body2" color="textSecondary" className="product-card-description">
          {product.description}
        </Typography>
      </CardContent>
      <CardActions className="product-card-actions">
        <Button variant="contained" color="primary" size="small" onClick={() => onBuy(product)}>
          Buy
        </Button>
        {isAdmin && (
          <div>
            <IconButton aria-label="edit product" onClick={() => onEdit(product)}>
              <EditIcon />
            </IconButton>
            <IconButton aria-label="delete product" onClick={() => onDelete(product)}>
              <DeleteIcon />
            </IconButton>
          </div>
        )}
      </CardActions>
    </Card>
  );
}

export default ProductCard;
