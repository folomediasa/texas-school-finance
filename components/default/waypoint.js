import React from 'react';
import ReactDOM from 'react-dom';
import Screen from './utils/screen';

class Waypoint extends React.PureComponent {
  constructor (props) {
    super(props);
  }

  render() {
    const { updateProps, height, ...props } = this.props;
    return <Screen className="waypoint" align="center" direction="row" height={height} {...this.props} />;
  }

}

Waypoint.defaultProps = {
  height: '75vh'
};

export default Waypoint;
