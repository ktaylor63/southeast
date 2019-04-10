const templates = require('./templates');

const getAtRiskSpeciesByState = state => {
  const atRiskUrl = `https://finder.royhewitt.com/query/custom?range%5B%5D=${state}&rangeQueryType=any&status%5B%5D=Candidate&status%5B%5D=Lawsuit+to+Challenge+Not+Substantial+90-day+Finding&status%5B%5D=Lawsuit+to+Challenge+Not+Warranted+12-month+Finding&status%5B%5D=Petitioned&status%5B%5D=Proposed+for+Listing+as+Endangered&status%5B%5D=Proposed+for+Listing+as+Endangered+due+to+Similarity+of+Appearance&status%5B%5D=Proposed+for+Listing+as+Threatened&status%5B%5D=Proposed+for+Listing+as+Threatened+due+to+Similarity+of+Appearance&status%5B%5D=Substantial+90-day+Finding&status%5B%5D=Under+Review+by+the+Agency%27s+Own+Discretionary+Action`;

  return fetch(atRiskUrl)
    .then(res => res.json())
    .then(data => data.map(templates.atRiskSpecies).join(''));
};

module.exports = {
  getAtRiskSpeciesByState
};
