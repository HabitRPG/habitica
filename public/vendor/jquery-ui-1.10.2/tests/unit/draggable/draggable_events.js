/*
 * draggable_events.js
 */
(function( $ ) {

var element;

module( "draggable: events", {
	setup: function() {
		element = $("<div>").appendTo("#qunit-fixture");
	},
	teardown: function() {
		element.draggable("destroy");
	}
});

test( "callbacks occurrence count", function() {
	expect( 3 );

	var start = 0,
		stop = 0,
		dragc = 0;

	element.draggable({
		start: function() {
			start++;
		},
		drag: function() {
			dragc++;
		},
		stop: function() {
			stop++;
		}
	});

	element.simulate( "drag", {
		dx: 10,
		dy: 10
	});

	equal( start, 1, "start callback should happen exactly once" );
	equal( dragc, 3, "drag callback should happen exactly once per mousemove" );
	equal( stop, 1, "stop callback should happen exactly once" );
});

test( "stopping the start callback", function() {
	expect( 3 );

	var start = 0,
		stop = 0,
		dragc = 0;

	element.draggable({
		start: function() {
			start++;
			return false;
		},
		drag: function() {
			dragc++;
		},
		stop: function() {
			stop++;
		}
	});

	element.simulate( "drag", {
		dx: 10,
		dy: 10
	});

	equal( start, 1, "start callback should happen exactly once" );
	equal( dragc, 0, "drag callback should not happen at all" );
	equal( stop, 0, "stop callback should not happen if there wasnt even a start" );
});

test( "stopping the drag callback", function() {
	expect( 2 );

	var start = 0,
		stop = 0,
		dragc = 0;

	element.draggable({
		start: function() {
			start++;
		},
		drag: function() {
			dragc++;
			return false;
		},
		stop: function() {
			stop++;
		}
	});

	element.simulate( "drag", {
		dx: 10,
		dy: 10
	});

	equal( start, 1, "start callback should happen exactly once" );
	equal( stop, 1, "stop callback should happen, as we need to actively stop the drag" );
});

test( "stopping the stop callback", function() {
	expect( 1 );

	element.draggable({
		helper: "clone",
		stop: function() {
			return false;
		}
	});

	element.simulate( "drag", {
		dx: 10,
		dy: 10
	});

	ok( element.data("ui-draggable").helper, "the clone should not be deleted if the stop callback is stopped" );


});

})( jQuery );
