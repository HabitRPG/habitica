# Habitica Client

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your unit tests
```
npm run test:unit
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## Storybook

Storybook is mainly used while working on UI-Components to see changes faster instead of using the website.

### Start Storybook

```
npm run storybook:serve
```

This will start the storybook process, every `*.stories.js`-File is searched and added to the storybook overview.

### Storybook Worklow

Usually when you working on `component-name.vue` you also create a `component-name.stories.js` file.

Example of the stories structure - [Storybook Docs][StorybookDocsExample] - [CountBadge][CountBadgeExample]

[StorybookDocsExample]: https://storybook.js.org/docs/guides/guide-vue/#step-4-write-your-stories
[CountBadgeExample]: src/components/ui/countBadge.stories.js

Each function or example of this component will be put after `storiesOf('Your Component', module)`,
in a separate `.add('function of component', ...`

### Storybook Build

After each client build, storybook build is also triggered and will be available in `dist/storybook`
