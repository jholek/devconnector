import React from 'react';
// Required to define PropTypes
import PropTypes from 'prop-types';
// Need this whenever connecting a component to redux.
import { connect } from 'react-redux';

// Destructure props.alerts to access alerts without stating props.
// Takes the alerts array if its not null and contain alerts, then maps through them.
// Create a div for every alert, binding a key and applying the class name of the Alert Type.
// Text is the message that is passed through the state.
const Alert = ({ alerts }) =>
  alerts !== null &&
  alerts.length > 0 &&
  // Notice here there are no {}. due to the entire thing being returned opposed to
  // invoking commands. Need to wrap with ().
  alerts.map((alert) => (
    <div key={alert.id} className={`alert alert-${alert.alertType}`}>
      {alert.msg}
    </div>
  ));

// Define props used.
alert.propTypes = {
  alerts: PropTypes.array.isRequired,
};

// Maps Redux State to Props used.
const mapStateToProps = (state) => ({
  alerts: state.alert,
});

// Required to export state via Redux.
// Passing in state, but has no action to call.
export default connect(mapStateToProps)(Alert);
