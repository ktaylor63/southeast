const jsonp = require('jsonp');
const qs = require('query-string');
const moment = require('moment');

const baseUrl = 'https://www.sciencebase.gov/catalog/items';
const query = qs.stringify({
  q: ['SSPQR', 'FWSR4'],
  max: 200,
  fields: 'title,summary,purpose,contacts,dates',
  format: 'jsonp'
});

const url = [baseUrl, query].join('?');
const list = document.querySelector('.card-list');
const numResults = document.querySelector('.num-results');
const input = document.getElementById('filter-projects');
let projects;

function displayError() {
  return `
    <li style="text-align: center;">
      <h2>We&rsquo;re sorry but an error ocurred.</h2>
      <p>Try visiting <a href='https://www.sciencebase.gov/catalog/items?q=SSPQR%20FWSR4' target="_blank">ScienceBase.gov</a> directly for a full list of SSP Projects.</p>
    </li>
  `;
}

function extractDates(project) {
  return project.dates.filter(date => date.type === 'Start' || date.type === 'End');
}

function createContactList(contacts, title, id) {
  return `
    <ul>
      ${contacts
      .map(contact => {
        const type = contact.type ? `${contact.type}: ` : '';
        const html = contact.email
          ? `<li><strong>${type}</strong> <a href="mailto:${contact.email}?subject=${title}" aria-labelledby="project-${id}">${contact.name}</a>`
          : `<li><strong>${type} ${contact.name}</strong></li>`;
        return html;
      })
      .join('')}
    </ul>
  `;
}

function showResults(projects) {
  return projects
    .map((project, i) => {
      const dates = project.dates ? extractDates(project) : [];
      const purpose = project.purpose ? `<p><strong>Purpose:</strong> ${project.purpose}</p>` : '';
      const summary = project.summary ? `<p><strong>Summary:</strong> ${project.summary}</p>` : '';
      const contacts = project.contacts
        ? `<p><strong>Contacts:</strong> ${createContactList(
          project.contacts,
          project.title,
          i
        )}</p>`
        : '';
      return `
      <li class='card card-text'>
        <h2 class='card-list-heading' id="project-${i}"><a href='${project.link
          .url}'>${project.title}</a></h2>
          ${dates
          .map(date => {
            const dateString = moment(date.dateString).format('MMMM Do, YYYY');
            return `<p><span><strong>${date.label}</strong>: ${dateString}</span></p>`;
          })
          .join('')}
        ${purpose}
        ${summary}
        ${contacts}
    </li>
    `;
    })
    .join('');
}

function searchContacts(contacts, regex) {
  if (!contacts) return false;
  return contacts.map(contact => contact.name).some(contact => regex.test(contact));
}

function render(filtered = []) {
  numResults.innerHTML = `Showing ${filtered.length} of ${projects.items.length}`;
  list.innerHTML = showResults(filtered);
}

function search(e) {
  const q = e.target.value;
  const regex = new RegExp(q, 'gi');
  if (q.length === 0) render(projects.items);
  if (q.length < 3) return;

  const filtered = projects.items.filter(project => {
    const isContact = searchContacts(project.contacts, regex);
    const isPurpose = regex.test(project.purpose);
    const isSummary = regex.test(project.summary);
    const isTitle = regex.test(project.title);
    return isContact || isPurpose || isSummary || isTitle;
  });

  render(filtered);
}

function handleResponse(err, data) {
  if (err) return displayError();
  input.addEventListener('keyup', search);
  input.addEventListener('change', search);
  projects = data;
  return render(projects.items);
}

// Download projects on page load
jsonp(url, handleResponse);