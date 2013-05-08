(function( $ ) {

module( "core - jQuery extensions" );

TestHelpers.testJshint( "core" );

asyncTest( "focus - original functionality", function() {
	expect( 1 );
	$( "#inputTabindex0" )
		.one( "focus", function() {
			ok( true, "event triggered" );
			start();
		})
		.focus();
});

asyncTest( "focus", function() {
	expect( 2 );
	$( "#inputTabindex0" )
		.one( "focus", function() {
			ok( true, "event triggered" );
			start();
		})
		.focus( 500, function() {
			ok( true, "callback triggered" );
		});
});

test( "zIndex", function() {
	expect( 7 );
	var el = $( "#zIndexAutoWithParent" ),
		parent = el.parent();
	equal( el.zIndex(), 100, "zIndex traverses up to find value" );
	equal( parent.zIndex(200 ), parent, "zIndex setter is chainable" );
	equal( el.zIndex(), 200, "zIndex setter changed zIndex" );

	el = $( "#zIndexAutoWithParentViaCSS" );
	equal( el.zIndex(), 0, "zIndex traverses up to find CSS value, not found because not positioned" );

	el = $( "#zIndexAutoWithParentViaCSSPositioned" );
	equal( el.zIndex(), 100, "zIndex traverses up to find CSS value" );
	el.parent().zIndex( 200 );
	equal( el.zIndex(), 200, "zIndex setter changed zIndex, overriding CSS" );

	equal( $( "#zIndexAutoNoParent" ).zIndex(), 0, "zIndex never explicitly set in hierarchy" );
});

test( "innerWidth - getter", function() {
	expect( 2 );
	var el = $( "#dimensions" );

	equal( el.innerWidth(), 122, "getter passthru" );
	el.hide();
	equal( el.innerWidth(), 122, "getter passthru when hidden" );
});

test( "innerWidth - setter", function() {
	expect( 2 );
	var el = $( "#dimensions" );

	el.innerWidth( 120 );
	equal( el.width(), 98, "width set properly" );
	el.hide();
	el.innerWidth( 100 );
	equal( el.width(), 78, "width set properly when hidden" );
});

test( "innerHeight - getter", function() {
	expect( 2 );
	var el = $( "#dimensions" );

	equal( el.innerHeight(), 70, "getter passthru" );
	el.hide();
	equal( el.innerHeight(), 70, "getter passthru when hidden" );
});

test( "innerHeight - setter", function() {
	expect( 2 );
	var el = $( "#dimensions" );

	el.innerHeight( 60 );
	equal( el.height(), 40, "height set properly" );
	el.hide();
	el.innerHeight( 50 );
	equal( el.height(), 30, "height set properly when hidden" );
});

test( "outerWidth - getter", function() {
	expect( 2 );
	var el = $( "#dimensions" );

	equal( el.outerWidth(), 140, "getter passthru" );
	el.hide();
	equal( el.outerWidth(), 140, "getter passthru when hidden" );
});

test( "outerWidth - setter", function() {
	expect( 2 );
	var el = $( "#dimensions" );

	el.outerWidth( 130 );
	equal( el.width(), 90, "width set properly" );
	el.hide();
	el.outerWidth( 120 );
	equal( el.width(), 80, "width set properly when hidden" );
});

test( "outerWidth(true) - getter", function() {
	expect( 2 );
	var el = $( "#dimensions" );

	equal( el.outerWidth(true), 154, "getter passthru w/ margin" );
	el.hide();
	equal( el.outerWidth(true), 154, "getter passthru w/ margin when hidden" );
});

test( "outerWidth(true) - setter", function() {
	expect( 2 );
	var el = $( "#dimensions" );

	el.outerWidth( 130, true );
	equal( el.width(), 76, "width set properly" );
	el.hide();
	el.outerWidth( 120, true );
	equal( el.width(), 66, "width set properly when hidden" );
});

test( "outerHeight - getter", function() {
	expect( 2 );
	var el = $( "#dimensions" );

	equal( el.outerHeight(), 86, "getter passthru" );
	el.hide();
	equal( el.outerHeight(), 86, "getter passthru when hidden" );
});

test( "outerHeight - setter", function() {
	expect( 2 );
	var el = $( "#dimensions" );

	el.outerHeight( 80 );
	equal( el.height(), 44, "height set properly" );
	el.hide();
	el.outerHeight( 70 );
	equal( el.height(), 34, "height set properly when hidden" );
});

test( "outerHeight(true) - getter", function() {
	expect( 2 );
	var el = $( "#dimensions" );

	equal( el.outerHeight(true), 98, "getter passthru w/ margin" );
	el.hide();
	equal( el.outerHeight(true), 98, "getter passthru w/ margin when hidden" );
});

test( "outerHeight(true) - setter", function() {
	expect( 2 );
	var el = $( "#dimensions" );

	el.outerHeight( 90, true );
	equal( el.height(), 42, "height set properly" );
	el.hide();
	el.outerHeight( 80, true );
	equal( el.height(), 32, "height set properly when hidden" );
});

test( "uniqueId / removeUniqueId", function() {
	expect( 3 );
	var el = $( "img" ).eq( 0 );

	// support: jQuery <1.6.2
	// support: IE <8
	// We should use strictEqual( id, undefined ) when dropping jQuery 1.6.1 support (or IE6/7)
	ok( !el.attr( "id" ), "element has no initial id" );
	el.uniqueId();
	ok( /ui-id-\d+$/.test( el.attr( "id" ) ), "element has generated id" );
	el.removeUniqueId();
	// support: jQuery <1.6.2
	// support: IE <8
	// see above
	ok( !el.attr( "id" ), "unique id has been removed from element" );
});

})( jQuery );
