require('es6-promise').polyfill();
const axios = require('axios');

// Q: Best way to display a group of documents?
//  Examples:
//   - Species Status Assessments
//   - Five Year Reviews
//   - Comprehensive Conservation Plan
//
// Is the answer a Published Report Series?
// How do we limit results by Region?

const SSA_ID = '75903';
const url = `https://ecos.fws.gov/ServCatServices/servcat/v4/rest/Profile/${SSA_ID}?format=json`;
const list = document.querySelector('.card-list');

const createLinkedResource = res =>
  `<li><a href="${res.url}" target="_blank" aria-label="${res.fileName}">Download species status assessment &raquo;</a></li>`;

const createListItem = doc => {
  console.log(doc);
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
  console.log(res.data);
  list.innerHTML = res.data.children.map(createListItem).join('');
};

const handleError = err => {};

axios
  .get(url)
  .then(handleSuccess)
  .catch(handleError);
