const ecos = require('./ecos');
// const atRisk = require('./at-risk');
const ListedSpeciesByCounty = require('./ListedSpeciesByCounty');

const listedSpeciesList = document.querySelector('.listed-species');
const atRiskList = document.querySelector('.at-risk-species');
const stateAbbrev = document.querySelector('.state-abbreviation').textContent;
const stateSelect = document.querySelector('#state-select-input');

new ListedSpeciesByCounty({
  state: stateAbbrev,
  form: document.querySelector('.listed-species-by-county-search'),
  list: document.querySelector('.listed-species-by-county-results-list')
});

ecos.getListedSpeciesByState('North Carolina').then(html => {
  listedSpeciesList.innerHTML = html;
});

// atRisk.getAtRiskSpeciesByState('North Carolina').then(html => {
//   atRiskList.innerHTML = html;
// });
