module( "progressbar: options" );

test( "{ value: 0 }, default", function() {
	expect( 1 );
	$( "#progressbar" ).progressbar();
	equal( $( "#progressbar" ).progressbar( "value" ), 0 );
});

// Ticket #7231 - valueDiv should be hidden when value is at 0%
test( "value: visibility of valueDiv", function() {
	expect( 4 );
	var element = $( "#progressbar" ).progressbar({
		value: 0
	});
	ok( element.children( ".ui-progressbar-value" ).is( ":hidden" ),
		"valueDiv hidden when value is initialized at 0" );
	element.progressbar( "value", 1 );
	ok( element.children( ".ui-progressbar-value" ).is( ":visible" ),
		"valueDiv visible when value is set to 1" );
	element.progressbar( "value", 100 );
	ok( element.children( ".ui-progressbar-value" ).is( ":visible" ),
		"valueDiv visible when value is set to 100" );
	element.progressbar( "value", 0 );
	ok( element.children( ".ui-progressbar-value" ).is( ":hidden" ),
		"valueDiv hidden when value is set to 0" );
});

test( "{ value: 5 }", function() {
	expect( 1 );
	$( "#progressbar" ).progressbar({
		value: 5
	});
	equal( $( "#progressbar" ).progressbar( "value" ), 5 );
});

test( "{ value: -5 }", function() {
	expect( 1 );
	$( "#progressbar" ).progressbar({
		value: -5
	});
	equal( $( "#progressbar" ).progressbar( "value" ), 0,
		"value constrained at min" );
});

test( "{ value: 105 }", function() {
	expect( 1 );
	$( "#progressbar" ).progressbar({
		value: 105
	});
	equal( $( "#progressbar" ).progressbar( "value" ), 100,
		"value constrained at max" );
});

test( "{ value: 10, max: 5 }", function() {
	expect( 1 );
	$("#progressbar").progressbar({
		max: 5,
		value: 10
	});
	equal( $( "#progressbar" ).progressbar( "value" ), 5,
		"value constrained at max" );
});

test( "change max below value", function() {
	expect( 1 );
	$("#progressbar").progressbar({
		max: 10,
		value: 10
	}).progressbar( "option", "max", 5 );
	equal( $( "#progressbar" ).progressbar( "value" ), 5,
		"value constrained at max" );
});
