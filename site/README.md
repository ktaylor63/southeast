# Website Content

This directory contains all of the content and templates that Hugo uses to create the final website.  Check out the [getting started guide](https://github.com/USFWS/southeast/blob/master/docs/getting-started.md). To learn how to [create content](https://github.com/USFWS/southeast/blob/master/docs/creating-content.md) or how to work with [templates](https://github.com/USFWS/southeast/blob/master/docs/templates.md) check out the documentation.

## Watching files during development

The file watcher in the development server (run with `npm start`) watches for changes to files in the `site` directory.  When a file changes the entire site is re-created and the browser should reload automatically.

## Static content

Any files in the [`static` directory](https://gohugo.io/themes/creation#static) are copied to the final website without modification.  To avoid recopying the thousand plus PDF files we currently maintain use `src/static`, which is copied over to the `dist` directory before the development server starts and before the website is published.  All of the source JavaScript, images, and data that are optimized from the `src` directory are copied into their respective directories in `dist`.
