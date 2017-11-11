const React = require('react');

class Image extends React.Component {
  render() {
    const { hasError, updateProps, ...props } = this.props;
    return (
      <div style={{padding: 10}}>
        <img style={{width: '100%'}} src={props.src} />
      </div>
    );
  }
}

module.exports = Image;
