const xhr = require('xhr');
const qs = require('query-string');
const random = require('random-item');

const output = document.querySelector('.featured-project');
const baseURL = 'https://www.sciencebase.gov/catalog/items';

const params = qs.stringify({
  format: 'json',
  tags: 'SSPQR',
  max: 20,
  fields: 'title,spatial,body,summary,previewImage,purpose'
});

function template(project) {
  console.log(project);
  const figure = project.previewImage.original
    ? `<figure class="photo-right"><img src="${project.previewImage.original
      .viewUri}" alt="Preview image for project"/>`
    : '';
  return `
    <h4><a href="${project.link.url}" target="_blank">${project.title}</a></h4>
    ${figure}
    <p>${project.body}</p>
  `;
}

// Join the BaseURL with query string
const url = [baseURL, params].join('?');
function handleResponse(err, res, body) {
  if (err) console.log(err);
  const data = JSON.parse(body);
  const project = random(data.items);
  output.innerHTML = template(project);
}

xhr.get(url, handleResponse);
