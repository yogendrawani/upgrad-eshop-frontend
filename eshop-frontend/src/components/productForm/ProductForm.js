import React, { useContext, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import CreatableSelect from 'react-select/creatable';
import './ProductForm.css';
import AppContext from '../../common/AppContext';
import { request } from '../../common/api';

const emptyForm = {
  name: '',
  category: null, // {label, value}
  manufacturer: '',
  availableItems: '',
  price: '',
  imageUrl: '',
  description: '',
};

// one form used for both adding and modifying (modify has an :id in the url)
function ProductForm() {
  const { id } = useParams();
  const isModify = !!id;
  const history = useHistory();
  const { auth, notify } = useContext(AppContext);
  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    request('/products/categories', { token: auth.token })
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : [];
        setCategories(list.map((c) => (typeof c === 'string' ? c : c.name)));
      })
      .catch(() => setCategories([]));
  }, [auth.token]);

  useEffect(() => {
    if (!isModify) {
      setForm(emptyForm);
      return;
    }
    request('/products/' + id, { token: auth.token })
      .then(({ data }) => {
        setForm({
          name: data.name || '',
          category: data.category ? { label: data.category, value: data.category } : null,
          manufacturer: data.manufacturer || '',
          availableItems: data.availableItems,
          price: data.price,
          imageUrl: data.imageUrl || '',
          description: data.description || '',
        });
      })
      .catch((error) => notify(error.message, 'error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const validate = () => {
    const newErrors = {};
    if (!String(form.name).trim()) newErrors.name = 'Name is required';
    if (!form.category) newErrors.category = 'Category is required';
    if (!String(form.manufacturer).trim()) newErrors.manufacturer = 'Manufacturer is required';
    if (form.availableItems === '' || Number(form.availableItems) < 0) {
      newErrors.availableItems = 'Enter the number of available items';
    }
    if (form.price === '' || Number(form.price) <= 0) {
      newErrors.price = 'Enter a price greater than 0';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    const product = {
      name: form.name,
      category: form.category.value,
      manufacturer: form.manufacturer,
      availableItems: Number(form.availableItems),
      price: Number(form.price),
      imageUrl: form.imageUrl,
      description: form.description,
    };

    try {
      if (isModify) {
        await request('/products/' + id, {
          method: 'PUT',
          token: auth.token,
          body: { ...product, id: id },
        });
        notify('Product ' + product.name + ' modified successfully');
        history.push('/products');
      } else {
        await request('/products', { method: 'POST', token: auth.token, body: product });
        notify('Product ' + product.name + ' added successfully');
        setForm(emptyForm);
      }
    } catch (error) {
      notify(error.message, 'error');
    }
  };

  const field = (name, label, required, type = 'text') => (
    <TextField
      variant="outlined"
      size="small"
      margin="dense"
      fullWidth
      required={required}
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
    <div className="product-form-page">
      <Typography variant="h5" align="center" className="product-form-title">
        {isModify ? 'Modify Product' : 'Add Product'}
      </Typography>
      <form onSubmit={handleSubmit} noValidate className="product-form">
        {field('name', 'Name', true)}

        <div className="product-form-category">
          <CreatableSelect
            isClearable
            placeholder="Category *"
            options={categories.map((c) => ({ label: c, value: c }))}
            value={form.category}
            onChange={(option) => setForm({ ...form, category: option })}
          />
          {errors.category && <span className="product-form-error">{errors.category}</span>}
        </div>

        {field('manufacturer', 'Manufacturer', true)}
        {field('availableItems', 'Available Items', true, 'number')}
        {field('price', 'Price', true, 'number')}
        {field('imageUrl', 'Image URL', false)}
        {field('description', 'Product Description', false)}

        <Button type="submit" fullWidth variant="contained" color="primary" className="product-form-submit">
          {isModify ? 'Modify Product' : 'Save Product'}
        </Button>
      </form>
    </div>
  );
}

export default ProductForm;
