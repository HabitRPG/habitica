if(process.env.COVERAGE) {
    require('coffee-coverage').register({
        path: 'abbr',
        basePath: __dirname + '/script',
        initAll: true,
    });
}
