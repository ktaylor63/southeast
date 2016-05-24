# Styles

This site uses [node-sass](https://github.com/sass/node-sass) to compile Sass (Syntatically awesome CSS) files to CSS. [Sass](http://sass-lang.com/), according to their website, gives CSS superpowers by letting you use tools not available in old-school CSS like variables, mixins, extends, etc.  Rather than giving a full how-to on what Sass is and how to use it I recommend looking up resources online.  Keep in mind that **this project usess the scss syntax rather than the sass syntac**.  SCSS should be much easier to pick up for someone with background CSS knowledge.  Sass is a minimalist language that removes semi-colons and curly braces.

Compilation of SCSS to CSS is automatically handled after you start a development server with `npm start`.

When building the site for production the output style is set to compressed, which produces the same result with a smaller file size.

## Variables

Site-wide variables are all included in the `src/scss/_variables.scss` file.  If you update values in this file the changes will reverberate through the rest of the systems, which make site-wide changes in style much easier.

## Mixins

Code that is repeated often (buttons, tags, etc.) can be written as a mixin so that code can be re-used.  This saves you from searching through a CSS stylesheet to copy and paste the same code in multiple places.
