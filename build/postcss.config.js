const autoprefixer = require('autoprefixer')();
const cssnano = require('cssnano');

module.exports = {
  map: false,
  plugins: [autoprefixer, cssnano]
};
