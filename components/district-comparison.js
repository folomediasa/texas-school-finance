const React = require('react');
const D3Component = require('idyll-d3-component');
const d3 = require('d3');
const topojson = require('topojson');
const flubber = require("flubber");
const textures = require('textures');

const states = {
  INITIAL: 'initial',
  EXTREMES: 'extremes',
  INCOME: 'income',
  TAXES: 'taxes',
  RECAPTURE1: 'recapture-1',
  RECAPTURE2: 'recapture-2'
};

const width = 900;
const height = 1200;
const size = 50;

const richDistrictCount = 25;
const poorDistrictCount = 15;

const scatterMargin = {
  top: 0,
  left: 0,
  right: 30,
  bottom: 30
};


const colors = {
  GREEN: '#5FBD67',
  PINK: '#F17CB0',
  GOLD: '#B3912F',
  YELLOW: '#E0CF43',
  BLACK: '#4D4D4D',
  BLUE: '#5EA5DB',
  ORANGE: '#FBA43A',
  PURPLE: '#B176B1',
  GRAY: '#f3f1f2',
  LIGHT_BLACK: '#999999',
}

const columns = 40;
const circleSize = 20;
const xOffset = 0;
const yOffset = height / 8;
const cellSize = circleSize * 1.5;

const arcTween = (newAngle, arc) => {
  return (d) => {
    var interpolate = d3.interpolate(d.endAngle, newAngle);
    return function(t) {
      d.endAngle = interpolate(t);
      return arc(d);
    };
  };
}

const getCircleCenter = (d, i, offset) => {
  const row = Math.floor(i / columns);
  const column = i % columns;
  const sign = column === columns / 2 ? 0 : ( column < columns / 2 ? -1 : 1);
  return [width / 2 + sign * Math.abs(column - columns / 2) * cellSize + cellSize / 2, height / 2 + offset + (offset < 0 ? -1 : 1) * row * cellSize];
}

const poorInterpolator = (d, i, reversed) => {
  const center = getCircleCenter(d, i, yOffset);
  const interpolator = flubber.toCircle(d.initialPath, center[0], center[1], circleSize / 2);
  return (t) => {
    return interpolator(reversed ? 1 - t : t);
  }
}
const richInterpolator = (d, i, reversed) => {
  const center = getCircleCenter(d, i, -yOffset);
  const interpolator = flubber.toCircle(d.initialPath, center[0], center[1], circleSize / 2);
  return (t) => {
    return interpolator(reversed ? 1 - t : t);
  }
}

class DistrictComparison extends D3Component {

  startForceSimulation() {
    const data = this.richData;

    let animationTime = 750;
    let particleDelay = 10;

    var simulation = d3.forceSimulation(data)
      .force("x", d3.forceX((d, i) => {
        const center = getCircleCenter(d, i, -yOffset);
        return center[0];
      }))
      .force("y", d3.forceY((d, i) => {
        const center = getCircleCenter(d, i, -yOffset);
        return center[1];
      }))
      .force("collide", d3.forceCollide(d => 3 + this.r(d.properties.recapturePaid || 0)))
      .stop();

    for (var i = 0; i < 50; ++i) simulation.tick();

    var self = this;
    this.rich.transition()
    // .delay((d, i) => i * particleDelay)
    .duration(animationTime)
    .attrTween("d", function (d, i) {
        const interpolator = flubber.toCircle(d3.select(this).attr('d'), data[i].x, data[i].y, self.r(d.properties.recapturePaid || 0));
        return (t) => {
          return interpolator(t);
        }
      });
  }

  initialize(node, props) {
    const x = this.x = d3.scaleLinear().domain([0, 100]).range([0, width]);
    const y = this.y = d3.scaleLinear().domain([0, 100]).range([height, 0]);
    const line = this.line = d3.line().x(d => x(d.x)).y(d => y(d.y));
    const svg = this.svg = d3.select(node).append('svg');

    // this.rateColor = d3.scaleSequential(d3.interpolateViridis).domain([0.0, 1.17]);
    const color = this.color = d3.scaleSequential(d3.interpolateViridis).domain([0.5, 1.17]);

    svg.attr('viewBox', `0 0 ${width} ${height}`)
      .style('width', '100%')
      .style('height', '77vh');

    const texture = this.texture = textures.lines()
      .orientation("diagonal")
      .size(6)
      .strokeWidth(2)
      .stroke("white")
      .background(colors.YELLOW);

      svg.call(texture);


		svg.select('defs').append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 5)
      .attr("refY", 0)
      .attr("markerWidth", 4)
      .attr("markerHeight", 4)
      .attr("orient", 'auto')
      .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("class","arrowHead")
        .attr('fill', colors.BLACK);

