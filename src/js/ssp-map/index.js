(function () {
  'use strict';

  var L = require('leaflet');
  var clickDownload = require('client-csv');
  var papaparse = require('papaparse');
  require('leaflet-draw');

  var _ = {
    inside: require('turf-inside')
  };

  var template = require('./project-template.jade');
  var sciencebase = require('./sciencebase');
  var layers = require('./layers');

  var infoWindow = document.querySelector('.info-window');
  var downloadButton = document.querySelector('.download-button');
  var infoContent = infoWindow.querySelector('.info-window-content');
  var markerPath = document.body.getAttribute('data-root') + 'images/';
  L.Icon.Default.imagePath = markerPath;

  var editableLayers = new L.FeatureGroup();
  var drawOptions = {
    draw: { circle: false, polyline: false, rectangle: false, marker: false },
    edit: { featureGroup: editableLayers, edit: false }
  };
  var drawControl = new L.Control.Draw(drawOptions);

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

    map
      .addLayer(editableLayers)
      .fitBounds(geojson.getBounds())
      .addControl(drawControl);

    map.on(L.Draw.Event.CREATED, function (e) {
      var markersInPolygon = pointsInPolygon(geojson, e.layer.toGeoJSON() );
      if (markersInPolygon.length === 0) return;
      var data = normalizeDataForDownload(markersInPolygon);
      createDownloadLink(data);
      editableLayers.addLayer(e.layer);
    });
    layers.esriTopo.addTo(map);
  }

  // Use Turf.js inside function to return an array of markers that
  //  fall inside the user-created polygon
  function pointsInPolygon(points, polygon) {
    var allMarkers = Object.values(points._layers);
    return allMarkers.filter( function(marker) {
      return _.inside(marker.toGeoJSON(), polygon);
    });
  }

  function normalizeDataForDownload(markers) {
    return markers.map(function(marker) {
      var normalized = marker.feature.properties;
      normalized.lat = marker.feature.geometry.coordinates[0];
      normalized.lon = marker.feature.geometry.coordinates[1];
      return normalized;
    });
  }

  function createDownloadLink(data) {
    var string = papaparse.unparse(data);
    clickDownload(downloadButton, function(encode) {
      return {
        filename: 'ssp-projects.csv',
        contents: encode.text(string)
      };
    });
    downloadButton.classList.add('active');
  }

  function clickHandler(feature, layer) {
    layer.on({ click: toggleInfoWindow });
  }

  function toggleInfoWindow(e) {
    var project = e.target.feature;
    infoContent.innerHTML = template({ project: project });
    infoWindow.classList.toggle('active');
  }

  init();

})();
