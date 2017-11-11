import React from 'react';
import Transition from 'react-transition-group/Transition';

const duration = 300;

const defaultStyle = {
  transition: `opacity ${duration}ms ease-in-out`,
  opacity: 0,
}

const transitionStyles = {
  entering: { opacity: 0 },
  entered:  { opacity: 1 },
};

const Slide = require('./slide');

class Slideshow extends React.PureComponent {

  unwrapChild(c) {
    if (c => c.type.name && c.type.name.toLowerCase() === 'wrapper') {
      return c.props.children[0];
    }
    return c;
  }

  unwrapChildren() {
    return this.props.children.map((c) => this.unwrapChild(c));
  }

  getChildren(children) {
    let processedChildren = [];
    React.Children.forEach(this.unwrapChildren(), (child) => {
      if (typeof child === 'string') {
        return;
      }
      if ((child.type.name && child.type.name.toLowerCase() === 'slide') || child.type.prototype instanceof Slide) {
        processedChildren.push(child);
      } else {
        // processedChildren = processedChildren.concat(this.getChildren(child.props.children));
      }
    })
    return processedChildren;
  }

  render() {
    return (
      <div className="slideshow">
        <div style={{position: 'relative'}}>

          {this.getChildren(this.props.children)[this.props.currentSlide]}
        </div>
      </div>
    );
  }
}

Slideshow.defaultProps = {
  currentSlide: 1
};

export default Slideshow;