    const textGroup = svg.append('g').attr('transform', `translate(${0.65 * width}, ${height / 16})`)

    // textGroup.append('rect').attr('x', 0).attr('y', 0).attr('fill', '#f3f1f2').attr('width', width / 2).attr('height', height / 8);
    const text = textGroup.append('text').attr('dx', 20).attr('dy', 20).style('font-size', '22px');


    d3.json(true ? 'https://folomediasa.github.io/texas-school-finance/data/isd-topo-processed.json' : 'http://localhost:3000/data/isd-topo-processed.json', (err, topology) => {

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
          s = 1.25 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
          t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

        projection
          .scale(s)
          .translate(t);

      const arc = this.arc = d3.arc()
        .outerRadius(circleSize / 2)
        .innerRadius(0);
      // create the path
      let totalRecapture = 0;
      let maxPaidRecapture = 0;
      const cleaned = geojson.features.map((d) => {
        const p = path(d);
        if (!p) {
          return null;
        }
        totalRecapture += (d.properties.recapturePaid || 0);
        maxPaidRecapture = Math.max(maxPaidRecapture, (d.properties.recapturePaid || 0));
        d.initialPath = p;
        return d;
      }).filter(d => d);

      this.r = d3.scaleSqrt().domain([0, maxPaidRecapture]).range([10, 60]);

      cleaned.sort((a, b) => {
        if (a.properties.isPropertyWealthy && b.properties.isPropertyWealthy) {
          if ((a.properties.recapturePaid > 0 && b.properties.recapturePaid > 0) || (a.properties.recapturePaid === 0 && b.properties.recapturePaid === 0)) {
            return a.properties.taxRate - b.properties.taxRate;
          }
          return a.properties.recapturePaid - b.properties.recapturePaid;
        }
        if (a.properties.isPropertyWealthy) {
          return 1;
        }
        if (b.properties.isPropertyWealthy) {
          return -1;
        }

        return b.properties.taxRate - a.properties.taxRate;
      });



      const paths = this.paths = svg.selectAll("path").data(cleaned).enter()
        .append("path")
        .attr("d", d => d.initialPath)
        .style("fill", d => {
          // console.log(path(d));
          if (d.properties.isPropertyWealthy) {
            return d.properties.recapturePaid > 0 ? colors.YELLOW : this.texture.url();
          }
          return colors.PURPLE;
        })
        // .style('fill', '#ffffff')
        .style('fill-opacity', 0.0)
        .style('stroke', '#000000')
        .style('stroke-width', 0.5)
        // .on('mouseenter', function(d) {
        //   text.text(d.properties.name.replace(' ISD', '') + ' ' + (+d.properties.taxRate));
        //   d3.select(this).style('stroke', 'black');
        // }).on('mouseout', function() {
        //   d3.select(this).style('stroke', 'none');
        // })

      console.log(cleaned.filter((d) => d.rich))

      const mapLegend = this.mapLegend = svg.append('g').attr('opacity', 0);
      const circleLegend = this.circleLegend = svg.append('g').attr('opacity', 0);
      const scatterLegend = this.scatterLegend = svg.append('g').attr('opacity', 0);

      const mapKey = mapLegend.selectAll('.key')
        .data(['Property wealthy, do not pay recapture', 'Property wealthy', 'Property poor'])
        .enter()
        .append('g')
        .attr('class', 'key');

      mapKey
        .append('rect')
        .attr('x', 0)
        .attr('y', (d, i) => height - i * 75 - 175)
        .attr('width', (d, i) => 50)
        .attr('height', (d, i) => 50)
        .attr('fill', (d, i) => {
          if (i === 0) {
            return texture.url();
          } else if (i === 1) {
            return colors.YELLOW;
          } else {
            return colors.PURPLE;
          }
        });

      mapKey
        .append('text')
        .attr('dx', 70)
        .attr('dy', (d, i) => height - i * 75 - 175 + 35)
        .style('font-size', '24px')
        .text((d) => d);

      circleLegend
        .append('text')
        .attr('dx', -100)
        .attr('dy', 130)
        .style('font-size', '28px')
        .text('Property wealthy districts');

      const noPayGroup = this.noPayGroup = circleLegend.append('g');
      const maxRateGroup = this.maxRateGroup = circleLegend.append('g').style('opacity', 0);

      noPayGroup
        .append('line')
        .attr('x1', width + 100)
        .attr('y1', height / 2 - yOffset + 3 * circleSize / 2)
        .attr('x2', width + 100)
        .attr('y2', height / 2 - yOffset + 100)
        .style('stroke', 'black')
        .style('stroke-width', 2);

      noPayGroup
        .append('text')
        .attr('text-anchor', 'end')
        .attr('dx', width + 85)
        .attr('dy', height / 2 - yOffset + 90)
        .style('font-size', '28px')
        .text('Do not pay recapture');


      maxRateGroup
        .append('line')
        .attr('x1', width + 50)
        .attr('y1', height / 2 + yOffset - 3 * circleSize / 2)
        .attr('x2', width + 50)
        .attr('y2', height / 2 + yOffset - 100)
        .style('stroke', 'black')
        .style('stroke-width', 2);

      maxRateGroup
        .append('text')
        .attr('text-anchor', 'end')
        .attr('dx', width + 35)
        .attr('dy', height / 2 + yOffset - 90)
        .style('font-size', '28px')
        .text('Taxing at max rate');

      circleLegend
        .append('text')
        .attr('dx', -100)
        .attr('dy', height / 2 + yOffset - 40)
        .style('font-size', '28px')
        .text('Property poor districts');


      scatterLegend
        .append('text')
        .attr('dx', width - scatterMargin.right - 20)
        .attr('dy', 20)
        .style('font-size', '28px')
        .attr('fill', colors.LIGHT_BLACK)
        .attr('text-anchor', 'end')
        .text('Property wealth per student');
      scatterLegend
        .append('text')
        .attr('dx', width - scatterMargin.right - 20)
        .attr('dy', 20 + 34)
        .style('font-size', '28px')
        .attr('fill', colors.LIGHT_BLACK)
        .attr('text-anchor', 'end')
        .text('(log scale)');

      scatterLegend
        .append('text')
        .attr('dx', 0)
        .attr('dy', height)
        .style('font-size', '22px')
        .attr('fill', colors.LIGHT_BLACK)
        .text('0');

        scatterLegend
        .append('text')
        .attr('dx', (width - scatterMargin.right) / 2)
        .attr('dy', height + 30)
        .attr('text-anchor', 'middle')
        .style('font-size', '28px')
        .attr('fill', colors.LIGHT_BLACK)
        .text('Portion of economically disadvantaged students');
      scatterLegend
        .append('text')
        .attr('dx', width - scatterMargin.right)
        .attr('dy', height)
        .attr('text-anchor', 'end')
        .style('font-size', '22px')
        .attr('fill', colors.LIGHT_BLACK)
        .text('100%');

        scatterLegend
          .append('line')
          .attr('x1', 0)
          .attr('x2', width - scatterMargin.right)
          .attr('y1', height - scatterMargin.bottom)
          .attr('y2', height - scatterMargin.bottom)
          .attr('stroke', colors.LIGHT_BLACK)
          .attr('stroke-width', 2);

        scatterLegend
        .append('line')
        .attr('x1', width - scatterMargin.right)
        .attr('x2', width - scatterMargin.right)
        .attr('y1', 0)
        .attr('y2', height - scatterMargin.bottom)
        .attr('stroke', colors.LIGHT_BLACK)
        .attr('stroke-width', 2);

      this.richData = cleaned.filter((d) => d.properties.isPropertyWealthy);
      // const arcs = this.arcs = svg.append('g');
      // this.richArcs = arcs.selectAll('.rich-arc').data(cleaned.filter((d) => d.properties.isPropertyWealthy))
      //   .enter()
      //   .append('path')
      //   .attr('class', 'rich-arc')
      //   .attr('d', (d) => {
      //     d.startAngle = 0;
      //     d.end = 0;
      //     return arc({ startAngle: d.startAngle, endAngle: d.endAngle })
      //   })
      //   .attr('transform', (d, i) => {
      //     const center = getCircleCenter(d, i, -yOffset)
      //     return `translate(${center.join(',')})`;
      //   })
      //   .style('fill', colors.RED)
      //   .attr('opacity', 1)

      // this.poorArcs = arcs.selectAll('.poor-arc').data(cleaned.filter((d) => !d.properties.isPropertyWealthy))
      //   .enter()
      //   .append('path')
      //   .attr('class', 'poor-arc')
      //   .attr('d', (d) => {
      //     d.startAngle = 0;
      //     d.end = 0;
      //     return arc({ startAngle: d.startAngle, endAngle: d.endAngle })
      //   })
      //   .attr('transform', (d, i) => {
      //     const center = getCircleCenter(d, i, yOffset)
      //     return `translate(${center.join(',')})`;
      //   })
      //   .style('fill', 'orange')
      //   .attr('opacity', 1)

      // console.log(this.richArcs);

      this.rich = paths.filter(d => d.properties.isPropertyWealthy);
      this.poor = paths.filter(d => !d.properties.isPropertyWealthy);


      this.update(props);
    })

