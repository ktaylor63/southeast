# Image Preprocessing

All source images used on the website are stored in the [src/images](https://github.com/USFWS/southeast/tree/master/src/images) folder in the **highest resolution** available.  These images will be processed to reduce file size to improve website load times.

## Scripts for Preprocessing Images

The image preprocessing scripts are included in the script for the development server.  If you run `npm start` to kick off the server any time you add a new image to one of the following locations all of the images will be preprocessed and the website will be re-built.

If you would like to run a script manually there are several to choose from:

 - `npm run hero`: Preprocess all hero images by resizing, and optimizing
 - `npm run svg`: Optimize all SVGs by removing unnecessary data, produce a single SVG sprite sheet
 - `npm run pages`: Optimize all of the photos in this directory, resize based on the parent folder (400 => 400px wide)

## Hero images

Hero images are the large photos present at the top of most pages.  Photos that you wish to use as a hero image **must be at least 1400px wide**. If you save the highest resolution photo that you have and drop it into `src/images/hero` it will be automatically resized and optimized for you.

### How to include a hero image on a page

For website content that has front matter, include all the necessary data under the tag `hero`.

- **name**: The filename of the photo that you saved in `src/images/hero`
- **alt**: A description of the photo that will be read to screenreaders/displayed if the image fails to load
- **caption**: The caption that will be displayed for this photo (can include HTML!)
- **link**: A link to the full resolution photo on flickr or elsewhere on the web

The following should appear at the top of Markdown files:
```yml
---
title: Article about roseate spoonbills
hero:
  name: roseate-spoonbill.jpg
  alt: A bright pink bird with a large round beak wading in shallow water
  caption: Roseate spoonbill. Photo: USFWS
  link: 'https://flic.kr/p/cM3Jgu'
---
```

## Images within a page's content

All photos that will be peppered throughout the content of a page should go in the [src/images/pages](https://github.com/USFWS/southeast/tree/master/src/images/pages) directory.  Within this folder you'll find several subfolders each named with a number.  The number represents the width of the optimized output.  If you would like a photo to be 650px wide put it in the 650 folder.  If a size does not exist for the photo you're interested in resizing feel free to create one.

After processing all images from the `src/images/pages` directory will be available to be included in the website at `/images/pages/file-name.jpg` (see below for a full example).

**Note:** By default all photos are displayed with `max-width: 100%` to prevent images from being stretched and pixelated.  On smaller screens they will naturally shrink based on their aspect ratio.  That is to say that if you want an image to be 650px wide it may appear smaller on a phone or tablet to assure it fits within the viewport.

Including images in a markdown file should take advantage of the [Hugo shortcode for the figure tag](https://gohugo.io/extras/shortcodes/#figure):
```
{{< figure class="photo" src="/images/pages/mbta-centennial-logo.jpg" alt="The USFWS logo next to the migratory bird treaty centennial logo" >}}
```
There are several other attributes that you can include such as `link` to link to a webpage, `title` to show a tooltip on hover, `caption` to display a caption below the image, `class` to include a CSS class on the figure tag.  Check out the docs on the [Figure Shortcode](https://gohugo.io/extras/shortcodes/#figure) for more details.

## Scalable Vector Graphics (SVG)

SVG are vector drawings that can be resized without fear of pixelation.  Typically this leads to much smaller file sizes, which improves performance.  SVG can be composed of several smaller drawings, which can be independently styled and animated.  We have decided to use SVG rather than icon fonts so we can serve only the icons that we really need, and because of some weird behavior with Internet Explorer (SVG is supported on IE9+).

All SVG should be saved to the `src/images/svg` directory.  These files will be preprocessed to remove any artifacts left behind by your graphics editor (Illustrator, Sketch, Inkscape, etc.).  The individual icons will be wrapped in `<symbol>` tags then be stitched together by [svg-sprite](https://github.com/jkphl/svg-sprite/), and included in the top of your page so they can be displayed with the following syntax:

```
<svg class="icon icon-home">
  <use xlink:href="#home"></use>
</svg>
```
Where `xlink:href="#home"` represents the filename of the icon in the source SVG directory.
