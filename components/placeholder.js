const React = require('react');

class CustomComponent extends React.Component {
  render() {
    const { hasError, updateProps, ...props } = this.props;
    return (
      <div style={{width: '25%', minWidth: 0, height: '40vh', background: 'black', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

      </div>
    );
  }
}

module.exports = CustomComponent;