    // const columns = 8;

    const fundingSources = this.fundingSources = svg.append('g').attr('opacity', 0);

    const fsSizeX = 100;
    const fsSizeY = 20;

    fundingSources.append('text')
      .attr('dx', width / 2)
      .attr('dy', height / 2 + 1.5 * 18)
      // .style('dominant-baseline', 'middle')
      .attr('text-anchor', 'middle')
      .attr('fill', colors.BLACK)
      .style('font-weight', 'bold')
      .style('font-size', '48px')
      .text('STATE');

    const arrowCount = this.arrowCount = 5;
    fundingSources.selectAll('line.top').data(d3.range(arrowCount))
      .enter()
      .append('line')
      .attr('class', 'top')
      .attr('x1', (d, i) => width / 2 - 100 * (i - (arrowCount / 2)) - 50)
      .attr('x2', (d, i) => width / 2 - 100 * (i - (arrowCount / 2)) - 50)
      .attr('y1', (d, i) => i === Math.floor(arrowCount / 2) ? height / 2 - 50 :  height / 2 - 90)
      .attr('y2', height / 2 - 50)
      .attr('opacity', (d, i) => i === Math.floor(arrowCount / 2) ? 0 :  1)
      .attr('marker-end', 'url(#arrow)')
      .attr('fill', colors.BLACK)
      .attr('stroke', colors.BLACK)
      .attr('stroke-width', 5);

