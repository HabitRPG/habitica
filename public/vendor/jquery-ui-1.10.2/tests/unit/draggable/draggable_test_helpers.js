TestHelpers.draggable = {
	// todo: remove the unreliable offset hacks
	unreliableOffset: $.ui.ie && ( !document.documentMode || document.documentMode < 8 ) ? 2 : 0,
	testDrag: function(el, handle, dx, dy, expectedDX, expectedDY, msg) {
		var offsetAfter, actual, expected,
			offsetBefore = el.offset();

		$( handle ).simulate( "drag", {
			dx: dx,
			dy: dy
		});
		offsetAfter = el.offset();

		actual = { left: offsetAfter.left, top: offsetAfter.top };
		expected = { left: offsetBefore.left + expectedDX, top: offsetBefore.top + expectedDY };

		msg = msg ? msg + "." : "";
		deepEqual(actual, expected, "dragged[" + dx + ", " + dy + "] " + msg);
	},
	shouldMove: function(el, why) {
		TestHelpers.draggable.testDrag(el, el, 50, 50, 50, 50, why);
	},
	shouldNotMove: function(el, why) {
		TestHelpers.draggable.testDrag(el, el, 50, 50, 0, 0, why);
	},
	testScroll: function(el, position ) {
		var oldPosition = $("#main").css("position");
		$("#main").css("position", position);
		TestHelpers.draggable.shouldMove(el, position+" parent");
		$("#main").css("position", oldPosition);
	},
	restoreScroll: function( what ) {
		if( what ) {
			$(document).scrollTop(0); $(document).scrollLeft(0);
		} else {
			$("#main").scrollTop(0); $("#main").scrollLeft(0);
		}
	},
	setScroll: function( what ) {
		if(what) {
			// todo: currently, the draggable interaction doesn't properly account for scrolled pages,
			// uncomment the line below to make the tests fail that should when the page is scrolled
			// $(document).scrollTop(100); $(document).scrollLeft(100);
		} else {
			$("#main").scrollTop(100); $("#main").scrollLeft(100);
		}
	},
	border: function(el, side) {
		return parseInt(el.css("border-" + side + "-width"), 10) || 0;
	},
	margin: function(el, side) {
		return parseInt(el.css("margin-" + side), 10) || 0;
	},
	move: function( el, x, y ) {

		$( el ).simulate( "drag", {
			dx: x,
			dy: y
		});

	},
	trackMouseCss : function( el ) {
		el.bind( "drag", function() {
			el.data( "last_dragged_cursor", $("body").css("cursor") );
		});
	},
	trackAppendedParent : function( el ) {

		// appendTo ignored without being clone
		el.draggable( "option", "helper", "clone" );

		el.bind( "drag", function(e,ui) {
			// Get what parent is at time of drag
			el.data( "last_dragged_parent", ui.helper.parent()[0] );
		});

	}
};