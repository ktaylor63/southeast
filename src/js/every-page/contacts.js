const xhr = require('xhr');

const template = require('./contact.pug');

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

function normalizePhoneNumber(number) {
  let phone = number.replace(/\D/g, '');
  // This pauses for a second to dial an extension
  if (phone.length > 10) phone = insert(phone, 10, 'p');
  return `tel:+1${phone}`;
}

function sortByStation(a, b) {
  if (a.station.toLowerCase() > b.station.toLowerCase()) return 1;
  if (a.station.toLowerCase() < b.station.toLowerCase()) return -1;
  return 0;
}

function render(theContacts) {
  const sortedContacts = theContacts.slice(0).sort(sortByStation);
  output.innerHTML = template({ contacts: sortedContacts, getPhone: normalizePhoneNumber });
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
