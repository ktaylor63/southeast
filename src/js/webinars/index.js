const xhr = require('xhr');
const isUrl = require('is-url-superb');
const moment = require('moment');

const template = require('./webinars.pug');

let hasWWW = window.location.href.indexOf('www');
hasWWW = (hasWWW < 0) ? false : true;
const baseURL = document.body.getAttribute('data-root');
const dataURL = hasWWW ? baseURL : baseURL.replace('www.', '');

const webinarList = document.querySelector('.webinar-list');
const pastWebinarList = document.querySelector('.past-webinars');
const input = document.querySelector('.webinar-search');
const list = document.querySelector('.webinar-list');

let webinars;

xhr.get(`${dataURL}data/webinars.js`, (err, res, body) => {
  if (err) console.log(err);
  webinars = JSON.parse(body).sort(sortByDate);
  const pastWebinars = webinars
    .filter(pastEvents)
    .sort(sortByDate)
    .reverse();

  const upcomingWebinars = webinars
    .filter(futureEvents)
    .sort(sortByDate)

  render(upcomingWebinars, webinarList)
  render(pastWebinars, pastWebinarList)

  input.addEventListener('input', search);
  webinarList.addEventListener('click', toggleAbstract);
  pastWebinarList.addEventListener('click', toggleAbstract);
});

function search(e) {
  const query = e.target.value;
  const regex = new RegExp(query, 'gi');

  if (query.length === 0) {
    render(webinars.filter(futureEvents), webinarList);
    render(webinars.filter(pastEvents).reverse(), pastWebinarList);
  }

  const filtered =  webinars.filter( webinar => {
    var isTitle = regex.test(webinar.title);
    var isAbstract = regex.test(webinar.abstract);
    var isPresenter = regex.test(webinar.presenters);
    return (isTitle || isAbstract || isPresenter);
  });

  const filteredPast = filtered.filter(pastEvents).reverse();

  render(filtered.filter(futureEvents), webinarList);
  render(filteredPast, pastWebinarList);
}

function sortByDate (a,b) {
  return new Date(a.date) - new Date(b.date);
}

function futureEvents(event) {
  return moment().isBefore(moment(event.date).add(1, 'days'));
}

function pastEvents(event) {
  return moment().isAfter(moment(event.date));
}

function render(webinars, target) {
  if (webinars.length) {
    target.innerHTML = template({
      webinars: webinars,
      isUrl: isUrl,
      moment: moment,
      baseUrl: baseURL
    });
  } else {
    target.innerHTML = `
      <li class="card card-text"><h3>No webinars match your query.</h3></li>
    `;
  }
}

function showAbstract (abstract) {
  const heading = abstract.querySelector('.abstract-heading');
  heading.innerHTML = 'Hide Abstract';
  abstract.addEventListener('click', toggleAbstract);
  abstract.classList.remove('abstract-hidden');
  abstract.classList.add('abstract-visible');
}

function hideAbstract (abstract) {
  const heading = abstract.querySelector('.abstract-heading');
  heading.innerHTML = 'Show Abstract';
  abstract.removeEventListener('click', toggleAbstract);
  abstract.classList.add('abstract-hidden');
  abstract.classList.remove('abstract-visible');
}

function toggleAbstract (e) {
  e.stopPropagation();
  const abstract = e.target.parentNode;

  if ( abstract.classList.contains('abstract-hidden') ) showAbstract(abstract);
  else hideAbstract(abstract);
}
