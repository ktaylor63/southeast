require('es6-promise').polyfill();
const axios = require('axios');

// How's a Collection different from a Published Report Series
//  => Report Series is a "container" with metadata, can only have related published reports
//  => Collection is a different "container", much more liberal rules

const SSA_ID = '75903';
const url = `https://ecos.fws.gov/ServCatServices/servcat/v4/rest/Profile/${SSA_ID}`;
const list = document.querySelector('.card-list');

const isNewestVersion = doc => !doc.newestVersion;

// Orgcode: Third and fourth digit together represent the region
// We only want documents pertinent to Region 4
const isSoutheasternDocument = orgcode => {
  const region = orgcode.slice(2, 4);
  return region === '04';
};

// Filter out documents that apply only to other regions
// If one or more of the 'units' occurr in R4 keep the document
const filterSoutheasternDocuments = docs => docs.filter(doc => doc.units.filter(isSoutheasternDocument).length);
const isPublic = doc => doc.fileAccess === 'Public';

const createLinkedResource = res => `<li><a href="${res.url}" target="_blank" aria-label="${
  res.fileName
}">Download species status assessment &raquo;</a></li>`;

const createListItem = doc => {
  if (doc.referenceType === 'Published Report Series') return '';
  return `
    <li class="card card-text">
      <h2>${doc.title}</h2>
      <ul>
        ${doc.linkedResources.map(createLinkedResource).join('')}
      </ul>
    </li>
  `;
};

const handleSuccess = res => {
  const docs = filterSoutheasternDocuments(res.data.children)
    .filter(isNewestVersion)
    .filter(isPublic);
  list.innerHTML = docs.map(createListItem).join('');
};

axios
  .get(url)
  .then(handleSuccess)
  .catch(console.log);
