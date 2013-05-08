/*
 * draggable_methods.js
 */
(function( $ ) {

var element;

module( "draggable: methods", {
	setup: function() {
		element = $("<div style='background: green; width: 200px; height: 100px; position: absolute; top: 10px; left: 10px;'><span>Absolute</span></div>").appendTo("#qunit-fixture");
	},
	teardown: function() {
		element.remove();
	}
});

test( "init", function() {
	expect( 5 );

	element.draggable();
	ok( true, ".draggable() called on element" );

	$([]).draggable();
	ok( true, ".draggable() called on empty collection" );

	$("<div></div>").draggable();
	ok( true, ".draggable() called on disconnected DOMElement" );

	element.draggable( "option", "foo" );
	ok( true, "arbitrary option getter after init" );

	element.draggable( "option", "foo", "bar" );
	ok( true, "arbitrary option setter after init" );
});

test( "destroy", function() {
	expect( 4 );

	element.draggable().draggable("destroy");
	ok( true, ".draggable('destroy') called on element" );

	$([]).draggable().draggable("destroy");
	ok( true, ".draggable('destroy') called on empty collection" );

	element.draggable().draggable("destroy");
	ok( true, ".draggable('destroy') called on disconnected DOMElement" );

	var expected = element.draggable(),
		actual = expected.draggable("destroy");
	equal( actual, expected, "destroy is chainable" );
});

test( "enable", function() {
	expect( 7 );

	element.draggable({ disabled: true });
	TestHelpers.draggable.shouldNotMove( element, ".draggable({ disabled: true })" );

	element.draggable("enable");
	TestHelpers.draggable.shouldMove( element, ".draggable('enable')" );
	equal( element.draggable( "option", "disabled" ), false, "disabled option getter" );

	element.draggable("destroy");
	element.draggable({ disabled: true });
	TestHelpers.draggable.shouldNotMove( element, ".draggable({ disabled: true })" );

	element.draggable( "option", "disabled", false );
	equal(element.draggable( "option", "disabled" ), false, "disabled option setter" );
	TestHelpers.draggable.shouldMove( element, ".draggable('option', 'disabled', false)" );

	var expected = element.draggable(),
		actual = expected.draggable("enable");
	equal( actual, expected, "enable is chainable" );
});

test( "disable", function() {
	expect( 7 );

	element = $("#draggable2").draggable({ disabled: false });
	TestHelpers.draggable.shouldMove( element, ".draggable({ disabled: false })" );

	element.draggable("disable");
	TestHelpers.draggable.shouldNotMove( element, ".draggable('disable')" );
	equal( element.draggable( "option", "disabled" ), true, "disabled option getter" );

	element.draggable("destroy");
	element.draggable({ disabled: false });
	TestHelpers.draggable.shouldMove( element, ".draggable({ disabled: false })" );

	element.draggable( "option", "disabled", true );
	equal( element.draggable( "option", "disabled" ), true, "disabled option setter" );
	TestHelpers.draggable.shouldNotMove( element, ".draggable('option', 'disabled', true)" );

	var expected = element.draggable(),
		actual = expected.draggable("disable");
	equal( actual, expected, "disable is chainable" );
});

})( jQuery );
