const xhr = require('xhr');

const template = require('./contact.pug');
const url = '../data/contacts.js';

const input = document.querySelector('.contact-list-search');
const output = document.querySelector('.contact-list');

let contacts;

input.addEventListener('keyup', search);

function init() {
  xhr.get(url, (err, res, body) => {
    if (err) console.log(err);
    contacts = JSON.parse(body);
    render(contacts);
  });
}

function search(e) {
  var query = e.target.value;
  var regex = new RegExp(query, 'gi');

  if (query.length === 0) render(contacts);

  const filtered = contacts.filter(person => {
    const isType = regex.test(person.type);
    const isState = regex.test(person.state);
    const isName = regex.test(person.name);
    const isTitle = regex.test(person.title);
    const isStation = regex.test(person.station);
    return (isType || isState || isName || isTitle || isStation);
  });

  render(filtered);
}

function render(contacts) {
  const sortedContacts = contacts.slice(0).sort(sortByStation);
  output.innerHTML = template({ contacts: sortedContacts, getPhone: normalizePhoneNumber });
}

function normalizePhoneNumber(number) {
  var phone = number.replace(/\D/g,'');
  // This pauses for a second to dial an extension
  if (phone.length > 10) phone = insert(phone, 10, 'p');
  return 'tel:+1' + phone;
}

function insert(str, index, value) {
  return str.substr(0, index) + value + str.substr(index);
}

function sortByName(a,b) {
  const aName = (a.name) ? a.name : a.station;
  const bName = (b.name) ? b.name : b.station;
  if (aName.toLowerCase() > bName.toLowerCase()) return 1;
  if (aName.toLowerCase() < bName.toLowerCase()) return -1;
  return 0;
}

function sortByStation(a,b) {
  if (a.station.toLowerCase() > b.station.toLowerCase()) return 1;
  if (a.station.toLowerCase() < b.station.toLowerCase()) return -1;
  return 0;
}

module.exports.init = init;
