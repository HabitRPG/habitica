(function() {

var versions = [
		"1.6", "1.6.1", "1.6.2", "1.6.3", "1.6.4",
		"1.7", "1.7.1", "1.7.2",
		"1.8.0", "1.8.1", "1.8.2", "1.8.3",
		"1.9.0", "1.9.1",
		"git"
	],
	additionalTests = {
		// component: [ "other_test.html" ]
	};

window.testAllVersions = function( widget ) {
	QUnit.testSuites( $.map(
		[ widget + ".html" ].concat( additionalTests[ widget ] || [] ),
		function( test ) {
			return $.map( versions, function( version ) {
				return test + "?jquery=" + version;
			});
		}));
};

}());
