(function () {
  'use strict';

  var leaflet = require('leaflet');
  var xhr = require('xhr');

  L.Icon.Default.imagePath = '/images/leaflet';

  var blueGoose = L.icon({
    iconUrl: '/images/leaflet/blue-goose.svg',
    iconSize: [70, 90],
    popupAnchor: [5, -17]
  });

  var map, refuges, url;

  function init(abbreviation) {
    url = "http://services.arcgis.com/QVENGdaPbd4LUkLV/ArcGIS/rest/services/FWSVisitorServices/FeatureServer/0/query?where=STATE='" + abbreviation + "'+AND+RSL_TYPE='NWR'&outFields=*&f=pgeojson";
    createMap();
    getRefuges();
  }

  function createMap() {
    map = L.map('map',{
      scrollWheelZoom:false
    }).setView([31.967,-78.610], 5);

    L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/{type}/{z}/{x}/{y}.{ext}', {
    	type: 'map',
    	ext: 'jpg',
    	attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    	subdomains: '1234'
    }).addTo(map);
  }

  function getRefuges() {
    xhr.get(url, function (err, res, body) {
      refuges = JSON.parse(body);
      addMarkers(refuges);
    });
  }

  function addMarkers(refuges) {
    var cluster = L.geoJson(refuges,{
      pointToLayer: customIcon,
      onEachFeature: onEachFeature
    }).addTo(map);

    map.fitBounds(cluster.getBounds());
  }

  function onEachFeature (feature, layer) {
    var props = feature.properties;
    var html = "<strong><a href='" + props.URL + "' target='_blank'>" + props.ORGNAME + '</a></strong>';
    layer.bindPopup(html);
  }

  function customIcon(feature, latlng) {
    return L.marker(latlng, { icon: blueGoose });
  }

  module.exports.init = init;
})();
