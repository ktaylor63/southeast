const xhr = require('xhr');
const qs = require('query-string');
const random = require('random-item');

const template = require('./project.jade');

const output = document.querySelector('.featured-project');
const baseURL = 'https://www.sciencebase.gov/catalog/items';

const params = qs.stringify({
  format: 'json',
  tags: 'SSPQR',
  max: 20,
  fields: 'title,spatial,body,summary,previewImage,purpose'
});

// Join the BaseURL with query string
const url = [baseURL, params].join('?');

xhr.get(url, handleResponse);

function handleResponse(err, res, body) {
  if (err) console.log(err);
  const data = JSON.parse(body);
  const project = random(data.items);
  output.innerHTML = template({ project: project });
}

// function template(project) {
//   let img = '';
//   if (project.previewImage.original) {
//     img = `
//       <figure class="photo-right">
//         <img src=${project.previewImage.original.viewUri} alt="Preview image for this project" />
//       </figure>
//     `
//   }
//   return `
//     <h4><a href="${project.link.url}" target="_blank">${project.title}</a></h4>
//     ${img}
//     <p>${project.body}</p>
//   `;
//
// }
