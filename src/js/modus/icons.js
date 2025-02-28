const createInlineCircle = color => encodeURI(
    'data:image/svg+xml,'
      + `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 39.2 39.2"><circle fill="${color}" stroke="black" stroke-width="2" cx="19.6" cy="19.6" r="19.6"/></svg>`
  ).replace('#', '%23');

const createInlineTower = color => encodeURI(
    'data:image/svg+xml,'
      + `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 88"><g transform="translate(0,-952.36218)">
        <path fill="${color}" d="M8.9,952.4c-0.5,0-1,0.3-1.3,0.7C2.9,958.2,0,964.9,0,972.4s2.9,14.2,7.5,19.3c0.7,0.9,2.1,1,2.9,0.3
          c0.8-0.8,0.8-2.2,0-3c-4-4.5-6.5-10.2-6.5-16.7s2.4-12.2,6.5-16.7c0.6-0.6,0.7-1.5,0.4-2.2C10.5,952.8,9.7,952.3,8.9,952.4z
           M48.9,952.4c-0.8,0-1.5,0.5-1.8,1.2s-0.1,1.6,0.4,2.1c4,4.5,6.5,10.2,6.5,16.7s-2.4,12.2-6.5,16.7c-0.8,0.7-0.8,2.2,0,3
          s2.3,0.6,2.9-0.3c4.7-5.1,7.5-11.9,7.5-19.3s-2.9-14.2-7.5-19.3C50.1,952.6,49.5,952.3,48.9,952.4z M17.9,957.4
          c-0.4,0-0.9,0.2-1.2,0.5c-4.1,3.5-6.7,8.7-6.7,14.5s2.6,11,6.7,14.5c0.8,0.8,2.3,0.8,3-0.1s0.5-2.4-0.4-3C16,981.1,14,977,14,972.4
          s2-8.8,5.3-11.5c0.6-0.5,0.9-1.5,0.6-2.2S18.8,957.3,17.9,957.4z M39.8,957.4c-0.8,0.1-1.5,0.7-1.7,1.4s0,1.6,0.6,2.1
          c3.2,2.7,5.3,6.9,5.3,11.5s-2,8.7-5.3,11.5c-0.9,0.6-1.2,2.1-0.4,3s2.2,0.9,3,0.1c4.1-3.5,6.7-8.7,6.7-14.5s-2.6-11-6.7-14.5
          C40.9,957.5,40.3,957.3,39.8,957.4z M29,963.4c-4.9,0-9,4.1-9,9s4.1,9,9,9s9-4.1,9-9S33.9,963.4,29,963.4z M29,967.4
          c2.8,0,5,2.2,5,5s-2.2,5-5,5s-5-2.2-5-5C24,969.6,26.2,967.4,29,967.4z M29,986.4c-0.1,0-0.2,0-0.3,0c-0.7,0.1-1.3,0.6-1.6,1.2
          l-22,50c-0.4,0.8-0.1,1.8,0.6,2.4s1.7,0.6,2.4,0.1l20.8-14.7l20.8,14.7c0.7,0.5,1.8,0.5,2.4-0.1c0.7-0.6,0.9-1.6,0.6-2.4l-22-50
          C30.4,987,29.8,986.5,29,986.4C29.2,986.4,29.1,986.4,29,986.4z M29,993.4l9.1,20.6l-9.1,6.4l-9.1-6.4L29,993.4z M18.3,1017.7
          l7.2,5.1l-13.8,9.7L18.3,1017.7z M39.7,1017.7l6.5,14.8l-13.8-9.7L39.7,1017.7z"/></g></svg>`
  ).replace('#', '%23');

const getTowerIcon = color => new L.Icon({
    iconUrl: createInlineTower('#000'),
    iconSize: [15, 35],
    iconAnchor: [12, 32],
    popupAnchor: [-5, -26]
  });
const getCircleIcon = color => new L.Icon({
    iconUrl: createInlineCircle(color),
    iconSize: [13, 13],
    iconAnchor: [12, 32],
    popupAnchor: [-6, -33]
  });

const createClusterIcon = (cluster, color) => L.divIcon({
    html: cluster.getAllChildMarkers().length,
    className: `cluster cluster-${color}`,
    showCoverageOnHover: false
  });

module.exports = {
  getTowerIcon,
  getCircleIcon,
  createClusterIcon
};
