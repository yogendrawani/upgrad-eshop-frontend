import React, { useContext } from 'react';
import { Route, Redirect } from 'react-router-dom';
import AppContext from './AppContext';

// Only lets logged in users in. adminOnly pages are only for admins.
function ProtectedRoute({ component: Component, adminOnly, ...rest }) {
  const { auth } = useContext(AppContext);

  return (
    <Route
      {...rest}
      render={(props) => {
        if (!auth.token) {
          return <Redirect to="/login" />;
        }
        if (adminOnly && !auth.isAdmin) {
          return <Redirect to="/products" />;
        }
        return <Component {...props} />;
      }}
    />
  );
}

export default ProtectedRoute;
