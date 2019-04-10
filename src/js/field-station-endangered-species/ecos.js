const templates = require('./templates');

const sortByListedStatus = (a, b) => a[2].localeCompare(b[2]);

const getListedSpeciesByState = state => fetch(
    `https://ecos.fws.gov/ecp/pullreports/catalog/species/report/species/export?format=json&columns=%2Fspecies%40cn%2Csn%2Cstatus%2Clisting_date&filter=%2Fspecies%2Frange_state%40name%20%3D%20'${state}'&filter=%2Fspecies%40status%20in%20('Endangered'%2C'Threatened')`
  )
    .then(res => res.json())
    .then(data => data.data)
    .then(data => data.sort(sortByListedStatus))
    .then(data => data.map(templates.listedSpecies).join(''));

module.exports = {
  getListedSpeciesByState
};
