const React = require('react');
const D3Component = require('idyll-d3-component');
const d3 = require('d3');
const topojson = require('topojson');
const flubber = require("flubber");

const states = {
  INITIAL: 'initial',
  EXTREMES: 'extremes',
  INCOME: 'income',
  TAXES: 'taxes',
  RECAPTURE1: 'recapture-1',
  RECAPTURE2: 'recapture-2'
};

const width = 600;
const height = 1200;
const size = 50;

const richDistrictCount = 25;
const poorDistrictCount = 15;

const columns = 20;
const circleSize = 20;
const xOffset = 0;
const yOffset = 100;

const poorInterpolator = (d, i, reversed) => {
  const row = Math.floor(i / columns);
  const column = i % columns;

  const interpolator = flubber.toCircle(d.initialPath, xOffset + column * circleSize + circleSize / 2, yOffset + row * circleSize + circleSize / 2, circleSize / 2);
  return (t) => {
    return interpolator(reversed ? 1 - t : t);
  }
}
const richInterpolator = (d, i, reversed) => {
  const row = Math.floor(i / columns);
  const column = i % columns;
  const offset = 700;

  const interpolator = flubber.toCircle(d.initialPath, xOffset + column * circleSize + circleSize / 2, offset + yOffset + row * circleSize + circleSize / 2, circleSize / 2);
  return (t) => {
    return interpolator(reversed ? 1 - t : t);
  }
}

class DistrictComparison extends D3Component {
  initialize(node, props) {
    const x = this.x = d3.scaleLinear().domain([0, 100]).range([0, width]);
    const y = this.y = d3.scaleLinear().domain([0, 100]).range([height, 0]);
    const line = this.line = d3.line().x(d => x(d.x)).y(d => y(d.y));
    const svg = this.svg = d3.select(node).append('svg');

    const color = this.color = d3.scaleSequential(d3.interpolateViridis).domain([1.0, 1.5]);

    svg.attr('viewBox', `0 0 ${width} ${height}`)
      .style('width', '100%')
      .style('height', '100vh');

    const textGroup = svg.append('g').attr('transform', `translate(${0.65 * width}, ${height / 16})`)

    textGroup.append('rect').attr('x', 0).attr('y', 0).attr('fill', '#f3f1f2').attr('width', width / 2).attr('height', height / 8);
    const text = textGroup.append('text').attr('dx', 20).attr('dy', 20).style('font-size', '22px');


    d3.json(true ? 'data/isd-topo.json' : 'http://localhost:3000/data/isd-topo.json', (err, topology) => {

      var geojson = topojson.feature(topology, topology.objects.isd);
      // create a first guess for the projection
      var projection = d3.geoConicConformal()
        .parallels([30 + 7 / 60, 31 + 53 / 60])
        .rotate([100 + 20 / 60, -29 - 40 / 60]);

        projection
          .scale(1)
          .translate([0, 0]);

        var path = d3.geoPath().projection(projection);

        var b = path.bounds(geojson),
          s = 1.75 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
          t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

        projection
          .scale(s)
          .translate(t);

      // create the path
      const cleaned = geojson.features.filter((d) => {
        const p = path(d);
        if (!p) {
          return false;
        }
        d.initialPath = p;
        d.rich = Math.random() < 0.1;
        d.poor = !d.rich && Math.random() < 0.1;
        return true;
      });
      const paths = this.paths = svg.selectAll("path").data(cleaned).enter()
        .append("path")
        .attr("d", d => d.initialPath)
        .style("fill", d => {
          // console.log(path(d));
          if(+d.properties['Recapture'] > 0) {
            return 'pink';
          }
          return color(+d.properties['Total Tax']);
        })
        .on('mouseenter', function(d) {
          text.text(d.properties['NAME'].replace(' ISD', '') + ' ' + (+d.properties['Total Tax']));
          d3.select(this).style('stroke', 'black');
        }).on('mouseout', function() {
          d3.select(this).style('stroke', 'none');
        })


        this.rich = paths.filter(d => d.rich);
        this.poor = paths.filter(d => d.poor);
        this.neither = paths.filter(d => !d.rich && !d.poor);
    })

    // const columns = 8;

    this.fundingSources = svg.selectAll('.funding-source')
      .data([0, 1, 2, 3])
      .enter()
      .append('rect')
      .attr('x', d => {
        if (d === 0) {
          return width / 2 - size
        } else if (d === 1) {
          return width / 2 - size
        } else if (d === 2) {
          return 100;
        } else {
          return width - 100 - 2 * size;
        }
      })
      .attr('y', d => {
        if (d === 0) {
          return height / 2 + 4 * size
        } else if (d === 1) {
          return height / 2 + size
        } else if (d === 2) {
          return 3 * height / 4 + size;
        } else {
          return 3 * height / 4 + size;
        }
      })
      .attr('width', 2 * size)
      .attr('height', 2 * size)
      .attr('fill', '#ddd')
      .attr('stroke', '#333')
      .attr('strokeWidth', 3)
      .attr('opacity', 0);

    this.currentState = states.INITIAL;
    // this.update(props);
  }

