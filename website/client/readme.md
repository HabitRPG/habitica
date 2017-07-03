#Running
 - Open a terminal and type `npm run client:dev`
 - Open a second terminal and type `npm start`

#Preparation Reading
- Vue 2 (https://vuejs.org)

- Webpack (https://webpack.github.io/) is the build system and it includes plugins for code transformation, right now we have: BabelJS for ES6 transpilation, eslint for code style, less and postcss for css compilation. The code comes from https://github.com/vuejs-templates/webpack which is a Webpack template for Vue, with some small modifications to adapt it to our use case. Docs http://vuejs-templates.github.io/webpack/

- We’re using `.vue` files that make it possible to have HTML, JS and CSS for each component together in a single location. They’re implemented as a webpack plugin and the docs can be found here http://vue-loader.vuejs.org/en/

- SemanticUI is the UI framework http://semantic-ui.com/. So far I’ve only used the CSS part, it also has JS plugins but I’ve yet to use them. It supports theming so if it’s not too difficult we’ll want to customize the base theme with our own styles instead of writing CSS rules to override the original styling.

The code is in `/website/client`. We’re using something very similar to Vuex (equivalent of React’s Redux) for state management http://vuex.vuejs.org/en/index.html

The API is almost the same except that we don’t use mutations but only actions because it would make it difficult to work with common code

The project is developed directly in the `develop` branch as long as we’ll be able to avoid splitting it into a different branch.

So far most of the work has been on the template, so there’s no complex logic to understand. The only thing I would suggest you to read about is Vuex for data management: it’s basically a Flux implementation: there’s a central store that hold the data for the entire app, and every change to the data must happen through an action, the data cannot be mutated directly.
