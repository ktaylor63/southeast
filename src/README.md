# Source Code

This directory contains source files such as full-resolution images, JavaScript, JSON data, and SCSS for styling the website.  All of these files are preprocessed in some way to optimize the final output files.

## Images

For more information on how images are handled check out the [Images documentation](https://github.com/USFWS/southeast/blob/master/docs/images.md).

## JavaScript

In this project we use [Browserify](http://browserify.org/) to bundle all of our application code with it's dependencies.  Each directory within the `src/js` directory contains all of the code and scripts required to build an individual browserify bundle.  Each of these directories is a mini npm project with a `package.json` containing watch and build scripts.  During development you can run `npm run watchify`; each time you save a file it will automatically re-bundle the files causing your development server to restart showing your changes live.  When you are finished making changes use `npm run browserify` to produce a production ready bundle optimized for a smaller file size.

## Data

Include `*.json` files here such that they are easy to read and write.  Each time you save a file it is automatically minified to reduce file size.  This, too, will automatically reload the development server allowing you to see your changes live.

## Styles

This project uses [node-sass](https://github.com/sass/node-sass) to quickly compile SCSS to CSS.  One of the biggest advantages to using a preprocessor is the ability to split your styles into many small pieces so it's easy to find the specific place to make a change.  All of these files are compiled together into a single output file (requiring only one HTTP request) that can be compressed so it is optimized for production.  To learn more about the benefits of the CSS preprocessor `Sass` [visit their website](http://sass-lang.com/).