    fundingSources
      .append('text')
      .attr('dx', width / 2)
      .attr('dy', height / 2 - 60)
      .attr('fill', colors.GREEN)
      // .attr('stroke', '#ffffff')
      // .attr('stroke-width', 10)
      // .attr('stroke-mit', 10)
      .attr('text-anchor', 'middle')
      .style('font-size', '36px')
      .style('font-weight', 'bold')
      .text('$$$')

    fundingSources.append('line')
      .attr('x1', width / 2 - 200)
      .attr('x2', width / 2 + 200)
      .attr('y1', height / 2 - 20)
      .attr('y2', height / 2 - 20)
      .style('stroke', colors.BLACK)
      .style('stroke-width', 1);
    fundingSources.append('line')
      .attr('x1', width / 2 - 200)
      .attr('x2', width / 2 + 200)
      .attr('y1', height / 2 + 40)
      .attr('y2', height / 2 + 40)
      .style('stroke', colors.BLACK)
      .style('stroke-width', 1);

    this.bottomArrows = fundingSources.selectAll('line.bottom').data(d3.range(arrowCount))
      .enter()
      .append('line')
      .attr('class', 'bottom')
      .attr('x1', (d, i) => width / 2 - 100 * (i - (arrowCount / 2)) - 50)
      .attr('x2', (d, i) => width / 2 - 100 * (i - (arrowCount / 2)) - 50)
      .attr('y1', height / 2 + 60)
      .attr('y2', height / 2 + 110)
      .attr('marker-end', 'url(#arrow)')
      .attr('fill', colors.BLACK)
      .attr('stroke', colors.BLACK)
      .attr('stroke-width', 5);

