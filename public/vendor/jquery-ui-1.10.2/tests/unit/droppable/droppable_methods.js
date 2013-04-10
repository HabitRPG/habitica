/*
 * droppable_methods.js
 */
(function($) {

module("droppable: methods");

test("init", function() {
	expect( 5 );

	$("<div></div>").appendTo("body").droppable().remove();
	ok(true, ".droppable() called on element");

	$([]).droppable();
	ok(true, ".droppable() called on empty collection");

	$("<div></div>").droppable();
	ok(true, ".droppable() called on disconnected DOMElement");

	$("<div></div>").droppable().droppable("option", "foo");
	ok(true, "arbitrary option getter after init");

	$("<div></div>").droppable().droppable("option", "foo", "bar");
	ok(true, "arbitrary option setter after init");
});

test("destroy", function() {
	expect( 4 );

	$("<div></div>").appendTo("body").droppable().droppable("destroy").remove();
	ok(true, ".droppable('destroy') called on element");

	$([]).droppable().droppable("destroy");
	ok(true, ".droppable('destroy') called on empty collection");

	$("<div></div>").droppable().droppable("destroy");
	ok(true, ".droppable('destroy') called on disconnected DOMElement");

	var expected = $("<div></div>").droppable(),
		actual = expected.droppable("destroy");
	equal(actual, expected, "destroy is chainable");
});

test("enable", function() {
	expect(7);

	var el, expected, actual;

	el = $("#droppable1").droppable({ disabled: true });
	TestHelpers.droppable.shouldNotDrop();
	el.droppable("enable");
	TestHelpers.droppable.shouldDrop();
	equal(el.droppable("option", "disabled"), false, "disabled option getter");
	el.droppable("destroy");
	el.droppable({ disabled: true });
	TestHelpers.droppable.shouldNotDrop();
	el.droppable("option", "disabled", false);
	equal(el.droppable("option", "disabled"), false, "disabled option setter");
	TestHelpers.droppable.shouldDrop();

	expected = $("<div></div>").droppable(),
	actual = expected.droppable("enable");
	equal(actual, expected, "enable is chainable");
});

test("disable", function() {
	expect(7);

	var el, actual, expected;

	el = $("#droppable1").droppable({ disabled: false });
	TestHelpers.droppable.shouldDrop();
	el.droppable("disable");
	TestHelpers.droppable.shouldNotDrop();
	equal(el.droppable("option", "disabled"), true, "disabled option getter");
	el.droppable("destroy");
	el.droppable({ disabled: false });
	TestHelpers.droppable.shouldDrop();
	el.droppable("option", "disabled", true);
	equal(el.droppable("option", "disabled"), true, "disabled option setter");
	TestHelpers.droppable.shouldNotDrop();

	expected = $("<div></div>").droppable(),
	actual = expected.droppable("disable");
	equal(actual, expected, "disable is chainable");
});

})(jQuery);
