const React = require('react');

class Controls extends React.Component {

  constructor(props) {
    super(props);

    this.handleNext = this.handleNext.bind(this);
    this.handlePrevious = this.handlePrevious.bind(this);
  }

  handlePrevious() {
    const { index, updateProps } = this.props;
    if (!this.canClickPrevious()) {
      return;
    }
    updateProps({ index: index - 1 });
  }

  handleNext() {
    const { index, updateProps } = this.props;
    if (!this.canClickNext()) {
      return;
    }
    updateProps({ index: index + 1 });
  }

  canClickPrevious() {
    const { actionsEnabled, index, length } = this.props;
    return actionsEnabled && index > 0;
  }

  canClickNext() {
    const { actionsEnabled, index, length } = this.props;
    return actionsEnabled && index < length - 1;
  }

  render() {
    const { hasError, index, length, updateProps, ...props } = this.props;
    return (
      <div style={{width: '50%', display: 'flex', justifyContent: 'space-between', margin: '0 auto'}}>
        <div className="control" onClick={this.handlePrevious} style={{opacity: this.canClickPrevious() ? 1 : 0.5}}>{'< '}Previous</div>
        <div>{index + 1} / {length}</div>
        <div className="control" onClick={this.handleNext} style={{opacity: this.canClickNext() ? 1 : 0.5}}>Next {' >'}</div>
      </div>
    );
  }
}

Controls.defaultProps = {
  actionsEnabled: true
};

module.exports = Controls;