    this.bottomText = fundingSources.selectAll('text.bottom').data(d3.range(arrowCount))
    .enter()
    .append('text')
    .attr('class', 'bottom')
    .attr('dx', (d, i) => width / 2 - 100 * (i - (arrowCount / 2)) - 50)
    .attr('dy', height / 2 + 105)
    .attr('text-anchor', 'middle')
    .attr('fill', colors.BLACK)
    // .style('font-weight', 'bold')
    .style('font-size', '48px')
    .attr('opacity', 0)
    .text('?');

    // const state = fundingSources.append('rect')
    //   .attr('x', width - 10 - fsSizeX)
    //   .attr('y', height / 2 - fsSizeY / 2)
    //   .attr('width', fsSizeX)
    //   .attr('height', fsSizeY)
    //   .attr('fill', '#ddd')
    //   .attr('stroke', '#333')
    //   .attr('strokeWidth', 3);

    // this.currentState = states.INITIAL;
  }

  update(props) {
    const { state } = props;
    const { rich, poor, paths } = this;
    const prevState = this.props.state;

    if (state === this.currentState) {
      return;
    }

    let animationTime = 750;
    let particleDelay = 10;
    let interval = null;
    switch (state) {
      case states.INITIAL:
        this.mapLegend
          .style('opacity', 0);

        this.paths
          .style('fill-opacity', 0)
          .style('stroke', '#000000');

        break;
      case states.EXTREMES:
        const maxSize = Math.max(rich.size(), poor.size());

        this.mapLegend
          .transition()
          .delay(animationTime / 2)
          .duration(animationTime)
          .style('opacity', 1);

        this.paths
          .transition()
          .delay((d, i) => i * particleDelay / 8)
          .duration(animationTime / 3)
          .style('fill-opacity', 1.0)
          .style('stroke', '#ffffff');
        if (prevState !== states.INITIAL) {
          // neither
          //   .transition()
          //   .delay(animationTime + 30 * particleDelay)
          //   .duration(animationTime)
          //   .style('opacity', 1);
          rich
            .attr("d", (d, i) => richInterpolator(d, i, true)(1));
          poor
            .attr("d", (d, i) => poorInterpolator(d, i, true)(1));

          this.paths
            .style('stroke-width', 0.5);
        }

        this.circleLegend
          .style('opacity', 0);
        break;
      case states.INCOME:
        this.mapLegend
          .transition()
          .duration(animationTime)
          .style('opacity', 0);

        this.circleLegend
          .transition()
          .delay(animationTime / 2)
          .duration(animationTime)
          .style('opacity', 1);

        if (prevState !== states.TAXES) {
            rich
              .transition()
              .delay((d, i) => i * particleDelay / 4)
              .duration(animationTime / 4)
              .attr("opacity", (d, i) => d.properties.recapturePaid > 0 ? 1 : 0.5)
              .attrTween("d", (d, i) => richInterpolator(d, i));
            poor
              .transition()
              .delay((d, i) => i * particleDelay / 6)
              .duration(animationTime / 4)
              .attrTween("d", (d, i) => poorInterpolator(d, i));
        } else {
          rich
            .attr("d", (d, i) => richInterpolator(d, i)(1));
          poor
            .attr("d", (d, i) => poorInterpolator(d, i)(1));
        }
        this.fundingSources
          .style('opacity', 0)
        break;
      case states.TAXES:

        this.circleLegend
          .transition()
          .duration(animationTime)
          .style('opacity', 0.3);

        this.fundingSources
          .transition()
          .duration(animationTime)
          .style('opacity', 1)

        this.bottomArrows
          .transition()
          .delay((d, i) => 2 * animationTime + ((this.arrowCount - 1) - i) * 700)
          .duration(animationTime)
          .style('opacity', 0);

        this.bottomText
          .transition()
          .delay((d, i) => 2.5 * animationTime + ((this.arrowCount - 1) - i) * 700)
          .duration(animationTime)
          .style('opacity', 1);

        this.maxRateGroup
          .style('opacity', 0);

        poor
          .style('fill', colors.PURPLE)
          .style('stroke', 'none')
          .style('stroke-width', 0)

        break;
      case states.RECAPTURE1:

        this.circleLegend
        .transition()
        .delay(animationTime / 2)
        .duration(animationTime)
        .style('opacity', 1.0);

        this.fundingSources
          .transition()
          .duration(animationTime)
          .style('opacity', 0);

        this.maxRateGroup
          .transition()
          .delay(poor.size() / 2 * particleDelay / 2)
          .duration(animationTime)
          .style('opacity', 1);

        if (this.currentState === states.RECAPTURE2) {
            rich
              .attr("opacity", (d, i) => d.properties.recapturePaid > 0 ? 1 : 0.5)
              .attr("d", function (d, i) {
                const _d =  d3.select(this).attr('d');
                const c = getCircleCenter(d, i, -yOffset);
                return flubber.toCircle(_d, c[0], c[1], circleSize / 2)(1);
              });

            poor
              .attr('opacity', 1)
              .attr("d", function (d, i) {
                const _d =  d3.select(this).attr('d');
                const c = getCircleCenter(d, i, yOffset);
                return flubber.toCircle(_d, c[0], c[1], circleSize / 2)(1);
              });
        }

        this.svg.select('.axis.y')
          .remove();

        poor
          .transition()
          .duration(animationTime)
          .delay((_, i) => i * particleDelay / 2)
          .style('fill', (d) => d.properties.taxRate >= 1.17 ? 'white' : colors.PURPLE)
          .style('stroke', (d) => d.properties.taxRate >= 1.17 ? colors.PURPLE : 'none')
          .style('stroke-width', (d) => d.properties.taxRate >= 1.17 ? 5 : 0)

        this.circleLegend
        .style('opacity', 1);

        this.scatterLegend
          .style('opacity', 0);

        break;
      case states.RECAPTURE2:

        this.circleLegend
        .transition()
        .duration(animationTime)
        .style('opacity', 0);

        this.scatterLegend
          .transition()
          .duration(animationTime)
          .style('opacity', 1);

        const xScale = d3.scaleLinear().domain([0, 1]).range([0, width - scatterMargin.right]).clamp(true);
        const yScale = d3.scaleLog().domain([10000, 25000000]).range([height - scatterMargin.bottom, 0]).clamp(true);

        const yAxis = d3.axisRight(yScale);
        // Add the Y Axis
        this.svg.append("g")
        .attr('class', 'axis y')
        .attr('opacity', 0)
        .attr("transform", `translate(${width - scatterMargin.right}, 0)`)
        .call(yAxis.ticks(5).tickFormat((d) => {
          const f = d3.format(".2s");
          const n = +f(d).substring(0, 1);
          if (n === 1 || n % 2 === 0) {
            return f(d);
          }
          return '';
        }))
        .transition()
        .duration(animationTime)
        .delay(animationTime / 2)
        .attr('opacity', 1);

        rich
          .transition()
          .delay((d, i) => i * particleDelay / 4)
          .duration(animationTime)
          .attr('opacity', d => d.properties.percentEconDisadvantaged > 0 ? 0.75 : 0)
          .attrTween("d", function (d, i) {
            const _d =  d3.select(this).attr('d');
            return flubber.toCircle(_d, xScale(d.properties.percentEconDisadvantaged), yScale(d.properties.propertyWealth2016 / d.properties.ada2016), circleSize / 3);
          });
        poor
          .style('fill', colors.PURPLE)
          .style('stroke', 'none')
          .transition()
          .delay((d, i) => i * particleDelay / 6)
          .duration(animationTime)
          .attr('opacity', d => d.properties.percentEconDisadvantaged > 0 ? 0.75 : 0)
          .attrTween("d", function (d, i) {
            const _d =  d3.select(this).attr('d');
            return flubber.toCircle(_d, xScale(d.properties.percentEconDisadvantaged), yScale(d.properties.propertyWealth2016 / d.properties.ada2016), circleSize / 3);
          });
        break;
    }

    this.currentState = state;
  }
}

module.exports = DistrictComparison;
