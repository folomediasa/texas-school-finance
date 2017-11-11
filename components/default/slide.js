import React from 'react';

class Slide extends React.PureComponent {
  render() {
    return (
      <div className="slide">
        {this.props.children}
      </div>
    );
  }
}

export default Slide;
