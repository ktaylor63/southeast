const xhr = require('xhr');

const abbreviation = document.querySelector('.state-abbreviation').textContent;
const state = document.querySelector('.state-name').textContent;
const threatenedList = document.querySelector('.threatened-species');
const endangeredList = document.querySelector('.endangered-species');
const atRiskList = document.querySelector('.at-risk-species');
const listedUrl = `https://finder.royhewitt.com/listed?state=${abbreviation}`;
const atRiskUrl = `https://finder.royhewitt.com//query/custom?status%5B%5D=Candidate&status%5B%5D=Petitioned&status%5B%5D=Proposed+for+Listing+as+Endangered&status%5B%5D=Proposed+for+Listing+as+Endangered+due+to+Similarity+of+Appearance&status%5B%5D=Proposed+for+Listing+as+Threatened&status%5B%5D=Proposed+for+Listing+as+Threatened+due+to+Similarity+of+Appearance&status%5B%5D=Substantial+90-day+Finding&range[]=${state}`;

xhr.get(listedUrl,  (err, response, body) => {
  if (err) console.error(err);
  const listed = JSON.parse(body);
  const src = `https://ecos.fws.gov/tess_public/reports/species-listed-by-state-report?status=listed&state=${abbreviation}`;
  endangeredList.innerHTML = createListedList(listed.endangered, 'Endangered Species');
  threatenedList.innerHTML = createListedList(listed.threatened, 'Threatened Species');
});

xhr.get(atRiskUrl, (err, response, body) => {
  if (err) console.error(err);
  const species = JSON.parse(body);
  atRiskList.innerHTML = createAtRiskList(species);
});

function createAtRiskList (species) {
  const speciesList = species.map(animal => {
    const url = `https://www.fws.gov/southeast/finder/#/species/${animal.id}`;
    return `
      <li>
        <a href=${url} target="_blank">
          ${animal.commonName} <em>${animal.scientificName}</em>
        </a>
      </li>`;
  });
  return [`<li> ${species.length} At-Risk Species</li>`, ...speciesList].join('');
}

function createListedList (species, status) {
  const list = species.map(s => `<li><a href='${s.ecos}'>${s.common}</a></li>`);
  return  [`<li>${species.length} ${status}</li>`, ...list].join('');
}
