# Templates

All files related to site layout and templates are found in the [site/layouts](https://github.com/USFWS/southeast/tree/69022a3720a9dcc5e30bd3455605ac5fb3f75ba8/site/layouts) directory. This site was built using [ACE templates](https://gohugo.io/templates/ace/).  The base template includes the glossary, navigation menu, in-page navigation, and a responsive layout.  Any content that you write will automatically use the base template unless you specify a different template in the content's front matter.

Different templates are used depending on the content.  A single page (press release, individual web page, etc.) are displayed with a [Single template](https://gohugo.io/templates/content/) ([example](https://github.com/USFWS/southeast/blob/69022a3720a9dcc5e30bd3455605ac5fb3f75ba8/site/layouts/_default/single.ace)).  A default Single template is available in the [_default](https://github.com/USFWS/southeast/tree/69022a3720a9dcc5e30bd3455605ac5fb3f75ba8/site/layouts/_default) folder. These templates can be overridden to make a more specific layout for sections like press releases and species profiles. You can also create a custom template for individual Sections, for example to list all of the species profiles within the `wildlife` section.

For a complete explanation on how templates work within the Hugo ecosystem check out the [Template documentation](https://gohugo.io/templates/overview/).

## Custom Templates

To avoid creating many different templates that are only slightly different the creation of new templates should be handled by the Web Developer.  If you would like a different layout or design for a specific type of content be sure to discuss that with the Developer.  Examples of situations where custom templates might make sense include, but are not limited to:

- Species Profiles
- Full-screen maps
- Social media campaigns
- Press releases
- etc.
