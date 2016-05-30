(function () {
  'use strict';

  var xhr = require('xhr');
  var hasClass = require('has-class');
  var addClass = require('add-class');
  var removeClass = require('remove-class');
  var Parallax = require('parallax-scroll');

  var menu = require('fws-navigation');
  var nav = require('fws-scrollnav');
  var glossary = require('fws-glossary');
  var highlighter = require('fws-highlighter');

  var baseUrl = document.body.getAttribute('data-root');


  var parallax = new Parallax('.parallax', {
    speed: 0.5
  });
  parallax.animate();

  var terms;

  var lunrIndex = function () {
    this.field('name', { boost: 10 });
    this.field('description');
    this.field('related', { boost: 5 });
    this.field('acronym', { boost: 3 });
    this.ref('id');
  };

  xhr.get(baseUrl + 'data/terms.js', function (err, res, body) {
    terms = JSON.parse(body);

    nav.init({
      content: document.getElementById('content'),
      insertTarget: document.querySelector('.side-nav'),
      showHeadline: false,
      scrollOffset: 55
    });

    highlighter.init({
      words: terms.map(function (term) {
        return term.name;
      }),
      wordsOnly: true,
      content: document.querySelector('#content')
    });

    menu.init({
      toggleClass: 'fws-menu-trigger',
      position: 'left'
    });

    glossary.init({
      terms: terms,
      lunrIndex: lunrIndex,
      toggleClass: 'highlight',
      position: 'left'
    });

    document.querySelector('.glossary-trigger').addEventListener('click', glossary.toggle);
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

    var scrollNav = document.querySelector('.scroll-nav');
    scrollNav.addEventListener('click', toggleScrollNav);

    function toggleScrollNav() {
      if ( hasClass(scrollNav, 'open') ) removeClass(scrollNav, 'open');
      else addClass(scrollNav, 'open');
    }

    function toggleActiveClass(el, theClass) {
      var activeClass = theClass || 'active';
      if ( hasClass(el, activeClass) ) removeClass(el, activeClass);
      else addClass(el, activeClass);
    }
  });

})();
