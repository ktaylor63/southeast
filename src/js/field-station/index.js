const xhr = require('xhr');

const contactList = document.querySelector('.contact-list');
const contactStats = document.querySelector('.contact-stats');
const officeName = contactList.getAttribute('data-office');
const input = document.querySelector('.contact-input');
let totalContacts = '';

let hasWWW = window.location.href.indexOf('www');
hasWWW = hasWWW < 0;
const baseURL = document.body.getAttribute('data-root');
const dataURL = hasWWW ? baseURL : baseURL.replace('www.', '');

let contacts;

const worksAtStation = contact => contact.station === officeName || contact.reportToStation === officeName;

const createContact = contact => `
  <li class="card card-text">
    <p><a href="mailto:${contact.email}">${contact.name}</a>,
    ${contact.title}</p>
    <p>Phone: ${contact.phone}<br>Email: <a href="mailto:${contact.email}">
    ${contact.email}</a></p>
  </li>
`;

const search = e => {
  const query = e.target.value;
  const regex = new RegExp(query, 'gi');
  if (query.length === 0) render(contacts);

  const filtered = contacts.filter(contact => {
    const isName = regex.test(contact.name);
    const isTitle = regex.test(contact.title);
    return isName || isTitle;
  });

  render(filtered);
};

const render = contacts => {
  contactStats.innerHTML = `Showing ${contacts.length} of ${totalContacts}`;
  if (contacts.length === 0) {
    contactList.innerHTML =      '<li class="card card-text"><h3>Your query did not match any contacts.</h3></li>';
    return;
  }
  contactList.innerHTML = contacts.map(createContact).join('');
};

xhr.get(`${dataURL}data/contacts.js`, (err, res, body) => {
  if (err) console.log(err);

  contacts = JSON.parse(body).filter(worksAtStation);
  totalContacts = contacts.length;
  render(contacts);
  input.addEventListener('input', search);
});
