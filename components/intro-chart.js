const React = require('react');
const D3Component = require('idyll-d3-component');
const d3 = require('d3');
const debounce = require('debounce');

const states = {
  INITIAL: 'initial',
  POPULATION1: 'population-1',
  POPULATION2: 'population-2',
  STATE: 'state-funding',
  RELATIVE: 'relative-funding',
}

function tweenDash() {
  var l = this.getTotalLength(),
      i = d3.interpolateString("0," + l, l + "," + l);
  return function(t) { return i(t); };
}


function initialDash() {
  return `0,${this.getTotalLength()}`;
}

class IntroChart extends D3Component {
  initialize(node, props) {
    const margin = { top: 20, right: 0, bottom: 60, left: 50 };
    const totalWidth = window.innerWidth;
    const totalHeight = window.innerHeight;
    const width = this.width = totalWidth - margin.left - margin.right;
    const height = this.height = totalHeight - margin.top - margin.bottom;

    const x = this.x = d3.scaleTime().domain([new Date('2008'), new Date('2016')]).range([0, width]);
    const y = this.y = d3.scaleLinear().domain([0, 100]).range([height, 0]);
    const line = this.line = d3.line()
      .x(d => x(d.x))
      .y(d => y(d.y));
    const area = this.area = d3.area()
      .x(d => x(d.x))
      .y0(height)
      .y1(d => y(d.y));

    const svg = this.svg = d3.select(node).append('svg').style('background', '#f3f1f2');


    svg.attr('viewBox', `0 0 ${totalWidth} ${totalHeight}`)
    .style('width', '100%')
    .style('height', 'auto');


    const content = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`)

    // add the X gridlines
    content.append("g")
      .attr("class", "grid x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).ticks(5).tickSize(-height).tickFormat(""))

    // add the Y gridlines
    content.append("g")
      .attr("class", "grid y")
      .call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(""))

    // Add the X Axis
    content.append("g")
    .attr('class', 'axis x')
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x));

    // Add the Y Axis
    content.append("g")
    .attr('class', 'axis y')
      .call(d3.axisLeft(y));

    this.populationPath = content.append('path')
      .attr('fill', '#01bec4')
      .attr('stroke', '#01bec4')
      .attr('stroke-width', '3')
      .attr('d', area([{x: new Date('2008'), y: 0}, {x: new Date('2016'), y: 100}]))
      .attr('stroke-dasharray', initialDash)

    const subPaths = content.append('g');
    // subPaths.append('path')
    //   .attr('fill', 'none')
    //   .attr('stroke', 'red')
    //   .attr('d', line([{x: new Date('2008'), y: 0}, {x: new Date('2016'), y: 40}]))
    //   .attr('stroke-dasharray', initialDash)
    subPaths.append('path')
      .attr('fill', '#f7756d')
      .attr('stroke', '#f7756d')
      .attr('stroke-width', '3')
      .attr('d', area([{x: new Date('2008'), y: 0}, {x: new Date('2016'), y: 30}]))
      .attr('opacity', 0)
      .attr('stroke-dasharray', initialDash);
    this.subPopulationPaths = subPaths.selectAll('path');

    const revenuePaths = content.append('g') ;
    this.statePath = revenuePaths.append('path')
    .attr('fill', 'none')
    .attr('stroke', '#242021')
    .attr('stroke-width', 4)
    .attr('d', line([{x: new Date('2008'), y: 100}, {x: new Date('2016'), y: 0}]))
    .attr('stroke-dasharray', initialDash);


    const stateKeys = Object.keys(states);
    const progress = this.progress = svg.selectAll('.progress')
      .data(stateKeys)
      .enter()
      .append('circle')
      .attr('class', 'progress')
      .attr('cx', (d, i) => {
        const sign = i === stateKeys.length / 2 ? 0 : ( i < stateKeys.length / 2 ? -1 : 1);
        return totalWidth / 2 + sign * Math.abs(i - stateKeys.length / 2) * 30;
      })
      .attr('cy', totalHeight - 20)
      .attr('r', 5)
      .style('fill', (d, i) => {
        return i === 0 ? '#ffffff' : '#151E3F'
      })
      .attr('stroke', '#151E3F')
      .attr('stroke-width', 0.5);

    this.update(props);
  }

  setProgress(idx) {
    this.progress
      .transition()
      .style('fill', (d, i) => i === (idx - 1) ? '#151E3F' : '#ffffff');
  }

  _setState(state) {
    console.log('setting state: ' + state);
    if (state === this.currentState) {
      return;
    }
    this.currentState = state;
    switch (state) {
      case states.INITIAL:
        this.setProgress(1);
        break;
      case states.POPULATION1:
        this.setProgress(2);
        this.populationPath
          .transition()
          //.duration(1000)
          .attrTween("stroke-dasharray", tweenDash);
        break;
      case states.POPULATION2:
        this.setProgress(3);
        console.log('population 2');
        this.subPopulationPaths
          .transition()
          //.duration(1000)
          .attr('opacity', 1)
          .attrTween("stroke-dasharray", tweenDash);
        break;
      case states.STATE:
        this.setProgress(4);
        this.populationPath
          .transition()
          //.duration(1000)
          .attr('opacity', 0.4)
        this.subPopulationPaths
          .transition()
          //.duration(1000)
          .attr('opacity', 0.4)
        this.statePath
          .transition()
          //.duration(1000)
          .attrTween("stroke-dasharray", tweenDash);
        break;
      case states.RELATIVE:
        this.setProgress(5);
        this.statePath
          .transition()
          //.duration(1000)
          .attr('d', this.line([{x: new Date('2008'), y: 50}, {x: new Date('2016'), y: 50}]))
        break;
    }
  }

  update(props) {
    const { value } = props;
    const stateCount = Object.keys(states).length;
    if (value < 0.25 / stateCount) {
      this._setState(states.INITIAL);
    }
    else if (value < 1.5 / stateCount) {
      this._setState(states.POPULATION1);
    } else if (value < 2.5 / stateCount) {
      this._setState(states.POPULATION2);
    }
    else if (value < 3.5 / stateCount) {
      this._setState(states.STATE);
    } else {
      this._setState(states.RELATIVE);
    }
  }
}

IntroChart.update = debounce(IntroChart.update, 250).bind(this);

module.exports = IntroChart;
