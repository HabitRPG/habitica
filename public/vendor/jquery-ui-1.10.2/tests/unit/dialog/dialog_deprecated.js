module("dialog (deprecated): position option with string and array");

test( "position, right bottom on window w/array", function() {
	expect( 2 );

	// dialogs alter the window width and height in FF and IE7
	// so we collect that information before creating the dialog
	// Support: FF, IE7
	var winWidth = $( window ).width(),
		winHeight = $( window ).height(),
		element = $("<div></div>").dialog({ position: [ "right", "bottom" ] }),
		dialog = element.dialog("widget"),
		offset = dialog.offset();
	closeEnough( offset.left, winWidth - dialog.outerWidth() + $( window ).scrollLeft(), 1, "offset left of right bottom on window w/array" );
	closeEnough( offset.top, winHeight - dialog.outerHeight() + $( window ).scrollTop(), 1, "offset top of right bottom on window w/array" );
	element.remove();
});

test( "position, right bottom on window", function() {
	expect( 2 );

	// dialogs alter the window width and height in FF and IE7
	// so we collect that information before creating the dialog
	// Support: FF, IE7
	var winWidth = $( window ).width(),
		winHeight = $( window ).height(),
		element = $("<div></div>").dialog({ position: "right bottom" }),
		dialog = element.dialog("widget"),
		offset = dialog.offset();
	closeEnough( offset.left, winWidth - dialog.outerWidth() + $( window ).scrollLeft(), 1, "offset left of right bottom on window" );
	closeEnough( offset.top, winHeight - dialog.outerHeight() + $( window ).scrollTop(), 1, "offset top of right bottom on window" );
	element.remove();
});

test("position, offset from top left w/array", function() {
	expect( 2 );
	var element = $("<div></div>").dialog({ position: [10, 10] }),
		dialog = element.dialog("widget"),
		offset = dialog.offset();
	closeEnough(offset.left, 10 + $(window).scrollLeft(), 1);
	closeEnough(offset.top, 10 + $(window).scrollTop(), 1);
	element.remove();
});

test("position, top on window", function() {
	expect( 2 );
	var element = $("<div></div>").dialog({ position: "top" }),
		dialog = element.dialog("widget"),
		offset = dialog.offset();
	closeEnough(offset.left, Math.round($(window).width() / 2 - dialog.outerWidth() / 2) + $(window).scrollLeft(), 1);
	closeEnough(offset.top, $(window).scrollTop(), 1);
	element.remove();
});

test("position, left on window", function() {
	expect( 2 );
	var element = $("<div></div>").dialog({ position: "left" }),
		dialog = element.dialog("widget"),
		offset = dialog.offset();
	closeEnough(offset.left, 0, 1);
	closeEnough(offset.top, Math.round($(window).height() / 2 - dialog.outerHeight() / 2) + $(window).scrollTop(), 1);
	element.remove();
});
