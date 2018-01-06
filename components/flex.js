const React = require('react');

const aligns = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
  between: 'space-between',
  around: 'space-around'
};
const directions = {
  horizontal: 'row',
  vertical: 'column'
};
const fullBleedStyles = {
  width: "100%"
}

class Flex extends React.Component {
  render() {
    const { hasError, updateProps, className, direction, align, fullBleed, ...props } = this.props;
    return (
      <div className={`${directions[direction]} ${className || ''}`} style={{
        display: 'flex',
        margin: '0 auto',
        justifyContent: aligns[align],
        width: fullBleed ? '100%' : 'auto',
        maxWidth: fullBleed ? 'none' : undefined
      }} {...props} />
    );
  }
}

Flex.defaultProps = {
  direction: 'horizontal',
  align: 'center'
};

module.exports = Flex;
