# Creating Content

Hugo, the software that builds the site, has a [system for organizing content](https://gohugo.io/content/organization/).  Each folder within `site/content` is considered a [Section](https://gohugo.io/content/sections/).  You can create a Section specific template that lists out all of the content within a given section to create an index.  All in all you should really read up on the documentation for Hugo to familiarize yourself with [how Content is handled by the system](https://gohugo.io/content/organization/).

## Markdown

Most content for this site is written in a meta-language called [Markdown](https://daringfireball.net/projects/markdown/syntax) that was designed to be very easy to read and write.  Markdown provides a super simple method for writing content that is automatically converted into an HTML page for you.

- If you need help remembering how to create a link, blockquote, heading, or other tag check out the [Markdown Cheatsheet](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet).
- If you want to write markdown online and see it rendered as HTML as you type try [dillinger.io](http://dillinger.io/).

## Complicated Pages

More complicated or interactive pages (mega map, priorities page) will typically be created by the Web Developer, and will use HTML, CSS, and JavaScript.  Standard text and photo based pages should be created using markdown instead.

## Content Hierarchy

The site automatically creates within page navigation by searching through the main content area for Headings.  Headings are ordered from `H1` (most important, generally only used for the page title) to `H6` (least important), although we rarely go lower in the hierarchy than `H3` or `H4` tags. **Headings should always be used to organize the structure of your content, never to control font size or style!**

The in-page navigation searches specifically for `H2` tags.  The navbar will display links that will automatically animate the page to a specific section.  Any `H3` tag that falls below an `H2` tag will not get it's own link.

## Frontmatter

[Hugo](https://gohugo.io/overview/introduction/) allows each piece of content to include it's own set of **metadata** at the top of the Markdown file called **frontmatter**.  There are some common fields between pages, but you can always add your own variables that you can use throughout page templates.  For more information on how Hugo handles front matter [check out their documentation](https://gohugo.io/content/front-matter/).

### Example of Frontmatter

This example was taken from the [fire page](https://github.com/USFWS/southeast/blob/69022a3720a9dcc5e30bd3455605ac5fb3f75ba8/site/content/fire.md).  The content of this frontmatter could change, but the concepts will remain constant.

```yaml
---
title: 'Keeping Fire on Our Side' # This title is displayed at the top of the main content area automatically (no need to manually include it)
# Description is used for Search engine optimization as well as social media integration
description: 'For thousands of years, fire has influenced the southeastern landscape, and today a broad range of plants, animals and their habitats have become dependent on fire. Learn about the fire management expertise the U.S. Fish and Wildlife Service provides to support healthy wildlife and habitats.'
hero: # Hero images are the large banner photos at the top of each page
    name: prescribed-fire.jpg # The name of the file that you dropped in src/images/hero
    alt: 'A USFWS firefighter keeps a close eye on a prescribed fire' # Read aloud to blind users; displayed if image fails to load
    caption: 'USFWS firefigher Brian Pippin watches over a prescribed fire at St. Marks National Wildlife Refuge. Photo by Jennifer Hinckley, USFWS.' # Displayed below the hero image
    link: 'https://flic.kr/p/bJQ2s4' # clicking on the hero image takes you to a larger image online
tags: # Tags allow us to find related content and display it throughout the site
    - 'prescribed fire'
    - 'land management'
    - 'national wildlife refuges'
updated: 'May 12th, 2016' # This is automatically injected into the frontmatter each time you save a content file
---
```
