const jsonp = require('jsonp');
const date = require('date-and-time');

const list = document.querySelector('.register-list');
const more = document.getElementById('load-more-fr-docs');
const url = 'https://www.federalregister.gov/api/v1/articles.json?per_page=20&order=newest&conditions%5Bagencies%5D%5B%5D=fish-and-wildlife-service&conditions%5Bdocket_id%5D=fws-r4';
let moreUrl;

more.addEventListener('click', () => searchRegister(moreUrl));

function searchRegister(url) {
  const options = {
    "prefix": "foo"
  };

  jsonp(url, options, (err, data) => {
    if (err) console.log(err);
    appendResults(data.results);
    moreUrl = data.next_page_url;
  });
}

function appendResults(results) {
  list.insertAdjacentHTML('beforeend', template(results));
}

function template(results) {
  return results.map(r => {
    const formattedDate = date.format(new Date(r.publication_date), 'MMMM D, YYYY');
    return `
      <li class="card card-text">
        <h3><a href="${r.html_url}" target="_blank">${r.title}</a></h3>
        <p><strong>${formattedDate}</strong></p>
        <p>${r.abstract}</p>
        <p><a href=${r.pdf_url} target="_blank">Download PDF</a></p>
      </li>
    `
  }).join('');
}

searchRegister(url);
