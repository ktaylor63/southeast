const L = require('leaflet');

const baseUrl = document.body.getAttribute('data-root');

const bird = L.icon({
  iconSize: [55, 55],
  iconAnchor: [30, 55],
  popupAnchor: [-2, -52],
  iconUrl: `${baseUrl}images/svg/bird-marker.svg`
});

const plane = L.icon({
  iconSize: [55, 55],
  iconAnchor: [30, 55],
  popupAnchor: [-2, -52],
  iconUrl: `${baseUrl}images/svg/plane-marker.svg`
});

const trees = L.icon({
  iconSize: [55, 55],
  iconAnchor: [30, 55],
  popupAnchor: [-2, -52],
  iconUrl: `${baseUrl}images/svg/trees-marker.svg`
});

const person = L.icon({
  iconSize: [55, 55],
  iconAnchor: [30, 55],
  popupAnchor: [-2, -52],
  iconUrl: `${baseUrl}images/svg/person-marker.svg`
});

const hike = L.icon({
  iconSize: [55, 55],
  iconAnchor: [30, 55],
  popupAnchor: [-2, -52],
  iconUrl: `${baseUrl}images/svg/hike-marker.svg`
});

const partner = L.icon({
  iconSize: [70, 70],
  iconAnchor: [30, 55],
  popupAnchor: [7, -52],
  iconUrl: `${baseUrl}images/svg/partner-marker.svg`
});

module.exports = {
  bird,
  plane,
  trees,
  person,
  hike,
  partner
};
