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
      analytics(
        'send',
        'event',
        'Glossary',
        'Clicked term',
        e.target.textContent.toLowerCase()
      );
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

function relatedContent() {
  // Record each time someone clicks on a related content link
  const related = document.querySelector('.related-content');
  if (!related) return;
  related.addEventListener('click', e => {
    if (e.target && e.target.nodeName === 'A') {
      const linkText = e.target.textContent;
      analytics(
        'send',
        'event',
        'Related Content',
        'Clicked related content',
        linkText
      );
    }
  });
}

function partnerContent() {
  const partnerContentLinks = [].slice.call(
    document.querySelectorAll('.partner-content a')
  );
  if (!partnerContentLinks) return;
  partnerContentLinks.forEach(link => {
    link.addEventListener('click', e => {
      const linkText = e.target.textContent;
      analytics(
        'send',
        'event',
        'Partner Content',
        'Clicked partner link',
        linkText
      );
    });
  });
}

function init() {
  if (baseUrl.indexOf('fws.gov/southeast')) {
    pageView();
    glossaryTerm();
    navItem();
    relatedContent();
    partnerContent();
  }
}

module.exports.init = init;
