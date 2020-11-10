const templates = require('./templates');
const list = document.querySelector('.card-list');
const sciName = document.querySelector('.scientific-name').textContent;
const animal = encodeURIComponent(sciName.replace('(', '').replace(')', ''));
const url = `https://www.federalregister.gov/api/v1/documents.json?per_page=1000&order=relevance&conditions%5Bterm%5D=${animal}&conditions%5Bagencies%5D%5B%5D=fish-and-wildlife-service`;

fetch(url)
  .then(res => res.json())
  .then(data => {
    if (data.count === 0) list.innerHTML = templates.noResults({ name: sciName });
    else if (data.count > 0) list.innerHTML = templates.results({ results: data.results });
  })
  .catch(err => {
    console.log(err);
    list.innerHTML = templates.error();
  })