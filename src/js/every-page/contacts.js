const xhr = require('xhr');

const input = document.querySelector('.contact-list-search');
const output = document.querySelector('.contact-list');

let hasWWW = window.location.href.indexOf('www');
hasWWW = !(hasWWW < 0);
const baseURL = document.body.getAttribute('data-root');
const dataURL = hasWWW ? baseURL : baseURL.replace('www.', '');

let contacts;

function insert(str, index, value) {
  return str.substr(0, index) + value + str.substr(index);
}

function sortByStation(a, b) {
  if (a.station.toLowerCase() > b.station.toLowerCase()) return 1;
  if (a.station.toLowerCase() < b.station.toLowerCase()) return -1;
  return 0;
}

function normalizePhoneNumber(number) {
  let phone = number.replace(/\D/g, '');
  // This pauses for a second to dial an extension
  if (phone.length > 10) phone = insert(phone, 10, 'p');
  return `tel:+1${phone}`;
}

function createContact(person, email, name, phone) {
  const telephone = phone === 'tel+1' ? person.phone : `<a href="${phone}">${person.phone}</a>`;
  return `
    <li class="card card-text-small">
      <ul>
        <li><a href="${email}">${name}</a> ${person.title}</li>
        <li>${person.station}, ${person.state}</li>
        <li>${telephone}</li>
      </ul>
    </li>
  `;
}

function template(persons) {
  console.log(persons);
  return `
    <ul class="card-list contact-list">
    ${persons
    .map(person => {
      const email = `mailto:${person.email}`;
      const phone = normalizePhoneNumber(person.phone);
      const name = person.name ? person.name : person.station;
      return createContact(person, email, name, phone);
    })
    .join('')}
    </ul>
  `;
}

function render(theContacts) {
  const sortedContacts = theContacts.slice(0).sort(sortByStation);
  output.innerHTML = template(sortedContacts);
}

function search(e) {
  const query = e.target.value;
  const regex = new RegExp(query, 'gi');

  if (query.length === 0) render(contacts);

  const filtered = contacts.filter(person => {
    const isType = regex.test(person.type);
    const isState = regex.test(person.state);
    const isName = regex.test(person.name);
    const isTitle = regex.test(person.title);
    const isStation = regex.test(person.station);
    return isType || isState || isName || isTitle || isStation;
  });

  render(filtered);
}

function init() {
  xhr.get(`${dataURL}/data/contacts.js`, (err, res, body) => {
    if (err) console.log(err);
    contacts = JSON.parse(body);
    input.addEventListener('keyup', search);
    render(contacts);
  });
}

module.exports.init = init;
