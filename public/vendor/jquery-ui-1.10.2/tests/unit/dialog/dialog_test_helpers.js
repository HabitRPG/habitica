TestHelpers.dialog = {
	drag: function(element, handle, dx, dy) {
		var d = element.dialog("widget");
		//this mouseover is to work around a limitation in resizable
		//TODO: fix resizable so handle doesn't require mouseover in order to be used
		$( handle, d ).simulate("mouseover").simulate( "drag", {
			dx: dx,
			dy: dy
		});
	},
	testDrag: function(element, dx, dy, expectedDX, expectedDY, msg) {
		var actualDX, actualDY, offsetAfter,
			d = element.dialog("widget"),
			handle = $(".ui-dialog-titlebar", d),
			offsetBefore = d.offset();

		TestHelpers.dialog.drag(element, handle, dx, dy);

		offsetAfter = d.offset();

		msg = msg ? msg + "." : "";

		actualDX = offsetAfter.left - offsetBefore.left;
		actualDY = offsetAfter.top - offsetBefore.top;
		ok( expectedDX - actualDX <= 1 && expectedDY - actualDY <= 1, "dragged[" + expectedDX + ", " + expectedDY + "] " + msg);
	},
	shouldResize: function(element, dw, dh, msg) {
		var heightAfter, widthAfter, actual, expected,
			d = element.dialog("widget"),
			handle = $(".ui-resizable-se", d),
			heightBefore = d.height(),
			widthBefore = d.width();

		TestHelpers.dialog.drag(element, handle, 50, 50);

		heightAfter = d.height();
		widthAfter = d.width();

		msg = msg ? msg + "." : "";
		actual = { width: widthAfter, height: heightAfter },
		expected = { width: widthBefore + dw, height: heightBefore + dh };
		deepEqual(actual, expected, "resized[" + 50 + ", " + 50 + "] " + msg);
	}
};
