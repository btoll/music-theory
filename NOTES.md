// We need two build targets for the JavaScript.
// For the app, we need Pete + app/app.js
// For the template.html (each quiz sandbox), we just need Pete.

To add a new link to the main quiz menu on index.html, simply add a new list element in `app.json`.
For example, adding `chord_builder` will build the following link in `app/app.js`:

        <a href="#chord_builder" title="Chord Builder">Chord Builder</a>

Of course, that will be wrapped in a <li> list item in the menu nav <ul> unordered list.

