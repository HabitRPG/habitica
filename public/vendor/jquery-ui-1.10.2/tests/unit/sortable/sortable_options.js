/*
 * sortable_options.js
 */
(function($) {

module("sortable: options");

/*
test("{ appendTo: 'parent' }, default", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ appendTo: Selector }", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ axis: false }, default", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ axis: 'x' }", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ axis: 'y' }", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ axis: ? }, unexpected", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ cancel: 'input,textarea,button,select,option' }, default", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ cancel: Selector }", function() {
	ok(false, "missing test - untested code is broken code.");
});
*/

test( "#8792: issues with floated items in connected lists", function() {
	expect( 2 );

	var element,
		changeCount = 0;

	$( "#qunit-fixture" )
		.html( "<ul class='c'><li>a</li><li>a</li></ul><ul class='c'><li>a</li><li>a</li></ul>" )
		.find( "ul" ).css({ "float": "left", width: "100px" }).end()
		.find( "li" ).css({ "float": "left", width: "50px", height: "50px" });

	$( "#qunit-fixture .c" ).sortable({
		connectWith: "#qunit-fixture .c",
		change: function() {
			changeCount++;
		}
	});

	element = $( "#qunit-fixture li:eq(0)" );

	element.simulate( "drag", {
		dx: 51,
		moves: 15
	});

	equal( changeCount, 1, "change fired only once (no jitters) when dragging a floated sortable in it's own container" );

	element.simulate( "drag", {
		dx: 50,
		moves: 15
	});

	equal( changeCount, 3, "change fired once for each expected change when dragging a floated sortable to a connected container" );
});

/*
test("{ connectWith: false }, default", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ connectWith: Selector }", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ containment: false }, default", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ containment: Element }", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ containment: 'document' }", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ containment: 'parent' }", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ containment: 'window' }", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ containment: Selector }", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ cursor: 'auto' }, default", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ cursor: 'move' }", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ cursorAt: false }, default", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ cursorAt: true }", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ delay: 0 }, default", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ delay: 100 }", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ distance: 1 }, default", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ distance: 10 }", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ dropOnEmpty: true }, default", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ dropOnEmpty: false }", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ forcePlaceholderSize: false }, default", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ forcePlaceholderSize: true }", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ forceHelperSize: false }, default", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ forceHelperSize: true }", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ grid: false }, default", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ grid: [17, 3] }", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ grid: [3, 7] }", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ handle: false }, default", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ handle: Element }", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ handle: Selector }", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ helper: 'original' }, default", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ helper: Function }", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ items: '> *' }, default", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ items: Selector }", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ opacity: false }, default", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ opacity: .37 }", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ opacity: 1 }", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ placeholder: false }, default", function() {
	ok(false, "missing test - untested code is broken code.");
});
*/

test( "{ placeholder: false } img", function() {
	expect( 3 );

	var element = $( "#sortable-images" ).sortable({
		start: function( event, ui ) {
			equal( ui.placeholder.attr( "src" ), "../images/jqueryui_32x32.png", "placeholder img has correct src" );
			equal( ui.placeholder.height(), 32, "placeholder has correct height" );
			equal( ui.placeholder.width(), 32, "placeholder has correct width" );
		}
	});

	element.find( "img" ).eq( 0 ).simulate( "drag", {
		dy: 1
	});
});

test( "{ placeholder: String }", function() {
	expect( 1 );

	var element = $( "#sortable" ).sortable({
		placeholder: "test",
		start: function( event, ui ) {
			ok( ui.placeholder.hasClass( "test" ), "placeholder has class" );
		}
	});

	element.find( "li" ).eq( 0 ).simulate( "drag", {
		dy: 1
	});
});

test( "{ placholder: String } tr", function() {
	expect( 3 );

	var element = $( "#sortable-table tbody" ).sortable({
		placeholder: "test",
		start: function( event, ui ) {
			ok( ui.placeholder.hasClass( "test" ), "placeholder has class" );
			equal( ui.placeholder.children().length, 1, "placeholder tr contains a td" );
			equal( ui.placeholder.children().html(), $( "<span>&#160;</span>" ).html(),
				"placeholder td has content for forced dimensions" );
		}
	});

	element.find( "tr" ).eq( 0 ).simulate( "drag", {
		dy: 1
	});
});

/*
test("{ revert: false }, default", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ revert: true }", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ scroll: true }, default", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ scroll: false }", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ scrollSensitivity: 20 }, default", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ scrollSensitivity: 2 }", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ scrollSensitivity: 200 }", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ scrollSpeed: 20 }, default", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ scrollSpeed: 2 }", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ scrollSpeed: 200 }", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ scope: 'default' }, default", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ scope: ??? }, unexpected", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ tolerance: 'intersect' }, default", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ tolerance: 'pointer' }", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ zIndex: 1000 }, default", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ zIndex: 1 }", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("{ zIndex: false }", function() {
	ok(false, "missing test - untested code is broken code.");
});
*/
})(jQuery);
