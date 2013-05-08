(function( $ ) {

var equalHeight = TestHelpers.accordion.equalHeight,
	setupTeardown = TestHelpers.accordion.setupTeardown,
	state = TestHelpers.accordion.state;

module( "accordion: methods", setupTeardown() );

test( "destroy", function() {
	expect( 1 );
	domEqual( "#list1", function() {
		$( "#list1" ).accordion().accordion( "destroy" );
	});
});

test( "enable/disable", function() {
	expect( 4 );
	var element = $( "#list1" ).accordion();
	state( element, 1, 0, 0 );
	element.accordion( "disable" );
	// event does nothing
	element.find( ".ui-accordion-header" ).eq( 1 ).trigger( "click" );
	state( element, 1, 0, 0 );
	// option still works
	element.accordion( "option", "active", 1 );
	state( element, 0, 1, 0 );
	element.accordion( "enable" );
	element.accordion( "option", "active", 2 );
	state( element, 0, 0, 1 );
});

test( "refresh", function() {
	expect( 17 );
	var element = $( "#navigation" )
		.parent()
			.height( 300 )
		.end()
		.accordion({
			heightStyle: "fill"
		});
	equalHeight( element, 255 );

	element.parent().height( 500 );
	element.accordion( "refresh" );
	equalHeight( element, 455 );

	element = $( "#list1" );
	element.accordion();
	state( element, 1, 0, 0 );

	// disable panel via markup
	element.find( "h3.bar" ).eq( 1 ).addClass( "ui-state-disabled" );
	element.accordion( "refresh" );
	state( element, 1, 0, 0 );

	// don't add multiple icons
	element.accordion( "refresh" );
	equal( element.find( ".ui-accordion-header-icon" ).length, 3 );

	// add a panel
	element
		.append("<h3 class='bar' id='new_1'>new 1</h3>")
		.append("<div class='foo' id='new_1_panel'>new 1</div>");
	element.accordion( "refresh" );
	state( element, 1, 0, 0, 0 );

	// remove all tabs
	element.find( "h3.bar, div.foo" ).remove();
	element.accordion( "refresh" );
	state( element );
	equal( element.accordion( "option", "active" ), false, "no active accordion panel" );

	// add panels
	element
		.append("<h3 class='bar' id='new_2'>new 2</h3>")
		.append("<div class='foo' id='new_2_panel'>new 2</div>")
		.append("<h3 class='bar' id='new_3'>new 3</h3>")
		.append("<div class='foo' id='new_3_panel'>new 3</div>")
		.append("<h3 class='bar' id='new_4'>new 4</h3>")
		.append("<div class='foo' id='new_4_panel'>new 4</div>")
		.append("<h3 class='bar' id='new_5'>new 5</h3>")
		.append("<div class='foo' id='new_5_panel'>new 5</div>");
	element.accordion( "refresh" );
	state( element, 1, 0, 0, 0 );

	// activate third tab
	element.accordion( "option", "active", 2 );
	state( element, 0, 0, 1, 0 );

	// remove fourth panel, third panel should stay active
	element.find( "h3.bar" ).eq( 3 ).remove();
	element.find( "div.foo" ).eq( 3 ).remove();
	element.accordion( "refresh" );
	state( element, 0, 0, 1 );

	// remove third (active) panel, second panel should become active
	element.find( "h3.bar" ).eq( 2 ).remove();
	element.find( "div.foo" ).eq( 2 ).remove();
	element.accordion( "refresh" );
	state( element, 0, 1 );

	// remove first panel, previously active panel (now first) should stay active
	element.find( "h3.bar" ).eq( 0 ).remove();
	element.find( "div.foo" ).eq( 0 ).remove();
	element.accordion( "refresh" );
	state( element, 1 );
});

test( "widget", function() {
	expect( 2 );
	var element = $( "#list1" ).accordion(),
		widgetElement = element.accordion( "widget" );
	equal( widgetElement.length, 1, "one element" );
	strictEqual( widgetElement[ 0 ], element[ 0 ], "same element" );
});

}( jQuery ) );
