const React = require('react');

class CustomComponent extends React.Component {
  render() {
    const { hasError, updateProps, ...props } = this.props;
    console.log(updateProps)
    console.log(props);
    return (
      <div></div>
    );
  }
}

module.exports = CustomComponent;
