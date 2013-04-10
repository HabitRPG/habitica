/*
 * dialog_events.js
 */
(function($) {

module("dialog: events");

test("open", function() {
	expect(13);

	var element = $("<div></div>");
	element.dialog({
		open: function(ev, ui) {
			ok(element.data("ui-dialog")._isOpen, "interal _isOpen flag is set");
			ok(true, "autoOpen: true fires open callback");
			equal(this, element[0], "context of callback");
			equal(ev.type, "dialogopen", "event type in callback");
			deepEqual(ui, {}, "ui hash in callback");
		}
	});
	element.remove();

	element = $("<div></div>");
	element.dialog({
		autoOpen: false,
		open: function(ev, ui) {
			ok(true, ".dialog('open') fires open callback");
			equal(this, element[0], "context of callback");
			equal(ev.type, "dialogopen", "event type in callback");
			deepEqual(ui, {}, "ui hash in callback");
		}
	}).bind("dialogopen", function(ev, ui) {
		ok(element.data("ui-dialog")._isOpen, "interal _isOpen flag is set");
		ok(true, "dialog('open') fires open event");
		equal(this, element[0], "context of event");
		deepEqual(ui, {}, "ui hash in event");
	});
	element.dialog("open");
	element.remove();
});


test( "focus", function() {
	expect( 5 );
	var element, other;
	element = $("#dialog1").dialog({
		autoOpen: false
	});
	other = $("#dialog2").dialog({
		autoOpen: false
	});

	element.one( "dialogopen", function() {
		ok( true, "open, just once" );
	});
	element.one( "dialogfocus", function() {
		ok( true, "focus on open" );
	});
	other.dialog( "open" );

	element.one( "dialogfocus", function() {
		ok( true, "when opening and already open and wasn't on top" );
	});
	other.dialog( "open" );
	element.dialog( "open" );

	element.one( "dialogfocus", function() {
		ok( true, "when calling moveToTop and wasn't on top" );
	});
	other.dialog( "moveToTop" );
	element.dialog( "moveToTop" );

	element.bind( "dialogfocus", function() {
		ok( true, "when mousedown anywhere on the dialog and it wasn't on top" );
	});
	other.dialog( "moveToTop" );
	element.trigger( "mousedown" );

	// triggers just once when already on top
	element.dialog( "open" );
	element.dialog( "moveToTop" );
	element.trigger( "mousedown" );

	element.add( other ).remove();
});

test("dragStart", function() {
	expect(9);

	var handle,
		element = $("<div></div>").dialog({
			dragStart: function(ev, ui) {
				ok(true, "dragging fires dragStart callback");
				equal(this, element[0], "context of callback");
				equal(ev.type, "dialogdragstart", "event type in callback");
				ok(ui.position !== undefined, "ui.position in callback");
				ok(ui.offset !== undefined, "ui.offset in callback");
			}
		}).bind("dialogdragstart", function(ev, ui) {
			ok(true, "dragging fires dialogdragstart event");
			equal(this, element[0], "context of event");
			ok(ui.position !== undefined, "ui.position in callback");
			ok(ui.offset !== undefined, "ui.offset in callback");
		});

	handle = $(".ui-dialog-titlebar", element.dialog("widget"));
	TestHelpers.dialog.drag(element, handle, 50, 50);
	element.remove();
});

test("drag", function() {
	expect(9);
	var handle,
		hasDragged = false,
		element = $("<div></div>").dialog({
			drag: function(ev, ui) {
				if (!hasDragged) {
					ok(true, "dragging fires drag callback");
					equal(this, element[0], "context of callback");
					equal(ev.type, "dialogdrag", "event type in callback");
					ok(ui.position !== undefined, "ui.position in callback");
					ok(ui.offset !== undefined, "ui.offset in callback");

					hasDragged = true;
				}
			}
		}).one("dialogdrag", function(ev, ui) {
			ok(true, "dragging fires dialogdrag event");
			equal(this, element[0], "context of event");
			ok(ui.position !== undefined, "ui.position in callback");
			ok(ui.offset !== undefined, "ui.offset in callback");
		});

	handle = $(".ui-dialog-titlebar", element.dialog("widget"));
	TestHelpers.dialog.drag(element, handle, 50, 50);
	element.remove();
});

test("dragStop", function() {
	expect(9);

	var handle,
		element = $("<div></div>").dialog({
			dragStop: function(ev, ui) {
				ok(true, "dragging fires dragStop callback");
				equal(this, element[0], "context of callback");
				equal(ev.type, "dialogdragstop", "event type in callback");
				ok(ui.position !== undefined, "ui.position in callback");
				ok(ui.offset !== undefined, "ui.offset in callback");
			}
		}).bind("dialogdragstop", function(ev, ui) {
			ok(true, "dragging fires dialogdragstop event");
			equal(this, element[0], "context of event");
			ok(ui.position !== undefined, "ui.position in callback");
			ok(ui.offset !== undefined, "ui.offset in callback");
		});

	handle = $(".ui-dialog-titlebar", element.dialog("widget"));
	TestHelpers.dialog.drag(element, handle, 50, 50);
	element.remove();
});

test("resizeStart", function() {
	expect(13);

	var handle,
		element = $("<div></div>").dialog({
			resizeStart: function(ev, ui) {
				ok(true, "resizing fires resizeStart callback");
				equal(this, element[0], "context of callback");
				equal(ev.type, "dialogresizestart", "event type in callback");
				ok(ui.originalPosition !== undefined, "ui.originalPosition in callback");
				ok(ui.originalSize !== undefined, "ui.originalSize in callback");
				ok(ui.position !== undefined, "ui.position in callback");
				ok(ui.size !== undefined, "ui.size in callback");
			}
		}).bind("dialogresizestart", function(ev, ui) {
			ok(true, "resizing fires dialogresizestart event");
			equal(this, element[0], "context of event");
			ok(ui.originalPosition !== undefined, "ui.originalPosition in callback");
			ok(ui.originalSize !== undefined, "ui.originalSize in callback");
			ok(ui.position !== undefined, "ui.position in callback");
			ok(ui.size !== undefined, "ui.size in callback");
		});

	handle = $(".ui-resizable-se", element.dialog("widget"));
	TestHelpers.dialog.drag(element, handle, 50, 50);
	element.remove();
});

test("resize", function() {
	expect(13);
	var handle,
		hasResized = false,
		element = $("<div></div>").dialog({
			resize: function(ev, ui) {
				if (!hasResized) {
					ok(true, "resizing fires resize callback");
					equal(this, element[0], "context of callback");
					equal(ev.type, "dialogresize", "event type in callback");
					ok(ui.originalPosition !== undefined, "ui.originalPosition in callback");
					ok(ui.originalSize !== undefined, "ui.originalSize in callback");
					ok(ui.position !== undefined, "ui.position in callback");
					ok(ui.size !== undefined, "ui.size in callback");

					hasResized = true;
				}
			}
		}).one("dialogresize", function(ev, ui) {
			ok(true, "resizing fires dialogresize event");
			equal(this, element[0], "context of event");
			ok(ui.originalPosition !== undefined, "ui.originalPosition in callback");
			ok(ui.originalSize !== undefined, "ui.originalSize in callback");
			ok(ui.position !== undefined, "ui.position in callback");
			ok(ui.size !== undefined, "ui.size in callback");
		});

	handle = $(".ui-resizable-se", element.dialog("widget"));
	TestHelpers.dialog.drag(element, handle, 50, 50);
	element.remove();
});

test("resizeStop", function() {
	expect(13);

	var handle,
		element = $("<div></div>").dialog({
			resizeStop: function(ev, ui) {
				ok(true, "resizing fires resizeStop callback");
				equal(this, element[0], "context of callback");
				equal(ev.type, "dialogresizestop", "event type in callback");
				ok(ui.originalPosition !== undefined, "ui.originalPosition in callback");
				ok(ui.originalSize !== undefined, "ui.originalSize in callback");
				ok(ui.position !== undefined, "ui.position in callback");
				ok(ui.size !== undefined, "ui.size in callback");
			}
		}).bind("dialogresizestop", function(ev, ui) {
			ok(true, "resizing fires dialogresizestop event");
			equal(this, element[0], "context of event");
				ok(ui.originalPosition !== undefined, "ui.originalPosition in callback");
				ok(ui.originalSize !== undefined, "ui.originalSize in callback");
				ok(ui.position !== undefined, "ui.position in callback");
				ok(ui.size !== undefined, "ui.size in callback");
		});

	handle = $(".ui-resizable-se", element.dialog("widget"));
	TestHelpers.dialog.drag(element, handle, 50, 50);
	element.remove();
});

asyncTest("close", function() {
	expect(14);

	var element = $("<div></div>").dialog({
		close: function(ev, ui) {
			ok(true, ".dialog('close') fires close callback");
			equal(this, element[0], "context of callback");
			equal(ev.type, "dialogclose", "event type in callback");
			deepEqual(ui, {}, "ui hash in callback");
		}
	}).bind("dialogclose", function(ev, ui) {
		ok(true, ".dialog('close') fires dialogclose event");
		equal(this, element[0], "context of event");
		deepEqual(ui, {}, "ui hash in event");
	});
	element.dialog("close");
	element.remove();

	// Close event with an effect
	element = $("<div></div>").dialog({
		hide: 10,
		close: function(ev, ui) {
			ok(true, ".dialog('close') fires close callback");
			equal(this, element[0], "context of callback");
			equal(ev.type, "dialogclose", "event type in callback");
			deepEqual(ui, {}, "ui hash in callback");
			start();
		}
	}).bind("dialogclose", function(ev, ui) {
		ok(true, ".dialog('close') fires dialogclose event");
		equal(this, element[0], "context of event");
		deepEqual(ui, {}, "ui hash in event");
	});
	element.dialog("close");
});

test("beforeClose", function() {
	expect(14);

	var element = $("<div></div>").dialog({
		beforeClose: function(ev, ui) {
			ok(true, ".dialog('close') fires beforeClose callback");
			equal(this, element[0], "context of callback");
			equal(ev.type, "dialogbeforeclose", "event type in callback");
			deepEqual(ui, {}, "ui hash in callback");
			return false;
		}
	});

	element.dialog("close");
	ok( element.dialog("widget").is(":visible"), "beforeClose callback should prevent dialog from closing");
	element.remove();

	element = $("<div></div>").dialog();
	element.dialog("option", "beforeClose", function(ev, ui) {
		ok(true, ".dialog('close') fires beforeClose callback");
		equal(this, element[0], "context of callback");
		equal(ev.type, "dialogbeforeclose", "event type in callback");
		deepEqual(ui, {}, "ui hash in callback");
		return false;
	});
	element.dialog("close");

	ok( element.dialog("widget").is(":visible"), "beforeClose callback should prevent dialog from closing");
	element.remove();

	element = $("<div></div>").dialog().bind("dialogbeforeclose", function(ev, ui) {
		ok(true, ".dialog('close') triggers dialogbeforeclose event");
		equal(this, element[0], "context of event");
		deepEqual(ui, {}, "ui hash in event");
		return false;
	});
	element.dialog("close");
	ok( element.dialog("widget").is(":visible"), "dialogbeforeclose event should prevent dialog from closing");
	element.remove();
});

// #8789 and #8838
asyncTest("ensure dialog's container doesn't scroll on resize and focus", function() {
	expect(2);

	var element = $("#dialog1").dialog(),
		initialScroll = $(window).scrollTop();
	element.dialog("option", "height", 600);
	equal($(window).scrollTop(), initialScroll, "scroll hasn't moved after height change");
	setTimeout( function(){
		$(".ui-dialog-titlebar-close").simulate("mousedown");
		equal($(window).scrollTop(), initialScroll, "scroll hasn't moved after focus moved to dialog");
		element.dialog("destroy");
		start();
	}, 500);
});

test("#5184: isOpen in dialogclose event is true", function() {
	expect( 3 );

	var element = $( "<div></div>" ).dialog({
			close: function() {
				ok( !element.dialog("isOpen"), "dialog is not open during close" );
			}
		});
	ok( element.dialog("isOpen"), "dialog is open after init" );
	element.dialog( "close" );
	ok( !element.dialog("isOpen"), "dialog is not open after close" );
	element.remove();
});

test("ensure dialog keeps focus when clicking modal overlay", function() {
	expect( 2 );

	var element = $( "<div></div>" ).dialog({
			modal: true
		});
	ok( $(":focus").closest(".ui-dialog").length, "focus is in dialog" );
	$(".ui-widget-overlay").simulate("mousedown");
	ok( $(":focus").closest(".ui-dialog").length, "focus is still in dialog" );
	element.remove();
});

})(jQuery);
