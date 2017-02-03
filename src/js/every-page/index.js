(function () {
  'use strict';

  require('classlist-polyfill');

  var xhr = require('xhr');
  var Parallax = require('parallax-scroll');
  var Marker = require('./mark');
  var menu = require('fws-navigation');
  var nav = require('fws-scrollnav');
  var glossary = require('fws-glossary');
  var contacts = require('./contacts');
  var shortList = require('./short-list');
  var contactsDownloaded = false;

  var marker = new Marker(document.querySelector('#content'));
  var parallax = new Parallax('.parallax', { speed: 0.5 });

  var content = document.getElementById('content');
  var baseUrl = document.body.getAttribute('data-root');
  var anchors = document.querySelectorAll('a');
  var contactLinks = document.querySelectorAll('.toggle-contact');
  var hideScrollnav = document.querySelector('.hide-scrollnav');
  var sectionNav = document.querySelector('.section-nav');
  var scrollNav,
      terms;

  parallax.animate();

  shortList.init({
    elements: document.querySelectorAll('.fade-list')
  });

  var lunrIndex = function () {
    this.field('name', { boost: 10 });
    this.field('description');
    this.field('related', { boost: 5 });
    this.field('acronym', { boost: 3 });
    this.ref('id');
  };

  // This is kinda confusing.  If the parameter "scrollnav" is set in the page's
  // we don't want to initialize the scroll nav
  if (content && content.querySelectorAll('h2').length > 0 && !hideScrollnav) {
    nav.init({
      content: content,
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
    // Highlight words and their acronyms
    var words = terms.map(function (term) { return term.name; });
    terms.forEach(function (term) {
      if (term.acronym) words.push(term.acronym);
    });

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

  [].forEach.call(anchors, function(anchor) {
    if ( anchor.href.indexOf(baseUrl) === -1 ) anchor.setAttribute('target', '_blank');
  });

  [].forEach.call(contactLinks, function (link) {
    link.addEventListener('click', function() {
      if (!contactsDownloaded) {
        contacts.init();
        contactsDownloaded = true;
      }
      toggleActiveClass(document.querySelector('.contact-drawer'));
    });
  });

  document.querySelector('.fws-menu-trigger').addEventListener('click', menu.show);
  document.getElementById('search-trigger').addEventListener('click', menu.toggleSearch);
  document.querySelector('.toggle-share').addEventListener('click', function () {
    toggleActiveClass(document.querySelector('.share-drawer'));
  });

  var drawerToggles = document.querySelectorAll('.close-drawer');
  document.body.addEventListener('keyup', keyupHandler);

  for (var i = 0; i < drawerToggles.length; i++) {
    drawerToggles[i].addEventListener('click', removeActiveClassFromDrawer);
  }

  function removeActiveClassFromDrawer (e) {
    var parent = (e.target) ? e.target.parentNode : e.parentNode;
    if (parent) parent.classList.remove('active');
  }

  function keyupHandler(e) {
    var key = e.which || e.keyCode || 0;
    if (key !== 27) return;
    var drawers = [
      document.querySelector('.contact-drawer'),
      document.querySelector('.share-drawer'),
      document.querySelector('.info-window')
    ];

    [].forEach.call(drawers, function (drawer) {
      if (!drawer) return;
      var button = drawer.querySelector('.close-drawer');
      if ( drawer.classList.contains('active') ) removeActiveClassFromDrawer(button);
    });
  }

  function toggleScrollNav() {
    if ( scrollNav.classList.contains('open') ) scrollNav.classList.remove('open');
    else scrollNav.classList.add('open');
  }

  function toggleActiveClass(el, theClass) {
    var activeClass = theClass || 'active';
    if ( el.classList.contains(activeClass) ) el.classList.remove(activeClass);
    else el.classList.add(activeClass);
  }

  // Supports dropdown menus in the section navigation
  if (sectionNav) {
    var sectionDropdowns = sectionNav.querySelectorAll('.dropdown-item');

    [].forEach.call(sectionDropdowns, function (dropdown) {
      dropdown.addEventListener('click', function(e) {
        var childList = e.target.parentNode.querySelector('ul');
        childList.classList.toggle('hidden');
      });
    });
  }



})();
