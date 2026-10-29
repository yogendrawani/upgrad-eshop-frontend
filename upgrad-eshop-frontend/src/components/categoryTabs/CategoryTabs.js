import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import axios from 'axios'; // Standard direct API fetching library
import './CategoryTabs.css';

function CategoryTabs({ category, setCategory }) {
  const history = useHistory();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Simple direct API call to fetch categories
    axios.get('https://upgrad.dev')
      .then((response) => {
        if (Array.isArray(response.data)) {
          setCategories(response.data);
        }
      })
      .catch((error) => {
        console.log('Error fetching categories:', error);
      });
  }, []);

  const handleChange = (event, value) => {
    // Keep it selected if they try to click the same tab twice
    if (value !== null) {
      setCategory(value);
      history.push('/products');
    }
  };

  return (
    <div className="tabs-wrapper" style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
      <ToggleButtonGroup 
        value={category} 
        exclusive 
        onChange={handleChange} 
        size="small"
      >
        {/* Match the exact capitalized values from the instructions screenshot */}
        <ToggleButton value="ALL">ALL</ToggleButton>
        
        {categories.map((cat) => (
          <ToggleButton key={cat} value={cat.toUpperCase()}>
            {cat.toUpperCase()}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </div>
  );
}

export default CategoryTabs;