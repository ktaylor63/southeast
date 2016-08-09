(function () {
  'use strict';

  var fs = require('fs');
  var each = require('lodash.forEach');
  var map = require('./map');

  require('classlist-polyfill');
  require('image-comparison');

  var images = document.querySelectorAll('.comparison-image');
  var pages = document.querySelectorAll('.page');
  var data = JSON.parse( fs.readFileSync('./accomplishments.js', 'utf8') );
  var states = JSON.parse( fs.readFileSync('./southeast.js', 'utf8') );

  map.init({ data: data });
  map.addStates(states);
  document.body.addEventListener('click', advanceSlide);

  new ImageComparison({
    container: document.querySelector('.image-comparison'),
    startPosition: 50,
    data: [
      {
        image: images[0],
        label: 'Before'
      },
      {
        image: images[1],
        label: 'After'
      }
    ]
  });

  function advanceSlide(e) {
    var clicked = e.target;
    if (clicked.classList.contains('advance-slide')) {
      var target = clicked.getAttribute('href').slice(1);
      e.preventDefault();
      map.advanceSlide(clicked);

      each(pages, function (page) {
        page.classList.remove('active');
        if (page.getAttribute('data-state') === target)
          page.classList.add('active');
      });
    }
  }
})();
