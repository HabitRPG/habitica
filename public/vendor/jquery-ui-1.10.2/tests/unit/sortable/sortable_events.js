/*
 * sortable_events.js
 */
(function($) {

module("sortable: events");

test("start", function() {
	expect( 7 );

	var hash;
	$("#sortable").sortable({
		start: function( e, ui ) {
			hash = ui;
		}
	}).find("li:eq(0)").simulate( "drag", {
		dy: 10
	});

	ok(hash, "start event triggered");
	ok(hash.helper, "UI hash includes: helper");
	ok(hash.placeholder, "UI hash includes: placeholder");
	ok(hash.item, "UI hash includes: item");
	ok(!hash.sender, "UI hash does not include: sender");

	// todo: see if these events should actually have sane values in them
	ok("position" in hash, "UI hash includes: position");
	ok("offset" in hash, "UI hash includes: offset");


});

test("sort", function() {
	expect( 7 );

	var hash;
	$("#sortable").sortable({
		sort: function( e, ui ) {
			hash = ui;
		}
	}).find("li:eq(0)").simulate( "drag", {
		dy: 10
	});

	ok(hash, "sort event triggered");
	ok(hash.helper, "UI hash includes: helper");
	ok(hash.placeholder, "UI hash includes: placeholder");
	ok(hash.position && ("top" in hash.position && "left" in hash.position), "UI hash includes: position");
	ok(hash.offset && (hash.offset.top && hash.offset.left), "UI hash includes: offset");
	ok(hash.item, "UI hash includes: item");
	ok(!hash.sender, "UI hash does not include: sender");

});

test("change", function() {
	expect( 8 );

	var hash;
	$("#sortable").sortable({
		change: function( e, ui ) {
			hash = ui;
		}
	}).find("li:eq(0)").simulate( "drag", {
		dx: 1,
		dy: 1
	});

	ok(!hash, "1px drag, change event should not be triggered");

	$("#sortable").sortable({
		change: function( e, ui ) {
			hash = ui;
		}
	}).find("li:eq(0)").simulate( "drag", {
		dy: 22
	});

	ok(hash, "change event triggered");
	ok(hash.helper, "UI hash includes: helper");
	ok(hash.placeholder, "UI hash includes: placeholder");
	ok(hash.position && ("top" in hash.position && "left" in hash.position), "UI hash includes: position");
	ok(hash.offset && (hash.offset.top && hash.offset.left), "UI hash includes: offset");
	ok(hash.item, "UI hash includes: item");
	ok(!hash.sender, "UI hash does not include: sender");

});

test("beforeStop", function() {
	expect( 7 );

	var hash;
	$("#sortable").sortable({
		beforeStop: function( e, ui ) {
			hash = ui;
		}
	}).find("li:eq(0)").simulate( "drag", {
		dy: 20
	});

	ok(hash, "beforeStop event triggered");
	ok(hash.helper, "UI hash includes: helper");
	ok(hash.placeholder, "UI hash includes: placeholder");
	ok(hash.position && ("top" in hash.position && "left" in hash.position), "UI hash includes: position");
	ok(hash.offset && (hash.offset.top && hash.offset.left), "UI hash includes: offset");
	ok(hash.item, "UI hash includes: item");
	ok(!hash.sender, "UI hash does not include: sender");

});

test("stop", function() {
	expect( 7 );

	var hash;
	$("#sortable").sortable({
		stop: function( e, ui ) {
			hash = ui;
		}
	}).find("li:eq(0)").simulate( "drag", {
		dy: 20
	});

	ok(hash, "stop event triggered");
	ok(!hash.helper, "UI should not include: helper");
	ok(hash.placeholder, "UI hash includes: placeholder");
	ok(hash.position && ("top" in hash.position && "left" in hash.position), "UI hash includes: position");
	ok(hash.offset && (hash.offset.top && hash.offset.left), "UI hash includes: offset");
	ok(hash.item, "UI hash includes: item");
	ok(!hash.sender, "UI hash does not include: sender");

});

test("update", function() {
	expect( 8 );

	var hash;
	$("#sortable").sortable({
		update: function( e, ui ) {
			hash = ui;
		}
	}).find("li:eq(0)").simulate( "drag", {
		dx: 1,
		dy: 1
	});

	ok(!hash, "1px drag, update event should not be triggered");

	$("#sortable").sortable({
		update: function( e, ui ) {
			hash = ui;
		}
	}).find("li:eq(0)").simulate( "drag", {
		dy: 22
	});

	ok(hash, "update event triggered");
	ok(!hash.helper, "UI hash should not include: helper");
	ok(hash.placeholder, "UI hash includes: placeholder");
	ok(hash.position && ("top" in hash.position && "left" in hash.position), "UI hash includes: position");
	ok(hash.offset && (hash.offset.top && hash.offset.left), "UI hash includes: offset");
	ok(hash.item, "UI hash includes: item");
	ok(!hash.sender, "UI hash does not include: sender");

});

test("#3019: Stop fires too early", function() {
	expect(2);

	var helper = null,
		el = $("#sortable").sortable({
			stop: function(event, ui) {
				helper = ui.helper;
			}
		});

	TestHelpers.sortable.sort($("li", el)[0], 0, 44, 2, "Dragging the sortable");
	equal(helper, null, "helper should be false");

});

test("#4752: link event firing on sortable with connect list", function () {
	expect( 10 );

	var fired = {},
		hasFired = function (type) { return (type in fired) && (true === fired[type]); };

	$("#sortable").clone().attr("id", "sortable2").insertAfter("#sortable");

	$("#qunit-fixture ul").sortable({
		connectWith: "#qunit-fixture ul",
		change: function () {
			fired.change = true;
		},
		receive: function () {
			fired.receive = true;
		},
		remove: function () {
			fired.remove = true;
		}
	});

	$("#qunit-fixture ul").bind("click.ui-sortable-test", function () {
		fired.click = true;
	});

	$("#sortable li:eq(0)").simulate("click");
	ok(!hasFired("change"), "Click only, change event should not have fired");
	ok(hasFired("click"), "Click event should have fired");

	// Drag an item within the first list
	fired = {};
	$("#sortable li:eq(0)").simulate("drag", { dx: 0, dy: 40 });
	ok(hasFired("change"), "40px drag, change event should have fired");
	ok(!hasFired("receive"), "Receive event should not have fired");
	ok(!hasFired("remove"), "Remove event should not have fired");
	ok(!hasFired("click"), "Click event should not have fired");

	// Drag an item from the first list to the second, connected list
	fired = {};
	$("#sortable li:eq(0)").simulate("drag", { dx: 0, dy: 150 });
	ok(hasFired("change"), "150px drag, change event should have fired");
	ok(hasFired("receive"), "Receive event should have fired");
	ok(hasFired("remove"), "Remove event should have fired");
	ok(!hasFired("click"), "Click event should not have fired");
});

/*
test("receive", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("remove", function() {
	ok(false, "missing test - untested code is broken code.");
});
*/

test( "over", function() {
	expect( 8 );

	var hash,
		overCount = 0;

	$( "#sortable" ).sortable({
		over: function( e, ui ) {
			hash = ui;
			overCount++;
		}
	}).find( "li:eq(0)" ).simulate( "drag", {
		dy: 20
	});

	ok( hash, "stop event triggered" );
	ok( hash.helper, "UI should not include: helper" );
	ok( hash.placeholder, "UI hash includes: placeholder" );
	ok( hash.position && ( "top" in hash.position && "left" in hash.position ), "UI hash includes: position" );
	ok( hash.offset && ( hash.offset.top && hash.offset.left ), "UI hash includes: offset" );
	ok( hash.item, "UI hash includes: item" );
	ok( hash.sender, "UI hash does not include: sender" );
	equal( overCount, 1, "over fires only once" );
});

/*
test("out", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("activate", function() {
	ok(false, "missing test - untested code is broken code.");
});

test("deactivate", function() {
	ok(false, "missing test - untested code is broken code.");
});
*/

})(jQuery);
