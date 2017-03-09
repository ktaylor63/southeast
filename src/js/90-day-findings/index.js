const parallel = require('async/parallel');
const xhr = require('xhr');

const petitionedQuery = 'status%5B%5D=Petitioned';
const withdrawnQuery = 'status%5B%5D=Petition+Withdrawn';

parallel({
  petitioned: getData.bind(null, petitionedQuery),
  withdrawn: getData.bind(null, withdrawnQuery)
}, displayResults);

function displayResults(err, results) {
  if (err) return displayError();
  const petitionedList = document.querySelector('.current-petitions');
  const withdrawnList = document.querySelector('.withdrawn-petitions');

  withdrawnList.innerHTML = speciesToList(results.withdrawn);
  petitionedList.innerHTML = speciesToList(results.petitioned);
}

function speciesToList(arr) {
  return arr
    .sort(sortByName)
    .map(createListItem)
    .join('');
}

function createListItem(species) {
  const url = `https://www.fws.gov/southeast/candidateconservation/finder2/#/species/${species.id}`;
  return `<li><a href="${url}" target="_blank">${species.commonName} (<em>${species.scientificName}</em>)</a></li>`;
}

function displayError() {
  document.querySelector('.current-petitions').innerHTML = errorMessage();
  document.querySelector('.withdrawn-petitions').innerHTML = errorMessage();
}

function errorMessage() {
  return `<li>Could not download petition data. <a href="mailto:roy_hewitt@fws.gov">Contact the webmaster.</a></li>`;
}

function getData(query, cb) {
  const url = ['https://finder.royhewitt.com/query/custom', query].join('?');

  xhr.get(url, (err, res, body) => {
    if (err) return cb(err);
    if (res.statusCode >= 400) return cb(new Error(`An error occurred with status code: ${res.statusCode}`));
    return cb(null, JSON.parse(body));
  });
}

function sortByName(a,b) {
  const aName = a.commonName.toLowerCase();
  const bName = b.commonName.toLowerCase();
  return (aName < bName) ? -1 : (aName > bName) ? 1 : 0;
}
