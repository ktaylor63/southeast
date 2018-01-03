require('classlist-polyfill');
require('window.requestanimationframe');
// Element.matches() polyfill
if (!Element.prototype.matches) {
  Element.prototype.matches =
    Element.prototype.matchesSelector ||
    Element.prototype.mozMatchesSelector ||
    Element.prototype.msMatchesSelector ||
    Element.prototype.oMatchesSelector ||
    Element.prototype.webkitMatchesSelector ||
    function elMatches(s) {
      const matches = (this.document || this.ownerDocument).querySelectorAll(s);
      let i = matches.length;
      while (--i >= 0 && matches.item(i) !== this) {}
      return i > -1;
    };
}

const xhr = require('xhr');
const Parallax = require('parallax-scroll');
const Marker = require('mark.js');
const menu = require('fws-navigation');
const nav = require('fws-scrollnav');
const glossary = require('fws-glossary');
const contacts = require('./contacts');
const shortList = require('./short-list');
const search = require('./search');
const analytics = require('./analytics');

const marker = new Marker(document.querySelector('#content'));
const parallax = new Parallax('.parallax', { speed: 0.5 });

let hasWWW = window.location.href.indexOf('www');
hasWWW = !(hasWWW < 0);
const baseURL = document.body.getAttribute('data-root');
const dataURL = hasWWW ? baseURL : baseURL.replace('www.', '');

const content = document.getElementById('content');
const contactLinks = Array.from(document.querySelectorAll('.toggle-contact'));
const hideScrollnav = document.querySelector('.hide-scrollnav');
const sectionNav = document.querySelector('.section-nav');
const h2s = content ? content.querySelectorAll('h2') : null;
let contactsDownloaded = false;
let terms;

parallax.animate();
analytics.init();
shortList.init({
  elements: document.querySelectorAll('.fade-list')
});

const lunrIndex = function seedIndex() {
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
    content: document.querySelector('main'),
    insertTarget: document.querySelector('.side-nav'),
    showHeadline: false,
    scrollOffset: 55
  });
} else if (content) {
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

xhr.get(`${dataURL}data/terms.js`, (err, res, body) => {
  if (err) console.error(err);
  terms = JSON.parse(body);
  // Highlight words and their acronyms
  const words = terms.map(term => term.name);
  const acronyms = terms.filter(term => term.acronym).map(term => term.acronym);

  marker.mark([...words, ...acronyms], {
    element: 'span',
    className: 'highlight',
    exclude: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a'],
    accuracy: 'exactly',
    separateWordSearch: false,
    filter: (node, term, i) => {
      // Only highlight the first n occurrences
      if (i > 2) return false;
      return true;
    }
  });

  glossary.init({
    terms,
    lunrIndex,
    toggleClass: 'highlight',
    position: 'left'
  });

  document.querySelector('.glossary-trigger').addEventListener('click', glossary.toggle);
  const anchors = Array.from(document.querySelectorAll('a'));

  // Open all links that go somewhere other than our site in a new tab
  anchors.forEach(anchor => {
    if (anchor.href.indexOf(document.body.getAttribute('data-root')) === -1) {
      anchor.setAttribute('target', '_blank');
      anchor.setAttribute('rel', 'noopener');
    }
  });
});

// Select all of the url when the user clicks the share url input
document.querySelector('.share-drawer input').addEventListener('focus', function selectInputText() {
  this.setSelectionRange(0, this.value.length);
});

function removeActiveClassFromDrawer(e) {
  const parent = e.target ? e.target.parentNode : e.parentNode;
  if (parent) parent.classList.remove('active');
}

const drawerToggles = Array.from(document.querySelectorAll('.close-drawer'));

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
    if (drawer.classList.contains('active')) removeActiveClassFromDrawer(button);
  });
}

document.body.addEventListener('keyup', keyupHandler);

drawerToggles.forEach(drawer => {
  drawer.addEventListener('click', removeActiveClassFromDrawer);
});

function toggleActiveClass(el, theClass) {
  const activeClass = theClass || 'active';
  if (el.classList.contains(activeClass)) el.classList.remove(activeClass);
  else el.classList.add(activeClass);
}

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
document.getElementById('search-trigger').addEventListener('click', search.toggle);
const searchTriggers = Array.from(document.querySelectorAll('.search-trigger'));
searchTriggers.forEach(trigger => trigger.addEventListener('click', search.toggle));
document.querySelector('.toggle-share').addEventListener('click', () => {
  toggleActiveClass(document.querySelector('.share-drawer'));
});

// Supports dropdown menus in the section navigation
if (sectionNav) {
  const sectionDropdowns = Array.from(sectionNav.querySelectorAll('.dropdown-item'));

  sectionDropdowns.forEach(dropdown => {
    dropdown.addEventListener('click', e => {
      const childList = e.target.parentNode.querySelector('ul');
      childList.classList.toggle('hidden');
    });
  });
}

const throttle = require('lodash.throttle');

/**
 * Get the closest matching element up the DOM tree.
 * @private
 * @param  {Element} elem     Starting element
 * @param  {String}  selector Selector to match against
 * @return {Boolean|Element}  Returns null if not match found
 */
const closest = (elem, selector) => {
  // Get closest match
  for (; elem && elem !== document; elem = elem.parentNode) {
    if (elem.matches(selector)) return elem;
  }

  return null;
};

const scrollerLists = Array.from(document.querySelectorAll('.scroller-list--list'));

function lazyLoad(e) {
  const attribute = 'data-src';
  const scrollerList = e.target;
  const nearestLazyImg = scrollerList.querySelector(`[${attribute}]`);
  const nearestLazyItem = closest(nearestLazyImg, '.scroller-list--item');
  if (!nearestLazyItem) return;
  const lazyImgFromView =
    nearestLazyItem.offsetTop - scrollerList.clientHeight - scrollerList.scrollTop;

  if (lazyImgFromView < 500) {
    nearestLazyImg.src = nearestLazyImg.getAttribute(attribute);
    nearestLazyImg.removeAttribute(attribute);
  }
}

scrollerLists.forEach(list => {
  list.addEventListener('scroll', throttle(lazyLoad, 100));
});

// SITE SEARCH
const searchInput = document.querySelector('.site-wide-search-input');
search.init(searchInput, dataURL);
