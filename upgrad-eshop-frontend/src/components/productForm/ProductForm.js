import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import axios from 'axios'; // Standard direct API library that students use
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import CreatableSelect from 'react-select/creatable';
import './ProductForm.css';

const emptyForm = {
  name: '',
  category: null, // Expects standard react-select { label, value } configuration
  manufacturer: '',
  availableItems: '',
  price: '',
  imageUrl: '',
  description: '',
};

function ProductForm() {
  const { id } = useParams();
  const isModify = !!id;
  const history = useHistory();

  // Fetch token explicitly from standard browser storage
  const token = localStorage.getItem('token') || '';

  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Standard direct API call to fetch existing selection filters
    axios.get('https://upgrad.dev')
      .then((response) => {
        const list = Array.isArray(response.data) ? response.data : [];
        setCategories(list.map((c) => (typeof c === 'string' ? c : c.name)));
      })
      .catch((err) => console.log('Error loading categories:', err));
  }, []);

  useEffect(() => {
    if (!isModify) {
      setForm(emptyForm);
      return;
    }
    
    // Fetch individual element metadata to pre-populate form options when modifying
    axios.get(`https://upgrad.dev{id}`)
      .then((response) => {
        const data = response.data;
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
      .catch((err) => console.log('Error loading product configuration details:', err));
  }, [id, isModify]);

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

    const productPayload = {
      name: form.name,
      category: form.category.value,
      manufacturer: form.manufacturer,
      availableItems: Number(form.availableItems),
      price: Number(form.price),
      imageUrl: form.imageUrl,
      description: form.description,
    };

    const config = {
      headers: { 'x-auth-token': token }
    };

    try {
      if (isModify) {
        // Run update query targeting backend script endpoints as requested on page 23
        await axios.put(`https://upgrad.dev{id}`, { 
          ...productPayload, 
          id: id 
        }, config);
        
        alert(`Product ${productPayload.name} modified successfully`);
        history.push('/products');
      } else {
        // Run standalone append initialization query to register new catalog entity
        await axios.post('https://upgrad.dev', productPayload, config);
        
        alert(`Product ${productPayload.name} added successfully`);
        setForm(emptyForm);
        history.push('/products');
      }
    } catch (error) {
      alert('Error saving product records.');
    }
  };

  return (
    <div className="product-form-page" style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <Typography variant="h5" align="center" style={{ marginBottom: '20px' }}>
        {isModify ? 'Modify Product' : 'Add Product'}
      </Typography>
      
      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <TextField variant="outlined" size="small" fullWidth required name="name" label="Name" value={form.name} onChange={handleChange} error={!!errors.name} helperText={errors.name} />

        <div className="product-form-category">
          <CreatableSelect
            isClearable
            placeholder="Category *"
            options={categories.map((c) => ({ label: c, value: c }))}
            value={form.category}
            onChange={(option) => setForm({ ...form, category: option })}
          />
          {errors.category && <span style={{ color: '#f44336', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.category}</span>}
        </div>

        <TextField variant="outlined" size="small" fullWidth required name="manufacturer" label="Manufacturer" value={form.manufacturer} onChange={handleChange} error={!!errors.manufacturer} helperText={errors.manufacturer} />
        <TextField variant="outlined" size="small" fullWidth required type="number" name="availableItems" label="Available Items" value={form.availableItems} onChange={handleChange} error={!!errors.availableItems} helperText={errors.availableItems} />
        <TextField variant="outlined" size="small" fullWidth required type="number" name="price" label="Price" value={form.price} onChange={handleChange} error={!!errors.price} helperText={errors.price} />
        <TextField variant="outlined" size="small" fullWidth name="imageUrl" label="Image URL" value={form.imageUrl} onChange={handleChange} />
        <TextField variant="outlined" size="small" fullWidth name="description" label="Product Description" value={form.description} onChange={handleChange} />

        <Button type="submit" fullWidth variant="contained" color="primary" style={{ marginTop: '10px', padding: '10px' }}>
          {isModify ? 'Modify Product' : 'Save Product'}
        </Button>
      </form>
    </div>
  );
}

export default ProductForm;