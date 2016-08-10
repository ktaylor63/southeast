(function () {
  'use strict';

  var fs = require('fs');
  var moment = require('moment');
  var template = require('./li.jade');

  var list = document.querySelector('.five-year-review-list');
  var species = JSON.parse( fs.readFileSync('./documents.js') );

  list.innerHTML = template({ species: species });

})();
