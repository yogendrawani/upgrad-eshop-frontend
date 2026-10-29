import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
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
import AppContext from '../../common/AppContext';
import ProductCard from '../productCard/ProductCard';
import { request, toList, getId } from '../../common/api';

const sortOptions = [
  { value: 'default', label: 'Default' },
  { value: 'high', label: 'Price: High to Low' },
  { value: 'low', label: 'Price: Low to High' },
  { value: 'newest', label: 'Newest' },
];

function getTime(product) {
  return Date.parse(product.updatedAt || product.createdAt || '') || 0;
}

function Products() {
  const { auth, notify, search, category } = useContext(AppContext);
  const history = useHistory();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  const loadProducts = async () => {
    try {
      const { data } = await request('/products', { token: auth.token });
      setProducts(toList(data));
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // filter by category and search text
  let visible = products.filter((p) => {
    const matchesCategory = category === 'all' || (p.category || '').toLowerCase() === category;
    const matchesSearch = (p.name || '').toLowerCase().includes(search.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // then sort
  const sortValue = sortBy ? sortBy.value : 'default';
  if (sortValue === 'high') {
    visible = [...visible].sort((a, b) => b.price - a.price);
  } else if (sortValue === 'low') {
    visible = [...visible].sort((a, b) => a.price - b.price);
  } else if (sortValue === 'newest') {
    // newest first, if there are no timestamps the last added product comes first
    const indexed = visible.map((p, i) => ({ p, i }));
    indexed.sort((a, b) => getTime(b.p) - getTime(a.p) || b.i - a.i);
    visible = indexed.map((item) => item.p);
  }

  const handleBuy = (product) => {
    history.push('/products/' + getId(product));
  };

  const handleEdit = (product) => {
    history.push('/modify-product/' + getId(product));
  };

  const confirmDelete = async () => {
    const product = productToDelete;
    setProductToDelete(null);
    try {
      await request('/products/' + getId(product), { method: 'DELETE', token: auth.token });
      notify('Product ' + product.name + ' deleted successfully');
      loadProducts();
    } catch (error) {
      notify(error.message, 'error');
    }
  };

  return (
    <div className="products-page">
      <div className="products-sort">
        <Typography variant="body2" className="products-sort-label">
          Sort By:
        </Typography>
        <Select
          options={sortOptions}
          value={sortBy}
          onChange={setSortBy}
          placeholder="Select..."
          isSearchable={false}
        />
      </div>

      {!loading && visible.length === 0 && (
        <Typography align="center" color="textSecondary" className="products-empty">
          No products found.
        </Typography>
      )}

      <Grid container spacing={4} className="products-grid">
        {visible.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={getId(product)}>
            <ProductCard
              product={product}
              isAdmin={auth.isAdmin}
              onBuy={handleBuy}
              onEdit={handleEdit}
              onDelete={setProductToDelete}
            />
          </Grid>
        ))}
      </Grid>

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
