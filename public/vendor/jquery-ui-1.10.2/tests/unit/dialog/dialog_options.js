/*
 * dialog_options.js
 */
(function($) {

module("dialog: options");

test( "appendTo", function() {
	expect( 16 );
	var detached = $( "<div>" ),
		element = $( "#dialog1" ).dialog({
			modal: true
		});
	equal( element.dialog( "widget" ).parent()[0], document.body, "defaults to body" );
	equal( $( ".ui-widget-overlay" ).parent()[0], document.body, "overlay defaults to body" );
	element.dialog( "destroy" );

	element.dialog({
		appendTo: ".wrap",
		modal: true
	});
	equal( element.dialog( "widget" ).parent()[0], $( "#wrap1" )[0], "first found element" );
	equal( $( ".ui-widget-overlay" ).parent()[0], $( "#wrap1" )[0], "overlay first found element" );
	equal( $( "#wrap2 .ui-dialog" ).length, 0, "only appends to one element" );
	equal( $( "#wrap2 .ui-widget-overlay" ).length, 0, "overlay only appends to one element" );
	element.dialog( "destroy" );

	element.dialog({
		appendTo: null,
		modal: true
	});
	equal( element.dialog( "widget" ).parent()[0], document.body, "null" );
	equal( $( ".ui-widget-overlay" ).parent()[0], document.body, "overlay null" );
	element.dialog( "destroy" );

	element.dialog({
		autoOpen: false,
		modal: true
	}).dialog( "option", "appendTo", "#wrap1" ).dialog( "open" );
	equal( element.dialog( "widget" ).parent()[0], $( "#wrap1" )[0], "modified after init" );
	equal( $( ".ui-widget-overlay" ).parent()[0], $( "#wrap1" )[0], "overlay modified after init" );
	element.dialog( "destroy" );

	element.dialog({
		appendTo: detached,
		modal: true
	});
	equal( element.dialog( "widget" ).parent()[0], detached[0], "detached jQuery object" );
	equal( detached.find( ".ui-widget-overlay" ).parent()[0], detached[0], "overlay detached jQuery object" );
	element.dialog( "destroy" );

	element.dialog({
		appendTo: detached[0],
		modal: true
	});
	equal( element.dialog( "widget" ).parent()[0], detached[0], "detached DOM element" );
	equal( detached.find( ".ui-widget-overlay" ).parent()[0], detached[0], "overlay detached DOM element" );
	element.dialog( "destroy" );

	element.dialog({
		autoOpen: false,
		modal: true
	}).dialog( "option", "appendTo", detached );
	equal( element.dialog( "widget" ).parent()[0], detached[0], "detached DOM element via option()" );
	equal( detached.find( ".ui-widget-overlay" ).length, 0, "overlay detached DOM element via option()" );
	element.dialog( "destroy" );
});

test("autoOpen", function() {
	expect(2);

	var element = $("<div></div>").dialog({ autoOpen: false });
	ok( !element.dialog("widget").is(":visible"), ".dialog({ autoOpen: false })");
	element.remove();

	element = $("<div></div>").dialog({ autoOpen: true });
	ok( element.dialog("widget").is(":visible"), ".dialog({ autoOpen: true })");
	element.remove();
});

test("buttons", function() {
	expect(21);

	var btn, i, newButtons,
		buttons = {
			"Ok": function( ev ) {
				ok(true, "button click fires callback");
				equal(this, element[0], "context of callback");
				equal(ev.target, btn[0], "event target");
			},
			"Cancel": function( ev ) {
				ok(true, "button click fires callback");
				equal(this, element[0], "context of callback");
				equal(ev.target, btn[1], "event target");
			}
		},
		element = $("<div></div>").dialog({ buttons: buttons });

	btn = element.dialog( "widget" ).find( ".ui-dialog-buttonpane button" );
	equal(btn.length, 2, "number of buttons");

	i = 0;
	$.each(buttons, function( key ) {
		equal(btn.eq(i).text(), key, "text of button " + (i+1));
		i++;
	});

	ok(btn.parent().hasClass("ui-dialog-buttonset"), "buttons in container");
	ok(element.parent().hasClass("ui-dialog-buttons"), "dialog wrapper adds class about having buttons");

	btn.trigger("click");

	newButtons = {
		"Close": function( ev ) {
			ok(true, "button click fires callback");
			equal(this, element[0], "context of callback");
			equal(ev.target, btn[0], "event target");
		}
	};

	deepEqual(element.dialog("option", "buttons"), buttons, ".dialog('option', 'buttons') getter");
	element.dialog("option", "buttons", newButtons);
	deepEqual(element.dialog("option", "buttons"), newButtons, ".dialog('option', 'buttons', ...) setter");

	btn = element.dialog( "widget" ).find( ".ui-dialog-buttonpane button" );
	equal(btn.length, 1, "number of buttons after setter");
	btn.trigger("click");

	i = 0;
	$.each(newButtons, function( key ) {
		equal(btn.eq(i).text(), key, "text of button " + (i+1));
		i += 1;
	});

	element.dialog("option", "buttons", null);
	btn = element.dialog( "widget" ).find( ".ui-dialog-buttonpane button" );
	equal(btn.length, 0, "all buttons have been removed");
	equal(element.find(".ui-dialog-buttonset").length, 0, "buttonset has been removed");
	equal(element.parent().hasClass("ui-dialog-buttons"), false, "dialog wrapper removes class about having buttons");

	element.remove();
});

test("buttons - advanced", function() {
	expect( 7 );

	var buttons,
		element = $("<div></div>").dialog({
			buttons: [
				{
					text: "a button",
					"class": "additional-class",
					id: "my-button-id",
					click: function() {
						equal(this, element[0], "correct context");
					},
					icons: {
						primary: "ui-icon-cancel"
					},
					showText: false
				}
			]
		});

	buttons = element.dialog( "widget" ).find( ".ui-dialog-buttonpane button" );
	equal(buttons.length, 1, "correct number of buttons");
	equal(buttons.attr("id"), "my-button-id", "correct id");
	equal(buttons.text(), "a button", "correct label");
	ok(buttons.hasClass("additional-class"), "additional classes added");
	deepEqual( buttons.button("option", "icons"), { primary: "ui-icon-cancel", secondary: null } );
	equal( buttons.button( "option", "text" ), false );
	buttons.click();

	element.remove();
});

test("#9043: buttons with Array.prototype modification", function() {
	expect( 1 );
	Array.prototype.test = $.noop;
	var element = $( "<div></div>" ).dialog();
	equal( element.dialog( "widget" ).find( ".ui-dialog-buttonpane" ).length, 0,
		"no button pane" );
	element.remove();
	delete Array.prototype.test;
});

test("closeOnEscape", function() {
	expect( 6 );
	var element = $("<div></div>").dialog({ closeOnEscape: false });
	ok(true, "closeOnEscape: false");
	ok(element.dialog("widget").is(":visible") && !element.dialog("widget").is(":hidden"), "dialog is open before ESC");
	element.simulate("keydown", { keyCode: $.ui.keyCode.ESCAPE })
		.simulate("keypress", { keyCode: $.ui.keyCode.ESCAPE })
		.simulate("keyup", { keyCode: $.ui.keyCode.ESCAPE });
	ok(element.dialog("widget").is(":visible") && !element.dialog("widget").is(":hidden"), "dialog is open after ESC");

	element.remove();

	element = $("<div></div>").dialog({ closeOnEscape: true });
	ok(true, "closeOnEscape: true");
	ok(element.dialog("widget").is(":visible") && !element.dialog("widget").is(":hidden"), "dialog is open before ESC");
	element.simulate("keydown", { keyCode: $.ui.keyCode.ESCAPE })
		.simulate("keypress", { keyCode: $.ui.keyCode.ESCAPE })
		.simulate("keyup", { keyCode: $.ui.keyCode.ESCAPE });
	ok(element.dialog("widget").is(":hidden") && !element.dialog("widget").is(":visible"), "dialog is closed after ESC");
});

test("closeText", function() {
	expect(3);

	var element = $("<div></div>").dialog();
		equal(element.dialog("widget").find(".ui-dialog-titlebar-close span").text(), "close",
			"default close text");
	element.remove();

	element = $("<div></div>").dialog({ closeText: "foo" });
		equal(element.dialog("widget").find(".ui-dialog-titlebar-close span").text(), "foo",
			"closeText on init");
	element.remove();

	element = $("<div></div>").dialog().dialog("option", "closeText", "bar");
		equal(element.dialog("widget").find(".ui-dialog-titlebar-close span").text(), "bar",
			"closeText via option method");
	element.remove();
});

test("dialogClass", function() {
	expect( 6 );

	var element = $("<div></div>").dialog();
		equal(element.dialog("widget").is(".foo"), false, "dialogClass not specified. foo class added");
	element.remove();

	element = $("<div></div>").dialog({ dialogClass: "foo" });
		equal(element.dialog("widget").is(".foo"), true, "dialogClass in init. foo class added");
	element.dialog( "option", "dialogClass", "foobar" );
		equal( element.dialog("widget").is(".foo"), false, "dialogClass changed, previous one was removed" );
		equal( element.dialog("widget").is(".foobar"), true, "dialogClass changed, new one was added" );
	element.remove();

	element = $("<div></div>").dialog({ dialogClass: "foo bar" });
		equal(element.dialog("widget").is(".foo"), true, "dialogClass in init, two classes. foo class added");
		equal(element.dialog("widget").is(".bar"), true, "dialogClass in init, two classes. bar class added");
	element.remove();
});

test("draggable", function() {
	expect(4);

	var element = $("<div></div>").dialog({ draggable: false });

		TestHelpers.dialog.testDrag(element, 50, -50, 0, 0);
		element.dialog("option", "draggable", true);
		TestHelpers.dialog.testDrag(element, 50, -50, 50, -50);
	element.remove();

	element = $("<div></div>").dialog({ draggable: true });
		TestHelpers.dialog.testDrag(element, 50, -50, 50, -50);
		element.dialog("option", "draggable", false);
		TestHelpers.dialog.testDrag(element, 50, -50, 0, 0);
	element.remove();
});

test("height", function() {
	expect(4);

	var element = $("<div></div>").dialog();
		equal(element.dialog("widget").outerHeight(), 150, "default height");
	element.remove();

	element = $("<div></div>").dialog({ height: 237 });
		equal(element.dialog("widget").outerHeight(), 237, "explicit height");
	element.remove();

	element = $("<div></div>").dialog();
		element.dialog("option", "height", 238);
		equal(element.dialog("widget").outerHeight(), 238, "explicit height set after init");
	element.remove();

	element = $("<div></div>").css("padding", "20px")
		.dialog({ height: 240 });
		equal(element.dialog("widget").outerHeight(), 240, "explicit height with padding");
	element.remove();
});

asyncTest( "hide, #5860 - don't leave effects wrapper behind", function() {
	expect( 1 );
	$( "#dialog1" ).dialog({ hide: "clip" }).dialog( "close" ).dialog( "destroy" );
	setTimeout(function() {
		equal( $( ".ui-effects-wrapper" ).length, 0 );
		start();
	}, 500);
});

test("maxHeight", function() {
	expect(3);

	var element = $("<div></div>").dialog({ maxHeight: 200 });
		TestHelpers.dialog.drag(element, ".ui-resizable-s", 1000, 1000);
		closeEnough(element.dialog("widget").height(), 200, 1, "maxHeight");
	element.remove();

	element = $("<div></div>").dialog({ maxHeight: 200 });
		TestHelpers.dialog.drag(element, ".ui-resizable-n", -1000, -1000);
		closeEnough(element.dialog("widget").height(), 200, 1, "maxHeight");
	element.remove();

	element = $("<div></div>").dialog({ maxHeight: 200 }).dialog("option", "maxHeight", 300);
		TestHelpers.dialog.drag(element, ".ui-resizable-s", 1000, 1000);
		closeEnough(element.dialog("widget").height(), 300, 1, "maxHeight");
	element.remove();
});

test("maxWidth", function() {
	expect(3);

	var element = $("<div></div>").dialog({ maxWidth: 200 });
		TestHelpers.dialog.drag(element, ".ui-resizable-e", 1000, 1000);
		closeEnough(element.dialog("widget").width(), 200, 1, "maxWidth");
	element.remove();

	element = $("<div></div>").dialog({ maxWidth: 200 });
		TestHelpers.dialog.drag(element, ".ui-resizable-w", -1000, -1000);
		closeEnough(element.dialog("widget").width(), 200, 1, "maxWidth");
	element.remove();

	element = $("<div></div>").dialog({ maxWidth: 200 }).dialog("option", "maxWidth", 300);
		TestHelpers.dialog.drag(element, ".ui-resizable-w", -1000, -1000);
		closeEnough(element.dialog("widget").width(), 300, 1, "maxWidth");
	element.remove();
});

test("minHeight", function() {
	expect(3);

	var element = $("<div></div>").dialog({ minHeight: 10 });
		TestHelpers.dialog.drag(element, ".ui-resizable-s", -1000, -1000);
		closeEnough(element.dialog("widget").height(), 10, 1, "minHeight");
	element.remove();

	element = $("<div></div>").dialog({ minHeight: 10 });
		TestHelpers.dialog.drag(element, ".ui-resizable-n", 1000, 1000);
		closeEnough(element.dialog("widget").height(), 10, 1, "minHeight");
	element.remove();

	element = $("<div></div>").dialog({ minHeight: 10 }).dialog("option", "minHeight", 30);
		TestHelpers.dialog.drag(element, ".ui-resizable-n", 1000, 1000);
		closeEnough(element.dialog("widget").height(), 30, 1, "minHeight");
	element.remove();
});

test("minWidth", function() {
	expect(3);

	var element = $("<div></div>").dialog({ minWidth: 10 });
		TestHelpers.dialog.drag(element, ".ui-resizable-e", -1000, -1000);
		closeEnough(element.dialog("widget").width(), 10, 1, "minWidth");
	element.remove();

	element = $("<div></div>").dialog({ minWidth: 10 });
		TestHelpers.dialog.drag(element, ".ui-resizable-w", 1000, 1000);
		closeEnough(element.dialog("widget").width(), 10, 1, "minWidth");
	element.remove();

	element = $("<div></div>").dialog({ minWidth: 30 }).dialog("option", "minWidth", 30);
		TestHelpers.dialog.drag(element, ".ui-resizable-w", 1000, 1000);
		closeEnough(element.dialog("widget").width(), 30, 1, "minWidth");
	element.remove();
});

test( "position, default center on window", function() {
	expect( 2 );

	// dialogs alter the window width and height in FF and IE7
	// so we collect that information before creating the dialog
	// Support: FF, IE7
	var winWidth = $( window ).width(),
		winHeight = $( window ).height(),
		element = $("<div></div>").dialog(),
		dialog = element.dialog("widget"),
		offset = dialog.offset();
	closeEnough( offset.left, Math.round( winWidth / 2 - dialog.outerWidth() / 2 ) + $( window ).scrollLeft(), 1, "dialog left position of center on window on initilization" );
	closeEnough( offset.top, Math.round( winHeight / 2 - dialog.outerHeight() / 2 ) + $( window ).scrollTop(), 1, "dialog top position of center on window on initilization" );
	element.remove();
});

test( "position, right bottom at right bottom via ui.position args", function() {
	expect( 2 );

	// dialogs alter the window width and height in FF and IE7
	// so we collect that information before creating the dialog
	// Support: FF, IE7
	var winWidth = $( window ).width(),
		winHeight = $( window ).height(),
		element = $("<div></div>").dialog({
			position: {
				my: "right bottom",
				at: "right bottom"
			}
		}),
		dialog = element.dialog("widget"),
		offset = dialog.offset();

	closeEnough( offset.left, winWidth - dialog.outerWidth() + $( window ).scrollLeft(), 1, "dialog left position of right bottom at right bottom on initilization" );
	closeEnough( offset.top, winHeight - dialog.outerHeight() + $( window ).scrollTop(), 1, "dialog top position of right bottom at right bottom on initilization" );
	element.remove();
});

test( "position, at another element", function() {
	expect( 4 );
	var parent = $("<div></div>").css({
			position: "absolute",
			top: 400,
			left: 600,
			height: 10,
			width: 10
		}).appendTo("body"),

		element = $("<div></div>").dialog({
			position: {
				my: "left top",
				at: "left top",
				of: parent,
				collision: "none"
			}
		}),

		dialog = element.dialog("widget"),
		offset = dialog.offset();

	closeEnough( offset.left, 600, 1, "dialog left position at another element on initilization" );
	closeEnough( offset.top, 400, 1, "dialog top position at another element on initilization" );

	element.dialog("option", "position", {
			my: "left top",
			at: "right bottom",
			of: parent,
			collision: "none"
	});

	offset = dialog.offset();

	closeEnough( offset.left, 610, 1, "dialog left position at another element via setting option" );
	closeEnough( offset.top, 410, 1, "dialog top position at another element via setting option" );

	element.remove();
	parent.remove();
});

test("resizable", function() {
	expect(4);

	var element = $("<div></div>").dialog();
		TestHelpers.dialog.shouldResize(element, 50, 50, "[default]");
		element.dialog("option", "resizable", false);
		TestHelpers.dialog.shouldResize(element, 0, 0, "disabled after init");
	element.remove();

	element = $("<div></div>").dialog({ resizable: false });
		TestHelpers.dialog.shouldResize(element, 0, 0, "disabled in init options");
		element.dialog("option", "resizable", true);
		TestHelpers.dialog.shouldResize(element, 50, 50, "enabled after init");
	element.remove();
});

test( "title", function() {
	expect( 11 );

	function titleText() {
		return element.dialog("widget").find( ".ui-dialog-title" ).html();
	}

	var element = $( "<div></div>" ).dialog();
		// some browsers return a non-breaking space and some return "&nbsp;"
		// so we generate a non-breaking space for comparison
		equal( titleText(), $( "<span>&#160;</span>" ).html(), "[default]" );
		equal( element.dialog( "option", "title" ), null, "option not changed" );
	element.remove();

	element = $( "<div title='foo'>" ).dialog();
		equal( titleText(), "foo", "title in element attribute" );
		equal( element.dialog( "option", "title"), "foo", "option updated from attribute" );
	element.remove();

	element = $( "<div></div>" ).dialog({ title: "foo" });
		equal( titleText(), "foo", "title in init options" );
		equal( element.dialog("option", "title"), "foo", "opiton set from options hash" );
	element.remove();

	element = $( "<div title='foo'>" ).dialog({ title: "bar" });
		equal( titleText(), "bar", "title in init options should override title in element attribute" );
		equal( element.dialog("option", "title"), "bar", "opiton set from options hash" );
	element.remove();

	element = $( "<div></div>" ).dialog().dialog( "option", "title", "foo" );
		equal( titleText(), "foo", "title after init" );
	element.remove();

	// make sure attroperties are properly ignored - #5742 - .attr() might return a DOMElement
	element = $( "<form><input name='title'></form>" ).dialog();
		// some browsers return a non-breaking space and some return "&nbsp;"
		// so we get the text to normalize to the actual non-breaking space
		equal( titleText(), $( "<span>&#160;</span>" ).html(), "[default]" );
		equal( element.dialog( "option", "title" ), null, "option not changed" );
	element.remove();
});

test("width", function() {
	expect(3);

	var element = $("<div></div>").dialog();
		closeEnough(element.dialog("widget").width(), 300, 1, "default width");
	element.remove();

	element = $("<div></div>").dialog({width: 437 });
		closeEnough(element.dialog("widget").width(), 437, 1, "explicit width");
		element.dialog("option", "width", 438);
		closeEnough(element.dialog("widget").width(), 438, 1, "explicit width after init");
	element.remove();
});

test("#4826: setting resizable false toggles resizable on dialog", function() {
	expect(6);
	var i,
		element = $("<div></div>").dialog({ resizable: false });

	TestHelpers.dialog.shouldResize(element, 0, 0, "[default]");
	for (i=0; i<2; i++) {
		element.dialog("close").dialog("open");
		TestHelpers.dialog.shouldResize(element, 0, 0, "initialized with resizable false toggle ("+ (i+1) +")");
	}
	element.remove();

	element = $("<div></div>").dialog({ resizable: true });
	TestHelpers.dialog.shouldResize(element, 50, 50, "[default]");
	for (i=0; i<2; i++) {
		element.dialog("close").dialog("option", "resizable", false).dialog("open");
		TestHelpers.dialog.shouldResize(element, 0, 0, "set option resizable false toggle ("+ (i+1) +")");
	}
	element.remove();

});

asyncTest( "#8051 - 'Explode' dialog animation causes crash in IE 6, 7 and 8", function() {
	expect( 1 );
	var element = $( "<div></div>" ).dialog({
		show: "explode",
		focus: function() {
			ok( true, "dialog opened with animation" );
			element.remove();
			start();
		}
	});
});

asyncTest( "#4421 - Focus lost from dialog which uses show-effect", function() {
	expect( 1 );
	var element = $( "<div></div>" ).dialog({
		show: "blind",
		focus: function() {
			equal( element.dialog( "widget" ).find( ":focus" ).length, 1, "dialog maintains focus" );
			element.remove();
			start();
		}
	});
});

asyncTest( "Open followed by close during show effect", function() {
	expect( 1 );
	var element = $( "<div></div>" ).dialog({
		show: "blind",
		close: function() {
			ok( true, "dialog closed properly during animation" );
			element.remove();
			start();
		}
	});

	setTimeout( function() {
		element.dialog("close");
	}, 100 );
});

})(jQuery);
