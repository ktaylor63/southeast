# JavaScript

This project uses [Browserify](http://browserify.org) to bundle JavaScript for production use.  **A fresh clone of this project will not** include all of the JavaScript included on pages throughout the site. Users who have just cloned the repository should `cd` into each of the directories in `src/js/` and run `browserify` to produce production ready builds of each JavaScript bundle.

## Development

During development you can use `watchify` to reduce the amount of time it takes for subsequent compilations.  Be sure to check out the `package.json` file -- specifically the `scripts` section, which should include either an `npm start` or `npm run watchify` option to compile the JavaScript during development.
