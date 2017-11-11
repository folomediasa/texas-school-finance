const React = require('react');

class CustomComponent extends React.Component {
  render() {
    const { hasError, updateProps, ...props } = this.props;
    return (
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 70, background: 'black'}}>
      </div>
    );
  }
}

module.exports = CustomComponent;
