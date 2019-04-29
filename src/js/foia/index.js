const axios = require('axios');

const select = document.querySelector('#saved-searches');
const searchInput = document.querySelector('input[type=search]');
const list = document.querySelector('.results');

let data;

const createDownloadLink = resource => `<a href="${resource.url.replace('http:', 'https:')}">Download</a>`;

const createResult = result => `
  <li class="card card-text">
    <h3>${result.title}</h3>
    <p><strong>Citation:</strong> ${result.citation}</p>
    <p>
      <a href="https://ecos.fws.gov/ServCat/Reference/Profile/${
  result.referenceId
}">
        View document on ServCat
      </a><br><br>
      ${result.linkedResources.map(createDownloadLink).join('')}
    </p>
  </li>
`;

const render = results => {
  list.innerHTML = results.map(createResult).join('');
};

const search = query => {
  const regex = new RegExp(query, 'gi');

  if (query.length === 0) return data;

  return data.filter(doc => {
    const isTitle = regex.test(doc.title);
    const isCitation = regex.test(doc.citation);
    return isTitle || isCitation;
  });
};

const cacheResults = results => {
  // Filter out any non-public documents
  data = results.filter(doc => doc.fileAccess === 'Public');
  return data;
};

const getSavedSearch = id => axios
    .get(
      `https://ecos.fws.gov/ServCatServices/servcat/v4/rest/SavedSearch/Composite/${id}`
    )
    .then(res => res.data.items)
    .then(cacheResults)
    .then(render)
    .catch(console.log);

const savedSearchHandler = e => {
  searchInput.value = '';
  getSavedSearch(e.target.value);
};

const searchHandler = e => {
  const results = search(e.target.value);
  render(results);
};

select.addEventListener('input', savedSearchHandler);
select.addEventListener('change', savedSearchHandler);
searchInput.addEventListener('input', searchHandler);
searchInput.addEventListener('change', searchHandler);

// Initialize app
getSavedSearch(select.value);
