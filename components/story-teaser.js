const React = require('react');

class CustomComponent extends React.Component {
  render() {
    const { hasError, updateProps, ...props } = this.props;
    return (
      <div style={{textAlign: 'center', cursor: 'pointer', width: '25%', marginTop: 60}}>
        <div style={{minWidth: 0, height: '40vh', background: 'black'}} />
        Story Title
      </div>
    );
  }
}

module.exports = CustomComponent;
