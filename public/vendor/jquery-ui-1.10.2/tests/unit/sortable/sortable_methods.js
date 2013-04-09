/*
 * sortable_methods.js
 */
(function($) {

module("sortable: methods");

test("init", function() {
	expect(5);

	$("<div></div>").appendTo("body").sortable().remove();
	ok(true, ".sortable() called on element");

	$([]).sortable();
	ok(true, ".sortable() called on empty collection");

	$("<div></div>").sortable();
	ok(true, ".sortable() called on disconnected DOMElement");

	$("<div></div>").sortable().sortable("option", "foo");
	ok(true, "arbitrary option getter after init");

	$("<div></div>").sortable().sortable("option", "foo", "bar");
	ok(true, "arbitrary option setter after init");
});

test("destroy", function() {
	expect(4);
	$("<div></div>").appendTo("body").sortable().sortable("destroy").remove();
	ok(true, ".sortable('destroy') called on element");

	$([]).sortable().sortable("destroy");
	ok(true, ".sortable('destroy') called on empty collection");

	$("<div></div>").sortable().sortable("destroy");
	ok(true, ".sortable('destroy') called on disconnected DOMElement");

	var expected = $("<div></div>").sortable(),
		actual = expected.sortable("destroy");
	equal(actual, expected, "destroy is chainable");
});

test("enable", function() {
	expect(5);

	var el, actual, expected;

	el = $("#sortable").sortable({ disabled: true });

	TestHelpers.sortable.sort($("li", el)[0], 0, 44, 0, ".sortable({ disabled: true })");

	el.sortable("enable");
	equal(el.sortable("option", "disabled"), false, "disabled option getter");

	el.sortable("destroy");
	el.sortable({ disabled: true });
	el.sortable("option", "disabled", false);
	equal(el.sortable("option", "disabled"), false, "disabled option setter");

	TestHelpers.sortable.sort($("li", el)[0], 0, 44, 2, ".sortable('option', 'disabled', false)");

	expected = $("<div></div>").sortable(),
	actual = expected.sortable("enable");
	equal(actual, expected, "enable is chainable");
});

test("disable", function() {
	expect(7);

	var el, actual, expected;

	el = $("#sortable").sortable({ disabled: false });
	TestHelpers.sortable.sort($("li", el)[0], 0, 44, 2, ".sortable({ disabled: false })");

	el.sortable("disable");
	TestHelpers.sortable.sort($("li", el)[0], 0, 44, 0, "disabled.sortable getter");

	el.sortable("destroy");

	el.sortable({ disabled: false });
	TestHelpers.sortable.sort($("li", el)[0], 0, 44, 2, ".sortable({ disabled: false })");
	el.sortable("option", "disabled", true);
	equal(el.sortable("option", "disabled"), true, "disabled option setter");
	ok(el.sortable("widget").is(":not(.ui-state-disabled)"), "sortable element does not get ui-state-disabled since it's an interaction");
	TestHelpers.sortable.sort($("li", el)[0], 0, 44, 0, ".sortable('option', 'disabled', true)");

	expected = $("<div></div>").sortable(),
	actual = expected.sortable("disable");
	equal(actual, expected, "disable is chainable");
});

})(jQuery);
