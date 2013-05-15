//Set requireJS settings for coffee script plugin.
requirejs.config({
    baseUrl:'../', //relative to this file
    paths: { //relative to baseUrl
        cs: 'requirejs/cs',
        'coffee-script': 'requirejs/coffee-script'
    }

});

//Require files we need.
//There are may ways to require files. Some of them just dump\run the file as it is within WINDOW scope. Some assign modules to given variables (like node.js does) and a few more.
//Main difference is order in which your code gets executed. Read more about concept at http://requirejs.org/ there are a lot of problems solved by require.js.


//Load array of modules (in this case 'app/module') into the variables (in this case module). "cs!" - means this file has to be parsed by cs plugin first.
requirejs(['cs!app/module'], function (module) {
    //foo() is defined within module.coffee. We can use it within this callback.
    //Note that we are passing lowercase here. But will get UPPERCASE because we use parentModule within module.
    module.foo('Hello!')
});