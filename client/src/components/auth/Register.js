import React, { Fragment, useState } from 'react';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
// Bring in alert action.
import { setAlert } from '../../actions/alert';
import { register } from '../../actions/auth';
import PropTypes from 'prop-types';

// Destructuring props.setAlert so just setAlert can be directly called
const Register = ({ setAlert, register, isAuthenticated }) => {
  // Creating State Hook
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
  });

  //Destructure
  const { name, email, password, password2 } = formData;

  // Handling all onChange events at once, using spread operator and name/value pairs.
  // Look at Angela's implementation for this in production. It's cleaner.
  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Handling a Form Submission Event
  const onSubmit = (e) => {
    e.preventDefault();
    // Check that passwords match.
    if (password !== password2) {
      setAlert('Passwords do not match', 'danger');
    } else {
      register({ name, email, password });
    }
  };

  if (isAuthenticated) {
    return <Redirect to='/dashboard' />;
  }

  return (
    <Fragment>
      <h1 className='large text-primary'>Sign Up</h1>
      <p className='lead'>
        <i className='fas fa-user'></i> Create Your Account
      </p>
      <form
        className='form'
        action='create-profile.html'
        onSubmit={(e) => onSubmit(e)}
      >
        <div className='form-group'>
          <input
            type='text'
            placeholder='Name'
            name='name'
            value={name}
            onChange={(e) => onChange(e)}
            required
          />
        </div>
        <div className='form-group'>
          <input
            type='email'
            placeholder='Email Address'
            name='email'
            value={email}
            onChange={(e) => onChange(e)}
            required
          />
          <small className='form-text'>
            This site uses Gravatar so if you want a profile image, use a
            Gravatar email
          </small>
        </div>
        <div className='form-group'>
          <input
            type='password'
            placeholder='Password'
            name='password'
            value={password}
            onChange={(e) => onChange(e)}
            minLength='6'
          />
        </div>
        <div className='form-group'>
          <input
            type='password'
            placeholder='Confirm Password'
            name='password2'
            value={password2}
            onChange={(e) => onChange(e)}
            minLength='6'
          />
        </div>
        <input type='submit' className='btn btn-primary' value='Register' />
      </form>
      <p className='my-1'>
        Already have an account? <Link to='/login'>Sign In</Link>
      </p>
    </Fragment>
  );
};

// Defining PropTypes for tracability.
Register.propTypes = {
  setAlert: PropTypes.func.isRequired,
  register: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool,
};

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
});

// Need to wrap export in connect to hook up to Redux.
// Pass into connect any state or actions that will be included.
// No state to pass in, but has an action to call.
// enables props.setAlert for this specific case.
export default connect(mapStateToProps, { setAlert, register })(Register);
