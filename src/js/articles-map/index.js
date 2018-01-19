require('es6-promise').polyfill();
const axios = require('axios');
const geojson = require('geojson');
const mapboxgl = require('mapbox-gl');

mapboxgl.accessToken =
  'pk.eyJ1Ijoicmhld2l0dCIsImEiOiJjamJwZHNpZTQ0YzJvMnhxd2R5Z2djMHM2In0.KBV_ugD7VoECqIyzDBTOkA';

const StoryService = require('./StoryService');
const MapboxMap = require('./MapboxMap');
const Autocomplete = require('./Autocomplete');
const Infowindow = require('./Infowindow');

const form = document.querySelector('.autocomplete-form');

const url = '../data/articles-map.js';
const hasCoordinates = story => story.lat && story.lng;

const initialize = stories => {
  const data = geojson.parse(stories, { Point: ['lat', 'lng'] });
  const articles = new StoryService(stories);
  const autocomplete = new Autocomplete({ form });
  const mapboxMap = new MapboxMap({
    geojson: data,
    maxZoom: 14,
    getBoundsFromGeojson: true,
    style: 'mapbox://styles/mapbox/outdoors-v9'
  });
  const infowindow = new Infowindow({
    container: document.querySelector('.infowindow')
  });
};

const unhighlightStories = s => Object.assign({}, s, { highlight: false });

// Download an index of all of our static content
// Filter down to those with both a lat and lng field
axios
  .get(url)
  .then(res => res.data)
  .then(stories => stories.filter(hasCoordinates))
  .then(stories => stories.map(unhighlightStories))
  .then(initialize)
  .catch(console.log);
