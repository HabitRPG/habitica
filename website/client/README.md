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

### Vue Structure

Currently pages and components are mixed in `/src/components` this is not a good way to find the files easy.

Thats why each changed / upcoming page / component should be put in either `/src/components` or in the `/src/pages` directory.

Inside Pages, each page can have a subfolder which contains sub-components only needed for that page - otherwise it has to be added to the normal components folder.

At the end of all the changes - the components should only contain components needed between all pages
