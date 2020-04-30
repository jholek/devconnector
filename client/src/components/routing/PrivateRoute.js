import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

// Pass in component props from App.js 'Private Route'
// Along with auth global state from Redux
// and ..rest
const PrivateRoute = ({
  component: Component,
  auth: { isAuthenticated, loading },
  ...rest
}) => (
  // If the user is not authenticated, and the application is not loading
  // It will allow access to the Protected Route.
  // Otherwise, redirects to login page.
  <Route
    {...rest}
    // Render prop is used to dynamically use a function prop to dictate what is rendered.
    render={(props) =>
      !isAuthenticated && !loading ? (
        <Redirect to='/login' />
      ) : (
        <Component {...props} />
      )
    }
  />
);

PrivateRoute.propTypes = {
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps)(PrivateRoute);
