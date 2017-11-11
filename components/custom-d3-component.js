const React = require('react');
const D3Component = require('idyll-d3-component');
const d3 = require('d3');

const size = 600;

class CustomD3Component extends D3Component {

  initialize(node, props) {

    console.log(props);
    const svg = this.svg = d3.select(node).append('svg');
    svg.attr('viewBox', `0 0 ${size} ${size}`)
      .style('height', 'auto');

    for (var i = 0; i < 250; i++) {
      svg.append('circle')
        .attr('r', 5)
        .attr('cx', Math.random() * size)
        .attr('cy', Math.random() * size);
    }
  }

  update(props) {
    if (props.triggerUpdate !== this.props.triggerUpdate) {
      this.svg.selectAll('circle')
        .transition()
        .attr('cx', () => Math.random() * size)
        .attr('cy', () => Math.random() * size);
    }
  }
}

module.exports = CustomD3Component;
