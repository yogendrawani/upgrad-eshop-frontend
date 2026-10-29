import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import './CategoryTabs.css';
import AppContext from '../../common/AppContext';
import { request } from '../../common/api';

function CategoryTabs() {
  const { auth, category, setCategory } = useContext(AppContext);
  const history = useHistory();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let cancelled = false;
    request('/products/categories', { token: auth.token })
      .then(({ data }) => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        setCategories(list.map((c) => (typeof c === 'string' ? c : c.name)));
      })
      .catch(() => setCategories([]));
    return () => {
      cancelled = true;
    };
  }, [auth.token]);

  const handleChange = (event, value) => {
    // value is null when the selected tab is clicked again, so ignore that
    if (value === null) return;
    setCategory(value);
    history.push('/products');
  };

  return (
    <div className="tabs-wrapper">
      <ToggleButtonGroup value={category} exclusive onChange={handleChange} size="small">
        <ToggleButton value="all">All</ToggleButton>
        {categories.map((name) => (
          <ToggleButton key={name} value={name.toLowerCase()}>
            {name}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </div>
  );
}

export default CategoryTabs;
