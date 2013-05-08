(function( $ ) {

module( "menu: core" );

test( "markup structure", function() {
	expect( 6 );
	var element = $( "#menu1" ).menu();
	ok( element.hasClass( "ui-menu" ), "main element is .ui-menu" );
	element.children().each(function( index ) {
		ok( $( this ).hasClass( "ui-menu-item" ), "child " + index + " is .ui-menu-item" );
	});
});

test( "accessibility", function () {
	expect( 4 );
	var element = $( "#menu1" ).menu();

	equal( element.attr( "role" ), "menu", "main role" );
	ok( !element.attr( "aria-activedescendant" ), "aria-activedescendant not set" );

	element.menu( "focus", $.Event(), element.children().eq( -2 ) );
	equal( element.attr( "aria-activedescendant" ), "testID1", "aria-activedescendant from existing id" );

	element.menu( "focus", $.Event(), element.children().eq( 0 ) );
	ok( /^ui-id-\d+$/.test( element.attr( "aria-activedescendant" ) ), "aria-activedescendant from generated id" );

	// Item roles are tested in the role option tests
});

})( jQuery );
