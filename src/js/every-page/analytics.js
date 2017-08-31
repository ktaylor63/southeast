const analytics = require('ga-browser')();
const closest = require('closest');

const baseUrl = document.body.getAttribute('data-root');
const nav = document.querySelector('.nav-list');

function pageView() {
  analytics('create', 'UA-20707705-1', 'auto');
  analytics('send', 'pageview', {
    page: window.location.pathname,
    title: document.title
  });
}

function glossaryTerm() {
  // Record each time someone clicks an underlined glossary term
  document.body.addEventListener('click', e => {
    if (e.target.classList.contains('highlight')) {
      analytics('send', 'event', 'Glossary', 'Clicked term', e.target.textContent.toLowerCase());
    }
  });
}

function navItem() {
  // Record each time someone clicks on a navigation button
  nav.addEventListener('click', e => {
    const navButton = closest(e.target, '.nav-link', true);
    if (!navButton) return;

    const navText = navButton.querySelector('.nav-text').textContent;
    analytics('send', 'event', 'Navigation', 'Clicked nav item', navText);
  });
}

function init() {
  if (baseUrl.indexOf('fws.gov/southeast')) {
    pageView();
    glossaryTerm();
    navItem();
  }
}

module.exports.init = init;
