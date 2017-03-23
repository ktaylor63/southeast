require('classlist-polyfill');
require('window.requestanimationframe')

const xhr = require('xhr');
const Parallax = require('parallax-scroll');
const Marker = require('./mark');
const menu = require('fws-navigation');
const nav = require('fws-scrollnav');
const glossary = require('fws-glossary');
const contacts = require('./contacts');
const shortList = require('./short-list');

const marker = new Marker(document.querySelector('#content'));
const parallax = new Parallax('.parallax', { speed: 0.5 });

const content = document.getElementById('content');
const baseUrl = document.body.getAttribute('data-root');
const contactLinks = Array.from(document.querySelectorAll('.toggle-contact'));
const hideScrollnav = document.querySelector('.hide-scrollnav');
const sectionNav = document.querySelector('.section-nav');
const h2s = content.querySelectorAll('h2');
let contactsDownloaded = false;
let scrollNav;
let terms;

parallax.animate();

shortList.init({
  elements: document.querySelectorAll('.fade-list')
});

const lunrIndex = function() {
  this.field('name', { boost: 10 });
  this.field('description');
  this.field('related', { boost: 5 });
  this.field('acronym', { boost: 3 });
  this.ref('id');
};

// Initialize the scrollnav if there are H2s in the content, and if we didn't
// disable the scrollnav in the content file's frontmatter
if (content && h2s.length > 0 && !hideScrollnav) {
  nav.init({
    content: content,
    insertTarget: document.querySelector('.side-nav'),
    showHeadline: false,
    scrollOffset: 55
  });
  scrollNav = document.querySelector('.scroll-nav');
  scrollNav.addEventListener('click', toggleScrollNav);
} else {
  // if there scroll nav isn't initialized, center the content on the page.
  const mainContent = content.querySelector('.main');
  const pageTitle = content.querySelector('.page-title');
  if (mainContent) {
    mainContent.classList.remove('main');
    mainContent.classList.add('content-centered');
    pageTitle.classList.remove('page-title');
  }
}

menu.init({
  toggleClass: 'fws-menu-trigger',
  position: 'left'
});

xhr.get(`${baseUrl}data/terms.js`, (err, res, body) => {
  if (err) console.error(err);
  terms = JSON.parse(body);
  // Highlight words and their acronyms
  const words = terms.map(term => term.name);
  const acronyms = terms
    .filter(term => term.acronym)
    .map(term => term.acronym);

  marker.mark([...words, ...acronyms], {
    element: 'span',
    className: 'highlight',
    exclude: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a'],
    accuracy: 'exactly',
    separateWordSearch: false,
    filter: (node, term, i) => {
      // Only highlight the first n occurrences
      if (i > 2) return false;
      else return true;
    }
  });

  glossary.init({
    terms: terms,
    lunrIndex: lunrIndex,
    toggleClass: 'highlight',
    position: 'left'
  });

  document.querySelector('.glossary-trigger').addEventListener('click', glossary.toggle);
  const anchors = Array.from(document.querySelectorAll('a'));

  // Open all links that go somewhere other than our site in a new tab
  anchors.forEach(anchor => {
    if ( anchor.href.indexOf(baseUrl) === -1 ) anchor.setAttribute('target', '_blank');
  });
});

contactLinks.forEach(link => {
  link.addEventListener('click', () => {
    if (!contactsDownloaded) {
      contacts.init();
      contactsDownloaded = true;
    }
    toggleActiveClass(document.querySelector('.contact-drawer'));
  });
});

document.querySelector('.fws-menu-trigger').addEventListener('click', menu.show);
document.getElementById('search-trigger').addEventListener('click', menu.toggleSearch);
document.querySelector('.toggle-share').addEventListener('click', () => {
  toggleActiveClass(document.querySelector('.share-drawer'));
});

// Select all of the url when the user clicks the share url input
document.querySelector('.share-drawer input').addEventListener('focus', function() {
  this.setSelectionRange(0, this.value.length)
});

const drawerToggles = Array.from(document.querySelectorAll('.close-drawer'));
document.body.addEventListener('keyup', keyupHandler);

drawerToggles.forEach(drawer => { drawer.addEventListener('click', removeActiveClassFromDrawer); });

function removeActiveClassFromDrawer (e) {
  const parent = (e.target) ? e.target.parentNode : e.parentNode;
  if (parent) parent.classList.remove('active');
}

function keyupHandler(e) {
  const key = e.code || e.which || e.keyCode || 0;
  if (key !== 27) return;
  const drawers = [
    document.querySelector('.contact-drawer'),
    document.querySelector('.share-drawer'),
    document.querySelector('.info-window')
  ];

  drawers.forEach(drawer => {
    if (!drawer) return;
    const button = drawer.querySelector('.close-drawer');
    if ( drawer.classList.contains('active') ) removeActiveClassFromDrawer(button);
  });
}

function toggleScrollNav() {
  if ( scrollNav.classList.contains('open') ) scrollNav.classList.remove('open');
  else scrollNav.classList.add('open');
}

function toggleActiveClass(el, theClass) {
  const activeClass = theClass || 'active';
  if ( el.classList.contains(activeClass) ) el.classList.remove(activeClass);
  else el.classList.add(activeClass);
}

// Supports dropdown menus in the section navigation
if (sectionNav) {
  const sectionDropdowns = Array.from(sectionNav.querySelectorAll('.dropdown-item'));

  sectionDropdowns.forEach(dropdown => {
    dropdown.addEventListener('click', (e) => {
      const childList = e.target.parentNode.querySelector('ul');
      childList.classList.toggle('hidden');
    });
  });
}
