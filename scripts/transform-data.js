const path = require('path');
const Papa = require('papaparse');
const fs = require('fs');

let topo = require('../data/isd-topo.json');


const recaptureContents = fs.readFileSync(path.join(__dirname, '..', 'data', 'recapture.csv'), 'utf8');

const fileContents = fs.readFileSync(path.join(__dirname, '..', 'data', 'yearly-fiscal-data-by-district.csv'), 'utf8');


const demoContents = fs.readFileSync(path.join(__dirname, '..', 'data', 'demographic.csv'), 'utf8');

const earlyFileContents = fs.readFileSync(path.join(__dirname, '..', 'data', 'yearly-92-11.csv'), 'utf8');
const yearGroups = {};
const yearlyAverages = {};
const districtMap = {};
const districtMapOld = {};
const demographicMap = {};

const parseNumber = (s) => {
  return Number(s.replace(/[^0-9\.-]+/g,""));
}

const processRow = (r, yearAccessor) => {
  const year = r[yearAccessor];
  const id = r['State ID (CDN)'];
  if (!yearGroups[year]) {
    yearGroups[year] = [];
  }
  // console.log(r['Property Value']);
  yearGroups[year].push({
    year: year,
    id: id,
    name: r['District Name'],
    county: r.County,
    enrollment: parseNumber(r['Reported Enrollment']),
    ada: parseNumber(r['Average Daily Attendance (ADA)']),
    revenue: parseNumber(r['Total Revenue']),
    localOtherRevenue: parseNumber(r['Other Local & Intermediate ']),
    localRevenue: parseNumber(r['Local Tax Revenue']),
    stateRevenue: parseNumber(r['State Revenue']),
    federalRevenue: parseNumber(r['Federal Revenue']),
    recapture: parseNumber(r['Recapture']),
    propertyValue: parseNumber(r['Property Value']),
    taxRate: parseNumber(r['M&O Rates'])
  })
}


const mergeTopo = (csvData, oldCSVData, demoData, recapture, topoData) => {
  // console.log(csvData.ada)
  return {
    name: csvData.name,
    id: csvData.id,
    isPropertyWealthy: recapture.eligible,
    recapturePaid: recapture.value || 0,
    isISD: csvData.localOtherRevenue > 0,
    taxRate: csvData.taxRate,
    ada1995: oldCSVData.ada,
    ada2016: csvData.ada,
    propertyWealth1995: oldCSVData.propertyValue,
    propertyWealth2016: csvData.propertyValue,
    percentEconDisadvantaged: demoData > 0 ? 1 - demoData / 100 : 0
  }
};


