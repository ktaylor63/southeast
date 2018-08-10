const autoprefixer = require('autoprefixer')({ browsers: ['last 2 versions', 'not dead', 'IE 11'] });

module.exports = {
  map: false,
  plugins: [autoprefixer]
};
