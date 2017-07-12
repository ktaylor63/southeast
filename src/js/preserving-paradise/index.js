const fs = require('fs');
const L = require('leaflet');

const icons = require('./icons');

const baseUrl = document.body.getAttribute('data-root');
const markerPath =  `${baseUrl}images/`;
L.Icon.Default.imagePath = markerPath;

const video = document.querySelector('.hero-video');

const locations = JSON.parse(fs.readFileSync('./locations.geojson', 'utf8'));
const altamaha = JSON.parse(fs.readFileSync('./altamaha.geojson', 'utf8'));
const lands = JSON.parse(fs.readFileSync('./protected-lands.geojson', 'utf8'));

let map;

const bindPopup = (feat, layer) => {
  const props = feat.properties;
  const html = `
    <img src="${baseUrl + props.img}" alt="${props.alt}" />
    <h3>${props.title}</h3>
    <p>${props.teaser} <a href="${baseUrl + props.url}">Learn more...</a></p>
  `;
  return layer.bindPopup(html);
}

const customizeIcon = (feat, latlng) => L.marker(latlng, { icon: icons[feat.properties.icon] });

const addLabel = layer => layer.feature.properties.location;

const createMap = () => {
  map = L.map('map', {
      center: [31.6247121, -83.0349076],
      zoom: 7,
      scrollWheelZoom: false
  });

  // Make sure the whole popup is visible after clicking on a map marker
  map.on('popupopen', e => {
    const px = map.project(e.popup._latlng);
    px.y -= e.popup._container.clientHeight / 1.25;
    map.panTo(map.unproject(px),{animate: true});
  });

  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  }).addTo(map);

  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  }).addTo(map);

  const markers = L.geoJSON(locations, {
    onEachFeature: bindPopup,
    pointToLayer: customizeIcon
  }).addTo(map);

  L.geoJSON(lands, {
    style: {"color": "#4fd439", "weight": 3,"opacity": 0.65}
  }).addTo(map);
  L.geoJSON(altamaha).addTo(map);

  map.fitBounds(markers.getBounds(), { padding: [75, 75] });
  // map.fitBounds([[31.616821, -81.894584], [31.139147, -81.356601]]);
}

createMap();
