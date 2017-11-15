const React = require('react');

class CustomComponent extends React.Component {
  render() {
    const { hasError, updateProps, ...props } = this.props;
    return (
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, borderBottom: 'solid 0 #ffffff', background: 'black'}}>
        <div style={{ padding: '20px 30px 10px 30px'}}>
          <img src="images/logo.png" style={{background: 'none', width: 156 / 1.75, height: 57 / 1.75}}  />
        </div>
      </div>
    );
  }
}

module.exports = CustomComponent;
