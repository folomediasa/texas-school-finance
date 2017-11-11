const React = require('react');

class CustomComponent extends React.Component {
  render() {
    const { hasError, updateProps, ...props } = this.props;
    return (
      <div className={`section ${props.className || ''}`} style={Object.assign({'width': '100%', minHeight: '75vh', padding: '25vh 0', flexDirection: props.direction || 'row'}, props.style || {})}>
        {this.props.children}
      </div>
    );
  }
}

module.exports = CustomComponent;
