const path = require('path');
const Papa = require('papaparse');
const fs = require('fs');
const fileContents = fs.readFileSync(path.join(__dirname, '..', 'data', 'isd-prerelease-all-funds.csv'), 'utf8');
const yearGroups = {};

const parseMoney = (s) => {
  return Number(s.replace(/[^0-9\.-]+/g,""));
}

Papa.parse(fileContents, {
  delimiter: ',',
  header: true,
	complete: function(results) {
    results.data.forEach((r) => {
      if (!yearGroups[r.Year]) {
        yearGroups[r.Year] = [];
      }
      yearGroups[r.Year].push({
        year: r.Year,
        id: r['State ID (CDN)'],
        name: r['District Name'],
        county: r.County,
        enrollment: +r['Reported Enrollment'],
        ada: +r['Average Daily Attendance (ADA)'],
        revenue: parseMoney(r['Total Revenue']),
        localRevenue: parseMoney(r['Local Tax Revenue']),
        stateRevenue: parseMoney(r['State Revenue']),
        federalRevenue: parseMoney(r['Federal Revenue']),
        recapture: parseMoney(r['Recapture']),
        propertyValue: parseMoney(r['Property Value'])
      })
    })
    fs.writeFileSync(path.join(__dirname, '..', 'data', 'districts-by-year.json'), JSON.stringify(yearGroups), 'utf8');
	}
});