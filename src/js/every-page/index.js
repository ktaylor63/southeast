(function () {
  'use strict';

  var xhr = require('xhr');
  var hasClass = require('has-class');
  var addClass = require('add-class');
  var removeClass = require('remove-class');
  var Parallax = require('parallax-scroll');
  var Marker = require('./mark');
  var menu = require('fws-navigation');
  var nav = require('fws-scrollnav');
  var glossary = require('fws-glossary');

  var marker = new Marker(document.querySelector('#content'));
  var parallax = new Parallax('.parallax', { speed: 0.5 });

  var content = document.querySelector('#content');
  var baseUrl = document.body.getAttribute('data-root');
  var anchors = document.querySelectorAll('a');
  var scrollNav,
      terms;

  parallax.animate();

  var lunrIndex = function () {
    this.field('name', { boost: 10 });
    this.field('description');
    this.field('related', { boost: 5 });
    this.field('acronym', { boost: 3 });
    this.ref('id');
  };

  if (content.querySelectorAll('h2').length > 0) {
    nav.init({
      content: document.getElementById('content'),
      insertTarget: document.querySelector('.side-nav'),
      showHeadline: false,
      scrollOffset: 55
    });
    scrollNav = document.querySelector('.scroll-nav');
    scrollNav.addEventListener('click', toggleScrollNav);
  }

  menu.init({
    toggleClass: 'fws-menu-trigger',
    position: 'left'
  });

  xhr.get(baseUrl + 'data/terms.js', function (err, res, body) {
    if (err) console.error(err);
    terms = JSON.parse(body);
    var words = terms.map(function (term) { return term.name; });

    marker.mark(words, {
      element: 'span',
      className: 'highlight',
      exclude: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a'],
      accuracy: 'exactly',
      separateWordSearch: false,
      filter: function (node, term, i) {
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
  });

  Array.prototype.forEach.call(anchors, function(anchor) {
    if ( anchor.href.indexOf(baseUrl) === -1 ) anchor.setAttribute('target', '_blank');
  });

  document.querySelector('.fws-menu-trigger').addEventListener('click', menu.show);
  document.getElementById('search-trigger').addEventListener('click', menu.toggleSearch);
  document.querySelector('.toggle-contact').addEventListener('click', function () {
    toggleActiveClass(document.querySelector('.contact-drawer'));
  });

  document.querySelector('.toggle-share').addEventListener('click', function () {
    toggleActiveClass(document.querySelector('.share-drawer'));
  });

  var drawerToggles = document.querySelectorAll('.close-drawer');

  for (var i = 0; i < drawerToggles.length; i++) {
    drawerToggles[i].addEventListener('click', removeActiveClassFromDrawer);
  }

  function removeActiveClassFromDrawer (e) {
    var parent = e.target.parentNode;
    if (parent) removeClass(parent, 'active');
  }

  function toggleScrollNav() {
    if ( hasClass(scrollNav, 'open') ) removeClass(scrollNav, 'open');
    else addClass(scrollNav, 'open');
  }

  function toggleActiveClass(el, theClass) {
    var activeClass = theClass || 'active';
    if ( hasClass(el, activeClass) ) removeClass(el, activeClass);
    else addClass(el, activeClass);
  }

})();
