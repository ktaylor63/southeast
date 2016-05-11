(function () {
  'use strict';

  var jsonp = require('jsonp');
  var addClass = require('add-class');
  var removeClass = require('remove-class');
  var hasClass = require('has-class');
  var nav = require('fws-scrollnav');
  var template = require('./result.jade');

  nav.init({
    content: document.getElementById('content'),
    insertTarget: document.querySelector('.side-nav'),
    showHeadline: false,
    scrollOffset: 55
  });

  var list = document.querySelector('.register-list');
  var sciName = document.querySelector('.scientific-name').textContent;
  var animal = encodeURIComponent(sciName.replace('(', '').replace(')', ''));
  var url = 'https://www.federalregister.gov/api/v1/articles.json?per_page=1000&order=relevance&conditions%5Bterm%5D=' + animal + '&conditions%5Bagencies%5D%5B%5D=fish-and-wildlife-service';
  var scrollNav = document.querySelector('.scroll-nav');
  var wrapper = document.querySelector('.wrapper');

  addClass(wrapper, 'side-nav');

  scrollNav.addEventListener('click', function () {
    if ( hasClass(scrollNav, 'open') ) removeClass(scrollNav, 'open');
    else addClass(scrollNav, 'open');
  });

  jsonp(url, function (err, data) {
    list.innerHTML = template({ results: data.results });
  });
})();
