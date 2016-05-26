# Tagging Content

Hugo allows you to tag content, which makes it much easier to [display different pages throughout the site through the use of templates](https://gohugo.io/taxonomies/displaying/).  Tags are included in the content's [frontmatter](https://gohugo.io/content/front-matter/) as a list.  Hugo automatically creates an index page for each tag.  If you visit fws.gov/southeast/tags/florida you will find **all** content that was tagged with `florida`. A **complete list** of all tags that are in use on the website is available at fws.gov/southeast/tags.

## How do you declare tags in your front matter?
```yaml
---
title: 'Example title'
tags:
  - alabama
  - restoration
  - recovery
---
```

## Custom Taxonomies

To start we will be relying on the default `tags` and `categories` taxonomies provided by Hugo.  If at some point in the future we need to expand how we organize and describe our content [we can create custom taxonomies](https://gohugo.io/taxonomies/overview/).
