const xhr = require('xhr');

const contactList = document.querySelector('.contact-list');
const contactStats = document.querySelector('.contact-stats');
const officeName = contactList.getAttribute('data-office');
const input = document.querySelector('.contact-input');
let totalContacts = '';

const hasWWW = window.location.href.indexOf('www');
const baseURL =  document.body.getAttribute('data-root') || 'http://localhost:3000/';
const dataURL = hasWWW > 0 ? baseURL : baseURL.replace('www.', '');

let contacts;

const worksAtStation = contact => contact.station === officeName || contact.reportToStation === officeName;

const createContact = c => {
  const name = c.email ? `<a href="mailto:${c.email}">${c.name}</a>` : c.name;
  const title = c.title ? `, ${c.title}` : '';
  const phone = c.phone ? `Phone: ${c.phone}` : '';
  const email = c.email
    ? `Email: <a href="mailto:${c.email}">${c.email}</a>`
    : '';
  return `
    <li class="card card-text">
      <p>${name}${title}</p>
      <p>${phone}${phone !== '' && email !== '' ? '<br>' : ''}${email}</p>
    </li>
  `;
};

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
