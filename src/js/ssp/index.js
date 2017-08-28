const xhr = require('xhr');
const qs = require('query-string');
const random = require('random-item');

const template = require('./project.jade');

const output = document.querySelector('.featured-project');
const baseURL = 'https://cors-anywhere.herokuapp.com/https://www.sciencebase.gov/catalog/items';

const params = qs.stringify({
  format: 'json',
  tags: 'SSPQR',
  max: 20,
  fields: 'title,spatial,body,summary,previewImage,purpose'
});

// Join the BaseURL with query string
const url = [baseURL, params].join('?');

function handleResponse(err, res, body) {
  if (err) console.log(err);
  const data = JSON.parse(body);
  const project = random(data.items);
  output.innerHTML = template({ project });
}

xhr.get(url, handleResponse);
