const React = require('react');
const D3Component = require('idyll-d3-component');
const d3 = require('d3');
const debounce = require('debounce');
const textures = require('textures');

const yearlyFunding = require('./yearly-averages.json');

const states = {
  INITIAL: 'initial',
  POPULATION1: 'population-1',
  POPULATION2: 'population-2',
  POPULATION3: 'population-3',
  STATE: 'state-funding',
  RELATIVE: 'relative-funding',
}

const colors = {
  GREEN: '#5FBD67',
  PINK: '#F17CB0',
  GOLD: '#B3912F',
  BLACK: '#4D4D4D',
  BLUE: '#5EA5DB',
  ORANGE: '#FBA43A',
  PURPLE: '#B176B1'
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

    this.isMobile = window.innerWidth < 800;
    const margin = { top: 20, right: 0, bottom: 60, left: 50 };
    const totalWidth = window.innerWidth;
    const totalHeight = window.innerHeight;
    const width = this.width = totalWidth - margin.left - margin.right;
    const height = this.height = totalHeight - margin.top - margin.bottom;

    const x = this.x = d3.scaleTime().domain([new Date('1995'), new Date('2016')]).range([0, width]);
    const y = this.y = d3.scaleLinear().domain([0, 5524925]).range([height, 0]);
    const line = this.line = d3.line()
      .x(d => x(d.x))
      .y(d => y(d.y));
    const area = this.area = d3.area()
      .x(d => x(d.x))
      .y0(height)
      .y1(d => y(d.y));

    const svg = this.svg = d3.select(node).append('svg').style('background', '#f3f1f2');

    const texture = textures.lines()
      .orientation("diagonal")
      .size(12)
      .strokeWidth(1)
      .stroke(colors.PURPLE)
      .background(colors.BLACK);

      const greenTexture = textures.lines()
        .orientation("diagonal")
        .size(6)
        .strokeWidth(1)
        .stroke('#ffffff')
        .background(colors.GREEN);

    svg.call(texture);

    svg.attr('viewBox', `0 0 ${totalWidth} ${totalHeight}`)
    .style('width', '100%')
    .style('height', 'auto');


    svg.select('defs').append('clipPath').attr('id', 'content-clip').append('rect').attr('x', 0).attr('y', 0).attr('width', width).attr('height', height);
    const content = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

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
    const xAxis = this.xAxis = d3.axisBottom(x);
    content.append("g")
    .attr('class', 'axis x')
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis);

    const yAxis = this.yAxis = d3.axisLeft(y).tickFormat((d) => {
      const ems = d / 1000000;
      if (ems === Math.floor(ems)) {
        if (ems >= 5) {
          return ems + 'm';
        }
        return ems.toFixed(0);
      }
      return '';
    });
    // Add the Y Axis
    content.append("g")
    .attr('class', 'axis y')
    .call(yAxis);


    const dataContent = content.append('g').attr('clip-path', 'url(#content-clip)');


    const populationData = this.populationData = [
      { x: new Date('1995'), y: 3670196 },
      { x: new Date('1996'), y: 3740260 },
      { x: new Date('1997'), y: 3828975 },
      { x: new Date('1998'), y: 3891877 },
      { x: new Date('1999'), y: 3945367 },
      { x: new Date('2000'), y: 3991783 },
      { x: new Date('2001'), y: 4059619 },
      { x: new Date('2002'), y: 4146653 },
      { x: new Date('2003'), y: 4239911 },
      { x: new Date('2004'), y: 4311502 },
      { x: new Date('2005'), y: 4383871 },
      { x: new Date('2006'), y: 4505572 },
      { x: new Date('2007'), y: 4576933 },
      { x: new Date('2008'), y: 4651516 },
      { x: new Date('2009'), y: 4728204 },
      { x: new Date('2010'), y: 4824778 },
      { x: new Date('2011'), y: 4912385 },
      { x: new Date('2012'), y: 4978120 },
      { x: new Date('2013'), y: 5058939 },
      { x: new Date('2014'), y: 5135880 },
      { x: new Date('2015'), y: 5215282 },
      { x: new Date('2016'), y: 5284252 },
    ]

    const populationEconData = this.populationEconData = [
      { x: new Date('1995'), y: 1699625.673 },
      { x: new Date('1996'), y: 1753489.267 },
      { x: new Date('1997'), y: 1841281.31 },
      { x: new Date('1998'), y: 1886872.422 },
      { x: new Date('1999'), y: 1914512.439 },
      { x: new Date('2000'), y: 1955050.724 },
      { x: new Date('2001'), y: 2001789.281 },
      { x: new Date('2002'), y: 2093577.915 },
      { x: new Date('2003'), y: 2201685.793 },
      { x: new Date('2004'), y: 2278000.377 },
      { x: new Date('2005'), y: 2393849.617 },
      { x: new Date('2006'), y: 2503810.312 },
      { x: new Date('2007'), y: 2541070.549 },
      { x: new Date('2008'), y: 2572151.83 },
      { x: new Date('2009'), y: 2681553.673 },
      { x: new Date('2010'), y: 2848307.302 },
      { x: new Date('2011'), y: 2909664.418 },
      { x: new Date('2012'), y: 3008506.857 },
      { x: new Date('2013'), y: 3054850.488 },
      { x: new Date('2014'), y: 3092057.242 },
      { x: new Date('2015'), y: 3068996.93 },
      { x: new Date('2016'), y: 3118764.869 },
    ]

    const projected2005Econ = this.projected2005Econ = populationData.map((d) => {
      return {
        x: d.x,
        y: 0.46309 * d.y
      };
    });

    const populationGroup = this.populationGroup = dataContent.append('g');
    this.populationPath = populationGroup.append('path')
      .attr('fill', colors.BLUE)
      .attr('fill-opacity', 0.8)
      .attr('stroke', colors.BLUE)
      .attr('stroke-width', '3')
      .attr('d', area(populationData))
      // .attr('opacity', 0)
      // .attr('stroke-dasharray', initialDash)

    let label = 'Student population (millions)';
    let fontSize = 12;
    let w = label.length * 0.5 * fontSize + 20;
    let h = 30;
    populationGroup.append('rect')
      .attr('x', x(new Date('1996')) - 10)
      .attr('y', y(3891877) + 30)
      .attr('width', w)
      .attr('height', h)
      .attr('stroke', 'black')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', `0,${w + h},${w},${h}`)
      .attr('fill', 'none')

    populationGroup.append('text')
      .attr('dx', x(new Date('1996')))
      .attr('dy', y(3891877) + 45)
      .style('dominant-baseline', 'middle')
      .attr('font-size', fontSize + 'px')
      .attr('fill', '#000')
      .text(label)


    const subPaths = this.subPaths = populationGroup.append('g').attr('opacity', 0);
    // subPaths.append('path')
    //   .attr('fill', 'none')
    //   .attr('stroke', 'red')
    //   .attr('d', line([{x: new Date('2008'), y: 0}, {x: new Date('2016'), y: 40}]))
    //   .attr('stroke-dasharray', initialDash)


    const aboveArea = this.area = d3.area()
      .x(d => x(d.x))
      .y0((d,i) => y(projected2005Econ[i].y))
      .y1(d => y(d.y));


    label = 'Econ. disadvantaged students';
    fontSize = 12;
    w = label.length * 0.5 * fontSize + 30;
    h = 30;

    subPaths.append('path')
      .attr('fill', colors.BLACK)
      .attr('fill-opacity', 0.8)
      .attr('stroke', colors.BLACK)
      .attr('stroke-width', '3')
      .attr('d', area(populationEconData))

    subPaths.append('rect')
      .attr('x', x(new Date('1996')) - 10)
      .attr('y', y(1841281) + 30)
      .attr('width', w)
      .attr('height', h)
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', `0,${w + h},${w},${h}`)
      .attr('fill', 'none')


    subPaths.append('text')
      .attr('dx', x(new Date('1996')))
      .attr('dy', y(1841281) + 45)
      // .attr('text-anchor', 'middle')
      .style('dominant-baseline', 'middle')
      .attr('font-size', fontSize + 'px')
      .attr('fill', 'white')
      .attr('stroke', 'none')
      .text(label)

    const subOverlays = this.subOverlays = subPaths.append('g').attr('opacity', 0);

    subOverlays.append('path')
    .attr('fill', texture.url())
    .attr('d', aboveArea(populationEconData))
      // .attr('stroke-dasharray', initialDash);
    subOverlays.append('path')
      .attr('fill', 'none')
      .attr('stroke', colors.PURPLE)
      .attr('stroke-width', 1)
      // .attr('stroke-dasharray', '5, 5')
      .attr('d', line(projected2005Econ));
    // this.subPopulationPaths = subPaths/.selectAll('path');


    label = 'Relative increase since 1995';
    fontSize = 12;
    w = label.length * 0.5 * fontSize + 30;
    h = 45;

    subOverlays.append('line')
      .attr('x1', x(new Date('2011')))
      .attr('x2', x(new Date('2012')))
      .attr('y1', y(projected2005Econ[16].y))
      .attr('y2', y(projected2005Econ[16].y) + 40)
      .attr('stroke', colors.PURPLE)
      .attr('stroke-width', 1)
      .attr('fill', 'none');

    subOverlays.append('text')
      .attr('dx', x(new Date('2012')) + 10)
      .attr('dy', y(projected2005Econ[16].y) + 40 + fontSize)
      .attr('fill', 'white')
      .attr('stroke', 'none')
      .attr('text-anchor', this.isMobile ? 'end' : 'start')
      .text(label);

    // subOverlays.append('rect')
    //   .attr('x', x(new Date('2009')) - label.length * 0.5 * fontSize / 2 - 15)
    //   .attr('y', y(1841281) + 30)
    //   .attr('width', w)
    //   .attr('height', h)
    //   .attr('stroke', colors.BLACK)
    //   .attr('stroke-width', 3)
    //   .attr('stroke-dasharray', `0,${w + h},${w},${h}`)
    //   .attr('fill', '#ffffff')


    const revenuePaths = this.revenuePaths = dataContent.append('g').attr('opacity', 0);
    let initialRate = 0;
    const stateFundingData = this.stateFundingData = yearlyFunding.map((d, i) => {
      if (i === 0) {
        initialRate = d.localSumPerADA / d.sumPerADA;
      }
      return {
        x: new Date(d.year),
        y: d.sumPerADA,
        local: d.localSumPerADA,
        localProjected: initialRate * d.sumPerADA,
        localOther: d.localOtherSumPerADA,
        state: d.stateSumPerADA,
        federal: d.federalSumPerADA
      };
    });

    console.log('stateFundingData', stateFundingData);

    this.totalRevenuePath = revenuePaths.append('path')
      .attr('fill', 'none')
      .attr('stroke', '#242021')
      .attr('stroke-width', 4)
      .attr('d', line(stateFundingData))
      // .attr('stroke-dasharray', initialDash);

    label = 'Average district revenue per student ($)';
    fontSize = 12;
    w = label.length * 0.5 * fontSize + 20;
    h = 30;

    const fundingSources = this.fundingSources = revenuePaths.append('g').attr('opacity', 0);
    this.revenueLabelRect = revenuePaths.append('rect')
    .attr('x', x(new Date('1996')) - 10)
    .attr('width', w)
    .attr('height', h)
    .attr('stroke', 'black')
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', `0,${w + h},${w},${h}`)
    .style('fill', this.isMobile ? '#f3f1f2' : 'none')


    this.revenueLabelText = revenuePaths.append('text')
    .attr('dx', x(new Date('1996')))
    // .attr('text-anchor', 'middle')
    .style('dominant-baseline', 'middle')
    .attr('font-size', fontSize + 'px')
    .attr('fill', 'black')
    .attr('stroke', 'none')
    .text(label)

    this.stateFunding = fundingSources.append('path')
      .attr('fill', colors.BLUE)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 0.5)

    fontSize = 12;
    this.stateFundingText = fundingSources.append('text').text('State funding')
    .attr('fill', 'black')
    .style('font-size', fontSize + 'px')
    .attr('text-anchor', this.isMobile ? 'end' : 'start')
    .attr('dx', x(new Date('2014')));

    this.localFunding = fundingSources.append('path')
    .attr('fill', colors.GREEN)
    .attr('stroke', '#ffffff')
    .attr('stroke-width', 0.5)

    this.localOtherFunding = fundingSources.append('path')
    .attr('fill', colors.GREEN)
    .attr('fill-opacity', 0.8)
    .attr('stroke', '#ffffff')
    .attr('stroke-width', 0.5)


    this.federalFunding = fundingSources.append('path')
    .attr('fill', colors.PINK)
    .attr('stroke', '#ffffff')
    .attr('stroke-width', 0.5);

    this.localFundingText = fundingSources.append('text').text('Local property tax')
      .attr('text-anchor', this.isMobile ? 'end' : 'start')
      .attr('fill', 'black')
      .style('font-size', fontSize + 'px')
      .attr('dx', x(new Date('2014')));

    fontSize = 10;

    this.localOtherFundingText = fundingSources.append('text').text('Other local funding')
    .attr('text-anchor', this.isMobile ? 'end' : 'start')
    .attr('fill', 'black')
    .style('font-size', fontSize + 'px')
    .attr('dx', x(new Date('2014')));
    // this.localProjectedFunding = fundingSources.append('path')
    //   .attr('fill', greenTexture.url())
    //   .attr('stroke', '#ffffff')
    //   .attr('stroke-width', 0.5);

    fontSize = 12;
    this.federalFundingText = fundingSources.append('text').text('Federal funding')
    .attr('text-anchor', this.isMobile ? 'end' : 'start')
    .attr('fill', 'black')
    .style('font-size', fontSize + 'px')
    .attr('dx', x(new Date('2014')));

    const localIncreaseAnnotation = this.localIncreaseAnnotation = fundingSources.append('g').attr('opacity', 0);

    fontSize = 12;

    localIncreaseAnnotation.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('fill', 'white')
      .attr('fill-opacity', 0.2)
      .attr('width', x(new Date('2012')))
      .attr('height', height)


    this.increaseLine = localIncreaseAnnotation.append('line')
      .attr('x1', x(new Date('2012')))
      .attr('x2', x(new Date('2012')))
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', 'black')
      .attr('stroke-dasharray', '5,5');



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
        return i === 0 ? '#151E3F' : '#ffffff'
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
        this.populationGroup
          .transition()
          //.duration(1000)
          .attr('opacity', 1)

        this.subPaths
          .attr('opacity', 0);
        // this.populationPath
        //   .attr('d', this.area(this.populationData));
        break;
      case states.POPULATION1:
        this.setProgress(2);
        console.log('population 2');
        this.subPaths
          .transition()
          //.duration(1000)
          .attr('opacity', 1);

        this.subOverlays
          .attr('opacity', 0);
        this.revenuePaths
          .attr('opacity', 0);

        break;
      case states.POPULATION2:
        this.setProgress(3);
        console.log('population 2');
        this.y.domain([0, 5524925]);
        this.svg.select(".y.axis").call(this.yAxis.tickFormat((d) => {
          const ems = d / 1000000;
          if (ems === Math.floor(ems)) {
            if (ems >= 5) {
              return ems + 'm';
            }
            return ems.toFixed(0);
          }
          return '';
        }));
        this.svg.select(".y.grid").call(d3.axisLeft(this.y).ticks(7).tickSize(-this.width).tickFormat(""));

        this.populationGroup
          .attr('opacity', 1)
        this.subOverlays
          .transition()
          //.duration(1000)
          .attr('opacity', 1);
        this.revenuePaths
          .attr('opacity', 0);
        break;
      case states.POPULATION3:
        this.setProgress(4);
        this.populationGroup
          .transition()
          .duration(1000)
          .attr('opacity', 0)

        this.y.domain([0, 1.05 * d3.max(this.stateFundingData, d => d.y)]);
        let t = this.svg.transition().duration(500);
        t.select(".y.axis").call(this.yAxis.tickFormat((d) => {
          return d;
        }));

        t = this.svg.transition().duration(500);
        t.select(".y.grid").call(d3.axisLeft(this.y).ticks(7).tickSize(-this.width).tickFormat(""))

        this.revenueLabelRect
          .attr('y', this.y(6661) - 140)

        this.revenueLabelText
          .attr('dy', this.y(6661) - 125)

        this.totalRevenuePath
          .attr('d', this.line(this.stateFundingData))

        this.revenuePaths
          .transition()
          .delay(500)
          .duration(1000)
          .attr('opacity', 1)

        this.fundingSources
          .attr('opacity', 0);

        break;
      case states.STATE:
        this.setProgress(5);
        const { area, stateFundingData, y } = this;

        this.stateFunding
          .attr('d', area.y0(this.height).y1((d) => y(d.state))(stateFundingData))

        this.localFunding
          .attr('d', area.y0((d) => y(d.state)).y1(d => y(d.state + d.local))(stateFundingData))


          // this.localProjectedFunding
          //   .attr('d', area.y0((d) => {
          //     return y(d.state + d.localProjected);
          //   }).y1(d => {
          //     return y(d.state + d.local);
          //   })(stateFundingData.filter((d) => {
          //     console.log(d.x);
          //     return (d.x >= new Date('2012'));
          //   })))

        this.localOtherFunding
          .attr('d', area.y0((d) => y(d.state + d.local)).y1(d => y(d.state + d.local + d.localOther))(stateFundingData))

        this.federalFunding
          .attr('d', area.y0((d) => y(d.state + d.local + d.localOther)).y1(d => y(d.state + d.local + d.localOther + d.federal) )(stateFundingData))

        let d = stateFundingData[19];
        let fontSize = 12;
        this.stateFundingText.attr('dy', y(d.state / 2) + 0.5 * fontSize);
        this.localFundingText.attr('dy', y(d.state + d.local / 2) + 0.5 * fontSize);
        fontSize = 10;
        this.localOtherFundingText.attr('dy', y(d.state + d.local + d.localOther / 2) + 0.5 * fontSize);
        fontSize = 12;
        this.federalFundingText.attr('dy',
        this.isMobile ? 30 : y(d.state + d.local + d.localOther + d.federal / 2) + 0.5 * fontSize);

        this.federalFunding
          .attr('d', area.y0((d) => y(d.state + d.local + d.localOther)).y1(d => y(d.state + d.local + d.localOther + d.federal) )(stateFundingData))

        this.fundingSources.transition().duration(1000)
          .attr('opacity', 1);

        this.localIncreaseAnnotation
          .attr('opacity', 0);
        break;
      case states.RELATIVE:
        this.setProgress(6);

        const d2012 = this.stateFundingData[17];
        console.log(this.y(d2012.y));
        this.increaseLine.attr('y1', this.y(d2012.y))
        this.localIncreaseAnnotation
          .transition()
          .duration(1000)
          .attr('opacity', 1);
        break;
    }
  }

  update(props) {
    const { value } = props;
    const stateCount = Object.keys(states).length;
    if (value < 0.75 / stateCount) {
      this._setState(states.INITIAL);
    }
    else if (value < 1.75 / stateCount) {
      this._setState(states.POPULATION1);
    } else if (value < 2.75 / stateCount) {
      this._setState(states.POPULATION2);
    } else if (value < 4.25 / stateCount) {
      this._setState(states.POPULATION3);
    }
    else if (value < 5.25 / stateCount) {
      this._setState(states.STATE);
    } else if(value < 6.25 / stateCount) {
      this._setState(states.RELATIVE);
    }
  }
}

IntroChart.update = debounce(IntroChart.update, 250).bind(this);

module.exports = IntroChart;
