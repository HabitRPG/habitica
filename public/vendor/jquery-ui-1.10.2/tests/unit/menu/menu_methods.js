(function( $ ) {

var log = TestHelpers.menu.log,
	logOutput = TestHelpers.menu.logOutput,
	click = TestHelpers.menu.click;

module( "menu: methods", {
	setup: function() {
		TestHelpers.menu.clearLog();
	}
});

test( "destroy", function() {
	expect( 4 );
	domEqual( "#menu1", function() {
		$( "#menu1" ).menu().menu( "destroy" );
	});
	domEqual( "#menu2", function() {
		$( "#menu2" ).menu().menu( "destroy" );
	});
	domEqual( "#menu5", function() {
		$( "#menu5").menu().menu( "destroy" );
	});
	domEqual( "#menu6", function() {
		$( "#menu6" ).menu().menu( "destroy" );
	});
});

test( "enable/disable", function() {
	expect( 3 );
	var element = $( "#menu1" ).menu({
		select: function() {
			log();
		}
	});
	element.menu( "disable" );
	ok( element.is( ".ui-state-disabled" ), "Missing ui-state-disabled class" );
	log( "click", true );
	click( element, "1" );
	log( "afterclick" );
	element.menu( "enable" );
	ok( element.not( ".ui-state-disabled" ), "Has ui-state-disabled class" );
	log( "click" );
	click( element, "1" );
	log( "afterclick" );
	equal( logOutput(), "click,afterclick,click,1,afterclick", "Click order not valid." );
});

test( "refresh", function() {
	expect( 5 );
	var element = $( "#menu1" ).menu();
	equal( element.find( ".ui-menu-item" ).length, 5, "Incorrect number of menu items" );
	element.append( "<li><a href='#'>test item</a></li>" ).menu( "refresh" );
	equal( element.find( ".ui-menu-item" ).length, 6, "Incorrect number of menu items" );
	element.find( ".ui-menu-item:last" ).remove().end().menu( "refresh" );
	equal( element.find( ".ui-menu-item" ).length, 5, "Incorrect number of menu items" );
	element.append( "<li>---</li>" ).menu( "refresh" );
	equal( element.find( ".ui-menu-item" ).length, 5, "Incorrect number of menu items" );
	element.children( ":last" ).remove().end().menu( "refresh" );
	equal( element.find( ".ui-menu-item" ).length, 5, "Incorrect number of menu items" );
});

test( "refresh submenu", function() {
	expect( 2 );
	var element = $( "#menu2" ).menu();
	equal( element.find( "ul:first .ui-menu-item" ).length, 3 );
	element.find( "ul" ).addBack().append( "<li><a href=\"#\">New Item</a></li>" );
	element.menu("refresh");
	equal( element.find( "ul:first .ui-menu-item" ).length, 4 );
});

test( "widget", function() {
	expect( 2 );
	var element = $( "#menu1" ).menu(),
		widgetElement = element.menu( "widget" );
	equal( widgetElement.length, 1, "one element" );
	strictEqual( widgetElement[ 0 ], element[ 0 ], "same element" );
});

// TODO: test focus method

// TODO: test blur method

// TODO: test collapseAll method

// TODO: test collapse method

// TODO: test expand method

// TODO: test next method

// TODO: test prev method

// TODO: test isFirstItem method

// TODO: test isLastItem method

// TODO: test nextPage method

// TODO: test prevPage method

// TODO: test select method

})( jQuery );
