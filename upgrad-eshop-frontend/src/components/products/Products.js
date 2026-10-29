import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios'; // Standard direct API library that students use
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Select from 'react-select';
import './Products.css';
import ProductCard from '../productCard/ProductCard';

const sortOptions = [
  { value: 'default', label: 'Default' },
  { value: 'high', label: 'Price: High to Low' },
  { value: 'low', label: 'Price: Low to High' },
  { value: 'newest', label: 'Newest' },
];

function getTime(product) {
  return Date.parse(product.updatedAt || product.createdAt || '') || 0;
}

function Products({ search, category }) {
  const history = useHistory();

  // Pull global session labels right from local browser storage references
  const token = localStorage.getItem('token') || '';
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  const loadProducts = () => {
    setLoading(true);
    axios.get('https://upgrad.dev')
      .then((response) => {
        setProducts(Array.isArray(response.data) ? response.data : []);
      })
      .catch((error) => {
        console.log('Error loading catalog records:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Simple direct local sorting filter matching assignment instructions pages 15 & 17
  let visible = products.filter((p) => {
    const matchesCategory = !category || category === 'ALL' || (p.category || '').toUpperCase() === category;
    const matchesSearch = (p.name || '').toLowerCase().includes((search || '').trim().toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortValue = sortBy ? sortBy.value : 'default';
  if (sortValue === 'high') {
    visible = [...visible].sort((a, b) => b.price - a.price);
  } else if (sortValue === 'low') {
    visible = [...visible].sort((a, b) => a.price - b.price);
  } else if (sortValue === 'newest') {
    const indexed = visible.map((p, i) => ({ p, i }));
    indexed.sort((a, b) => getTime(b.p) - getTime(a.p) || b.i - a.i);
    visible = indexed.map((item) => item.p);
  }

  const handleBuy = (product) => {
    const prodId = product.id || product._id;
    history.push(`/products/${prodId}`);
  };

  const handleEdit = (product) => {
    const prodId = product.id || product._id;
    history.push(`/modify-product/${prodId}`);
  };

  const confirmDelete = () => {
    const product = productToDelete;
    const prodId = product.id || product._id;
    setProductToDelete(null);

    axios.delete(`https://upgrad.dev/${prodId}`, {
      headers: { 'x-auth-token': token }
    })
    .then(() => {
      alert(`Product ${product.name} deleted successfully`); // Matches target popup manual mandate
      loadProducts();
    })
    .catch((error) => {
      alert('Error trying to delete product.');
    });
  };

  return (
    <div className="products-page" style={{ padding: '20px' }}>
      <div className="products-sort" style={{ display: 'flex', alignItems: 'center', gap: '10px', maxWidth: '250px', marginBottom: '20px' }}>
        <Typography variant="body2" className="products-sort-label">
          Sort By:
        </Typography>
        <div style={{ flexGrow: 1 }}>
          <Select
            options={sortOptions}
            value={sortBy}
            onChange={setSortBy}
            placeholder="Select..."
            isSearchable={false}
          />
        </div>
      </div>

      {!loading && visible.length === 0 && (
        <Typography align="center" color="textSecondary" style={{ marginTop: '40px' }}>
          No products found.
        </Typography>
      )}

      <Grid container spacing={4} className="products-grid">
        {visible.map((product) => {
          const prodId = product.id || product._id;
          return (
            <Grid item xs={12} sm={6} md={4} key={prodId}>
              <ProductCard
                product={product}
                isAdmin={isAdmin}
                onBuy={handleBuy}
                onEdit={handleEdit}
                onDelete={setProductToDelete}
              />
            </Grid>
          );
        })}
      </Grid>

      {/* Manual page 24 confirmation deletion overlay module */}
      <Dialog open={!!productToDelete} onClose={() => setProductToDelete(null)}>
        <DialogTitle>Confirm deletion of product!</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete the product?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="primary" onClick={confirmDelete}>
            OK
          </Button>
          <Button color="primary" onClick={() => setProductToDelete(null)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Products;