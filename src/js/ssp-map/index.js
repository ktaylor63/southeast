(function () {
  'use strict';

  var L = require('leaflet');

  var _ = {
    hasClass: require('has-class'),
    removeClass: require('remove-class'),
    addClass: require('add-class')
  };

  var template = require('./project-template.jade');
  var sciencebase = require('./sciencebase');
  var layers = require('./layers');

  var infoWindow = document.querySelector('.info-window');
  var infoContent = infoWindow.querySelector('.info-window-content');
  var markerPath = document.body.getAttribute('data-root') + 'images/';
  L.Icon.Default.imagePath = markerPath;

  var map, projects;

  function init() {
    projects = sciencebase.init(createMap);
  }

  // Is called with sciencebase data after the init function is finished
  function createMap(projects) {
    map = L.map('sciencebase-map', {
      scrollWheelZoom: false
    });
    var geojson = L.geoJSON(projects, {
      onEachFeature: clickHandler
    }).addTo(map);

    map.fitBounds(geojson.getBounds());
    layers.esriTopo.addTo(map);
  }

  function clickHandler(feature, layer) {
    layer.on({ click: toggleInfoWindow });
  }

  function toggleInfoWindow(e) {
    var project = e.target.feature;
    infoContent.innerHTML = template({ project: project });
    var activeClass = 'active';
    if ( _.hasClass(infoWindow, activeClass) ) _.removeClass(infoWindow, activeClass);
    else _.addClass(infoWindow, activeClass);
  }

  init();

})();
