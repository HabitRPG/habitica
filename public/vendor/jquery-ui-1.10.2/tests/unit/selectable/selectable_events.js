/*
 * selectable_events.js
 */
(function( $ ) {

module("selectable: events");

test( "start", function() {
	expect( 2 );
	var el = $("#selectable1");
	el.selectable({
		start: function() {
			ok( true, "drag fired start callback" );
			equal( this, el[0], "context of callback" );
		}
	});
	el.simulate( "drag", {
		dx: 20,
		dy: 20
	});
});

test( "stop", function() {
	expect( 2 );
	var el = $("#selectable1");
	el.selectable({
		start: function() {
			ok( true, "drag fired stop callback" );
			equal( this, el[0], "context of callback" );
		}
	});
	el.simulate( "drag", {
		dx: 20,
		dy: 20
	});
});

test( "mousedown: initial position of helper", function() {
	expect( 2 );

	var contentToForceScroll, helper,
		element = $("#selectable1").selectable();

	contentToForceScroll = $("<div>").css({
		height: "10000px",
		width: "10000px"
	});

	contentToForceScroll.appendTo("body");
	$( window ).scrollTop( 1 ).scrollLeft( 1 );
	element.simulate( "mousedown", {
		clientX: 10,
		clientY: 10
	});

	helper = $(".ui-selectable-helper");
	equal( helper.css("top"), "11px", "Scroll top should be accounted for." );
	equal( helper.css("left"), "11px", "Scroll left should be accounted for." );

	// Cleanup
	element.simulate("mouseup");
	contentToForceScroll.remove();
	$( window ).scrollTop( 0 ).scrollLeft( 0 );
});

})( jQuery );
