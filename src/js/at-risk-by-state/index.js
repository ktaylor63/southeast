require('es6-promise').polyfill;
const axios = require('axios');

const stateName = document.querySelector('.state-name').textContent;
const list = document.querySelector('.at-risk-species');

const atRiskUrl = `https://finder.royhewitt.com/query/custom?range%5B%5D=${stateName}&rangeQueryType=any&status%5B%5D=Candidate&status%5B%5D=Lawsuit+to+Challenge+Not+Substantial+90-day+Finding&status%5B%5D=Lawsuit+to+Challenge+Not+Warranted+12-month+Finding&status%5B%5D=Petitioned&status%5B%5D=Proposed+for+Listing+as+Endangered&status%5B%5D=Proposed+for+Listing+as+Endangered+due+to+Similarity+of+Appearance&status%5B%5D=Proposed+for+Listing+as+Threatened&status%5B%5D=Proposed+for+Listing+as+Threatened+due+to+Similarity+of+Appearance&status%5B%5D=Substantial+90-day+Finding&status%5B%5D=Under+Review+by+the+Agency%27s+Own+Discretionary+Action`;

const createAtRiskList = species => {
  const speciesList = species.map(animal => {
    const url = `https://www.fws.gov/southeast/finder/#/species/${animal.id}`;
    return `
      <li>
        <a href=${url} target="_blank">
          ${animal.commonName} (<em>${animal.scientificName}</em>)
        </a>
      </li>`;
  });
  return [
    `<li> ${species.length} At-Risk Species in ${stateName}</li>`,
    ...speciesList
  ].join('');
};

axios
  .get(atRiskUrl)
  .then(res => res.data)
  .then(createAtRiskList)
  .then(listItems => {
    list.innerHTML = listItems;
  });
