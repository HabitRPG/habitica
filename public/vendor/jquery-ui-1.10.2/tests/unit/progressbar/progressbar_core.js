module( "progressbar: core" );

test( "markup structure", function() {
	expect( 5 );
	var element = $( "#progressbar" ).progressbar();
	ok( element.hasClass( "ui-progressbar" ), "main element is .ui-progressbar" );
	ok( !element.hasClass( "ui-progressbar-indeterminate" ),
		"main element is not .ui-progressbar-indeterminate" );
	equal( element.children().length, 1, "main element contains one child" );
	ok( element.children().eq( 0 ).hasClass( "ui-progressbar-value" ),
		"child is .ui-progressbar-value" );
	equal( element.children().children().length, 0, "no overlay div" );
});

test( "markup structure - indeterminate", function() {
	expect( 5 );
	var element = $( "#progressbar" ).progressbar({ value: false });
	ok( element.hasClass( "ui-progressbar" ), "main element is .ui-progressbar" );
	ok( element.hasClass( "ui-progressbar-indeterminate" ),
		"main element is .ui-progressbar-indeterminate" );
	equal( element.children().length, 1, "main element contains one child" );
	ok( element.children().eq( 0 ).hasClass( "ui-progressbar-value" ),
		"child is .ui-progressbar-value" );
	equal( element.children().children( ".ui-progressbar-overlay" ).length, 1,
		".ui-progressbar-value has .ui-progressbar-overlay" );
});

test( "accessibility", function() {
	expect( 11 );
	var element = $( "#progressbar" ).progressbar();

	equal( element.attr( "role" ), "progressbar", "aria role" );
	equal( element.attr( "aria-valuemin" ), 0, "aria-valuemin" );
	equal( element.attr( "aria-valuemax" ), 100, "aria-valuemax" );
	equal( element.attr( "aria-valuenow" ), 0, "aria-valuenow initially" );

	element.progressbar( "value", 77 );
	equal( element.attr( "aria-valuenow" ), 77, "aria-valuenow" );

	element.progressbar( "option", "max", 150 );
	equal( element.attr( "aria-valuemax" ), 150, "aria-valuemax" );

	element.progressbar( "disable" );
	equal( element.attr( "aria-disabled" ), "true", "aria-disabled on" );

	element.progressbar( "enable" );
	equal( element.attr( "aria-disabled" ), "false", "aria-disabled off" );

	element.progressbar( "option", "value", false );
	equal( element.attr( "aria-valuemin" ), 0, "aria-valuemin" );
	equal( element.attr( "aria-valuemax" ), 150, "aria-valuemax" );
	strictEqual( element.attr( "aria-valuenow" ), undefined, "aria-valuenow" );
});