Papa.parse(earlyFileContents, {
  delimiter: ',',
  header: true,
	complete: function(earlyResults) {
    earlyResults.data.forEach((r) => {
      processRow(r, 'Year');
    })
    Papa.parse(fileContents, {
      delimiter: ',',
      header: true,
      complete: function(results) {
        results.data.forEach((r) => {
          processRow(r, 'Year Fixed');
        })

        // console.log(Object.keys(yearGroups));
        Object.keys(yearGroups).forEach((year) => {
          if (!yearlyAverages[year]) {
            yearlyAverages[year] = {
              count: 0,
              sum: 0,
              localSum: 0,
              localOtherSum: 0,
              stateSum: 0,
              federalSum: 0,
              localSumNormalized: 0,
              localOtherSumNormalized: 0,
              stateSumNormalized: 0,
              federalSumNormalized: 0,
              sumPerADA: 0,
              localSumPerADA: 0,
              localOtherSumPerADA: 0,
              stateSumPerADA: 0,
              federalSumPerADA: 0,
            }
          }
          yearGroups[year].forEach((d) => {
            if (!d.revenue || !d.localRevenue || !d.localOtherRevenue || !d.stateRevenue || !d.federalRevenue) {
              return;
            }
            yearlyAverages[year].count++;
            yearlyAverages[year].sum += d.revenue;
            yearlyAverages[year].localSum += d.localRevenue;
            yearlyAverages[year].stateSum += d.stateRevenue;
            yearlyAverages[year].federalSum += d.federalRevenue;
            yearlyAverages[year].localSumNormalized += d.revenue ? (d.localRevenue / d.revenue) : 0;
            yearlyAverages[year].localOtherSumNormalized += d.revenue ? (d.localOtherRevenue / d.revenue) : 0;
            yearlyAverages[year].stateSumNormalized += d.revenue ? (d.stateRevenue / d.revenue) : 0;
            yearlyAverages[year].federalSumNormalized += d.revenue ? (d.federalRevenue / d.revenue) : 0;
            yearlyAverages[year].sumPerADA += (d.revenue && d.ada) ? (d.revenue / d.ada) : 0;
            yearlyAverages[year].localSumPerADA += (d.localRevenue && d.ada) ? (d.localRevenue / d.ada) : 0;
            yearlyAverages[year].localOtherSumPerADA += (d.localOtherRevenue && d.ada) ? (d.localOtherRevenue / d.ada) : 0;
            yearlyAverages[year].stateSumPerADA += (d.stateRevenue && d.ada) ? (d.stateRevenue / d.ada) : 0;
            yearlyAverages[year].federalSumPerADA += (d.federalRevenue && d.ada) ? (d.federalRevenue / d.ada) : 0;
          })

          const count = yearlyAverages[year].count;
          yearlyAverages[year].localAverage = yearlyAverages[year].localSum / count;
          yearlyAverages[year].stateAverage = yearlyAverages[year].stateSum / count;
          yearlyAverages[year].federalAverage = yearlyAverages[year].federalSum / count;
          yearlyAverages[year].localAverageNormalized = yearlyAverages[year].localSumNormalized / count;
          yearlyAverages[year].localOtherAverageNormalized = yearlyAverages[year].localOtherSumNormalized / count;
          yearlyAverages[year].stateAverageNormalized = yearlyAverages[year].stateSumNormalized / count;
          yearlyAverages[year].federalAverageNormalized = yearlyAverages[year].federalSumNormalized / count;
          yearlyAverages[year].sumPerADA = yearlyAverages[year].sumPerADA / count;
          yearlyAverages[year].localSumPerADA = yearlyAverages[year].localSumPerADA / count;
          yearlyAverages[year].localOtherSumPerADA = yearlyAverages[year].localOtherSumPerADA / count;
          yearlyAverages[year].stateSumPerADA = yearlyAverages[year].stateSumPerADA / count;
          yearlyAverages[year].federalSumPerADA = yearlyAverages[year].federalSumPerADA / count;
        })

        Papa.parse(recaptureContents, {
          delimiter: ',',
          header: true,
          complete: function(recaptureResults) {


            // console.log(recaptureResults.data);
            const recaptureMap = {};
            recaptureResults.data.filter((d) => {
              return d['Chapter 41 Designation 2016'].toLowerCase() === 'yes';
            }).forEach((d) => {
              recaptureMap[d['District']] = parseNumber(d['2016   Total Recapture']);
            })

            yearGroups["2012"].forEach((d) => {
              districtMapOld[d.id] = d;
            })


            Papa.parse(demoContents, {
              delimiter: ',',
              header: true,
              complete: function(demoResults) {
                demoResults.data.forEach((d) => {
                  demographicMap[d['District Number']] = parseNumber(d['Not Economically Disadvantaged Percent']);
                })

                let richest = null;
                let maxRich = 0;
                let poorest = null;
                let minPoor = Number.POSITIVE_INFINITY;

                yearGroups["2016"].forEach((d) => {
                  districtMap[d.id] = d;
                  if (!d.propertyValue) {
                    return;
                  }
                  if (d.propertyValue / d.ada > maxRich) {
                    maxRich = d.propertyValue / d.ada;
                    richest = d;
                  }
                  if (d.propertyValue / d.ada < minPoor) {
                    minPoor = d.propertyValue / d.ada;
                    poorest = d;
                  }
                })

                console.log('Richest');
                console.log(maxRich);
                console.log(JSON.stringify(richest));


                console.log('Poorest');
                console.log(minPoor);
                console.log(JSON.stringify(poorest));

                let isdCount = 0;
                let isdWealthyCount = 0;
                let isdWealthyPaysCount = 0;

                let totalRecapture = 0;
                let austinRecapture = 0;

                let maxedOut = 0;
                let totalPoor = 0;
                let poorMaxed = 0;
                let richMaxed = 0;

                topo.objects.isd.geometries = topo.objects.isd.geometries.map((d) => {
                  const id = d.properties["DISTRICT_C"];
                  const recaptureEligible = recaptureMap.hasOwnProperty(id);
                  const recapture = { eligible: recaptureEligible, value: recaptureMap[id] };
                  // console.log(recapture);
                  d.properties = mergeTopo(districtMap[id], districtMapOld[id], demographicMap[id], recapture, d.properties);

                  console.log(d.properties);
                  if (d.properties.isISD) {
                    isdCount++;
                    if (d.properties.isPropertyWealthy) {
                      isdWealthyCount++;
                      if (d.properties.recapturePaid > 0) {
                        isdWealthyPaysCount++;
                        totalRecapture += d.properties.recapturePaid;
                        if (d.properties.name === 'Austin ISD') {
                          austinRecapture = d.properties.recapturePaid;
                        }
                      }

                      if (d.properties.taxRate >= 1.17) {
                        maxedOut++;
                        richMaxed++;
                      }
                    } else {
                      totalPoor++;
                      if (d.properties.taxRate >= 1.17) {
                        maxedOut++;
                        poorMaxed++;
                      }
                    }
                  }

                  return d;
                });


                console.log('');
                console.log('');
                console.log('Finished processing data');
                console.log('Finished processing data'.split('').map(() => '-').join(''));
                console.log('');

                console.log('ISD count', isdCount);
                console.log('Wealthy ISD count', isdWealthyCount);
                console.log('Poor ISD count: ', totalPoor);
                console.log('Wealthy ISD Pays Count', isdWealthyPaysCount);
                console.log('% Wealthy', isdWealthyCount / isdCount);
                console.log('% Wealthy that Pay', isdWealthyPaysCount / isdWealthyCount);
                console.log('% Wealthy and Pay', isdWealthyPaysCount / isdCount);

                console.log('');

                console.log('Total Recapture Paid', totalRecapture);
                console.log('Austin Recapture Paid', austinRecapture);
                console.log('Austin % Recapture Paid', austinRecapture / totalRecapture);

                console.log('');

                console.log('Districts paying max taxes: ', maxedOut);
                console.log('Rich districts paying max taxes: ', richMaxed);
                console.log('Poor districts paying max taxes: ', poorMaxed);

                console.log('% rich districts paying max taxes: ', richMaxed / totalPoor);
                console.log('% poor districts paying max taxes: ', poorMaxed / totalPoor);

                fs.writeFileSync(path.join(__dirname, '..', 'data', 'isd-topo-processed.json'), JSON.stringify(topo), 'utf8');

                const yearlyCleaned = Object.keys(yearlyAverages).filter((year) => {
                  return (+year) >= 1995;
                }).sort((a, b) => {
                  return (+a) - (+b);
                }).map((year) => {
                  return Object.assign({ year: year }, yearlyAverages[year]);
                });
                fs.writeFileSync(path.join(__dirname, '..', 'data', 'yearly-averages.json'), JSON.stringify(yearlyCleaned), 'utf8');
              }
            })
          }
        });
      }
    });
  }
})