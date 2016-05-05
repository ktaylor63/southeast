(function () {
  'use strict';

  var fs = require('fs');

  var menu = require('fws-navigation/src/js/menu');
  var glossary = require('fws-glossary');
  var highlighter = require('fws-highlighter');
  var terms = fs.readFileSync(__dirname + '/terms.json', 'utf8');
  terms = JSON.parse(terms);

  var lunrIndex = function () {
    this.field('name', { boost: 10 });
    this.field('description');
    this.field('related', { boost: 5 });
    this.field('acronym', { boost: 3 });
    this.ref('id');
  };

  highlighter.init({
    words: terms.map(function (term) {
      return term.name;
    }),
    content: document.querySelector('#content')
  });

  menu.init({
    toggleClass: 'fws-menu-trigger'
  });

  glossary.init({
    terms: terms,
    lunrIndex: lunrIndex,
    toggleClass: 'highlight'
  });

  document.querySelector('.glossary-trigger').addEventListener('click', glossary.toggle);
  document.querySelector('.fws-menu-trigger').addEventListener('click', menu.show);
  document.getElementById('search-trigger').addEventListener('click', menu.toggleSearch);

})();
