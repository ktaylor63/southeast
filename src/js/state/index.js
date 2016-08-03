(function () {
  'use strict';

  var xhr = require('xhr');

  var template = {
    atRisk: require('./at-risk.jade'),
    listed: require('./listed.jade')
  };

  var abbreviation = document.querySelector('.state-abbreviation').textContent;
  var state = document.querySelector('.state-name').textContent;
  var threatenedList = document.querySelector('.threatened-species');
  var endangeredList = document.querySelector('.endangered-species');
  var atRiskList = document.querySelector('.at-risk-species');
  var listedUrl = 'https://finder.royhewitt.com/listed?state=' + abbreviation;
  var atRiskUrl = 'https://finder.royhewitt.com/species?range[]=' + state;

  xhr.get(listedUrl, function (err, response, body) {
    if (err) console.error(err);
    var listed = JSON.parse(body);
    var src = 'https://ecos.fws.gov/tess_public/reports/species-listed-by-state-report?status=listed&state=' + abbreviation;
    endangeredList.innerHTML = template.listed({ species: listed.endangered, type: 'Endangered Species' });
    threatenedList.innerHTML = template.listed({ species: listed.threatened, type: 'Threatened Species' });
  });

  xhr.get(atRiskUrl, function (err, response, body) {
    if (err) console.error(err);
    var species = JSON.parse(body);
    atRiskList.innerHTML = template.atRisk({ species: species });
  });
})();
