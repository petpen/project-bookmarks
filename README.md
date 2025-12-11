# Project Bookmarks

With this tool you have a central location for all your relevant project bookmarks.

This tool is a customizable bookmark page for teams, designed to be used as a GitHub/GitLab Pages site or as a Chrome new tab extension.
Users can modify sections and links via a configuration file, and optionally add personal sections for browser extension use.

Light and dark mode is supported. The colors in the dark mode will be slightly darkened, too.

Feel free to use it in your projects and help the team to get fast to the relevant pages.

Better than sharing bookmarks via files, in confluence or somewhere else.

## Preview

> [!TIP]
> Get a [live preview](https://htmlpreview.github.io/?https://github.com/petpen/project-bookmarks/blob/main/public/index.html)

![Preview](img/preview.jpg "New Tab Preview")

## Usage as Bookmark Page

The page can be created by Gitlab / GitHub Pages and is then available. See `.gitlab-ci.yml`

## Usage in Browser as New Tab Extension (optional)

1. Clone this repository to a directory on your local machine
2. Start Chrome and open the page `chrome://extensions/`
3. Toggle **Developer Mode** to `on` in the upper right corner.
4. There will be shown a new button called **Load unpacked extension** press this button
5. Choose now the folder where you placed this repository
6. The extension is now installed. Open a new tab in Chrome and all the links will appear


## Modification

Adopting the *sections* and *links* can be done in the file [config.json](public/config.json).

| Field         | Purpose                                                                      |
|:--------------|:-----------------------------------------------------------------------------|
| title         | Title of the New Tab page                                                    |
| defaults      | The defaults for sections and links if no value is given for the fields.     |
| fg            | Foreground color for links                                                   |
| bg            | Background color for links                                                   |

Adding `{}` as a link element in a section will force a new line for the upcoming links.

## Personal Sections

> [!important]
> This personal section can be used in a Browser Extension only.

To create your personal sections without modifying the existing ones, you can create a file called `public/personal.json`.
Example structure can be found in [template.personal.json](template.personal.json).

| Field    | Purpose                                                                                                          |
|:---------|:-----------------------------------------------------------------------------------------------------------------|
| position | Choose if the personal sections should appear on `top` or `bottom` of the default sections. Default is `bottom`. |
| sections | These are the personal sections.                                                                                 |
