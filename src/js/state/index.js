const xhr = require('xhr');

const stateNode = document.querySelector('.state-name');
const stateName = stateNode ? stateNode.textContent : null;
const abbreviationNode = document.querySelector('.state-abbreviation');
const abbreviationName = abbreviationNode ? abbreviationNode.textContent : null;

const threatenedList = document.querySelector('.threatened-species');
const endangeredList = document.querySelector('.endangered-species');
const atRiskList = document.querySelector('.at-risk-species');

const removeNode = el => {
  el.parentNode.removeChild(el);
};

const listedUrl = `https://ecos.fws.gov/ecp/pullreports/catalog/species/report/species/export?format=json&columns=%2Fspecies%40cn%2Csn%2Cstatus%2Cdesc%2Clisting_date&filter=%2Fspecies%40status_category%20%3D%20'Listed'&filter=%2Fspecies%2Frange_state%40abbrev%20%3D%20'${abbreviationName}'`;
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
  return [`<li> ${species.length} At-Risk Species</li>`, ...speciesList].join(
    ''
  );
};

const createListedSpeciesList = (species, status) => {
  const list = species.map(
    animal => `<li><a href='${animal[1].url}'>${animal[0]} (<em>${
        animal[1].value
      }</em>)</a></li>`
  );
  return [`<li>${species.length} ${status}</li>`, ...list].join('');
};

xhr.get(listedUrl, (err, response, body) => {
  if (err) {
    console.error(err);
    removeNode(threatenedList);
    removeNode(endangeredList);
    return;
  }
  const listed = JSON.parse(body);
  const threatened = listed.data.filter(s => s[2] === 'Threatened');
  const endangered = listed.data.filter(s => s[2] === 'Endangered');

  threatenedList.innerHTML = createListedSpeciesList(
    threatened,
    'Threatened Species'
  );
  endangeredList.innerHTML = createListedSpeciesList(
    endangered,
    'Endangered Species'
  );

  if (!threatened.length) removeNode(threatenedList);
  if (!endangered.length) removeNode(endangeredList);
});

xhr.get(atRiskUrl, (err, response, body) => {
  const species = JSON.parse(body);
  if (err) {
    console.error(err);
    return removeNode(atRiskList);
  }
  if (!species.length) return removeNode(atRiskList);
  atRiskList.innerHTML = createAtRiskList(species);
});