  update(props) {
    const { state } = props;
    const { rich, poor, neither, paths } = this;
    const prevState = this.props.state;

    if (state === this.currentState) {
      return;
    }


    let animationTime = 1000;
    let particleDelay = 10;
    switch (state) {
      case states.INITIAL:
        this.paths
          .style("fill", d => {
            // console.log(path(d));
            if(+d.properties['Recapture'] > 0) {
              return 'pink';
            }
            return this.color(+d.properties['Total Tax']);
          })

        neither
          .transition()
          .delay(animationTime / 2)
          .delay(1.5 * animationTime)
          .duration(animationTime)
          .style('opacity', 1);
        rich
          .transition()
          .delay((d, i) => i * particleDelay)
          .duration(animationTime)
          .attrTween("d", (d, i) => richInterpolator(d, i, true));
        poor
          .transition()
          .delay((d, i) => i * particleDelay)
          .duration(animationTime)
          .attrTween("d", (d, i) => poorInterpolator(d, i, true));
        break;
      case states.EXTREMES:
        console.log('CURRENT STATE: ' + this.currentState);
        animationTime = this.currentState === states.INITIAL ? 1000 : 0;
        particleDelay = this.currentState === states.INITIAL ? 10 : 0;
        console.log('ANIMATION TIME: ' + animationTime);
        neither
          .transition()
          .duration(animationTime)
          .style('opacity', 0);
        rich
          .transition()
          .delay(animationTime * 1.5)
          .duration(animationTime)
          .style('fill', 'blue');
        poor
          .transition()
          .delay(animationTime * 1.5)
          .duration(animationTime)
          .style('fill', 'red');
        rich
          .transition()
          .delay((d, i) => 3 * animationTime + i * particleDelay)
          .duration(animationTime)
          .attrTween("d", (d, i) => richInterpolator(d, i));
        poor
          .transition()
          .delay((d, i) => 3 * animationTime + i * particleDelay)
          .duration(animationTime)
          .attrTween("d", (d, i) => poorInterpolator(d, i));
        break;
      case states.INCOME:
        this.fundingSources
          .transition()
          .attr('opacity', 1);
        break;
      case states.TAXES:
        this.richDistricts
          .filter(d => d < richDistrictCount / 4)
          .transition()
          .duration(750)
          .delay(d => 30 * d)
          .attr('fill',  'green');

        this.poorDistricts
          .filter(d => d < poorDistrictCount / 2)
          .transition()
          .duration(750)
          .delay(d => 30 * d)
          .attr('fill', 'red');
        break;
    }

    this.currentState = state;
  }
}

module.exports = DistrictComparison;
