(function () {
  'use strict';

  const xhr = require('xhr');
  const qs = require('query-string');

  const templates = {
    results: require('./templates/projects.pug'),
    error: require('./templates/error.pug')
  };
  const baseUrl = 'https://www.sciencebase.gov/catalog/items';
  const query = qs.stringify({
    'q': ['SSPQR', 'FWSR4'],
    'max': 200,
    fields: 'title,summary,purpose,contacts,dates',
    'format': 'json'
  });
  const url = [baseUrl, query].join('?');
  let projects;
  const list = document.querySelector('.card-list');
  const numResults = document.querySelector('.num-results');
  const input = document.getElementById('filter-projects');

  input.addEventListener('change', search);
  input.addEventListener('keyup', search);

  // Download projects on page load
  xhr.get(url, handleResponse);

  function handleResponse(err, res, body) {
    if (err || res.statusCode !== 200) displayError();
    else displayResults(res, body);
  }

  function displayError() {
    list.innerHTML = templates.error();
  }

  function displayResults(res, body) {
    projects = JSON.parse(body);
    render(projects.items);
  }

  function search(e) {
    const q = e.target.value;
    const regex = new RegExp(q, 'gi');
    if (q.length === 0) render(projects.items);
    if (q.length < 3) return;

    const filtered = projects.items.filter(project => {
      const isContact = searchContacts(project.contacts, regex);
      const isPurpose = regex.test(project.purpose);
      const isSummary = regex.test(project.summary);
      const isTitle = regex.test(project.title);
      return isContact || isPurpose || isSummary || isTitle;
    });

    render(filtered);
  }

  function render(filtered = []) {
    numResults.innerHTML = `Showing ${filtered.length} of ${projects.items.length}`;
    list.innerHTML = templates.results({ projects: filtered, extractDates });
  }

  function searchContacts(contacts, regex) {
    if (!contacts) return false;
    return contacts
      .map(contact => contact.name)
      .some(contact => regex.test(contact));
  }

  function extractDates(project) {
    return project.dates
      .filter(date => date.type === 'Start' || date.type === 'End' );
  }

})();
