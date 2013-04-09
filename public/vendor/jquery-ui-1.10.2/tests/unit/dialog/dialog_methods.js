/*
 * dialog_methods.js
 */
(function($) {

module("dialog: methods", {
	teardown: function() {
		$("body>.ui-dialog").remove();
	}
});

test("init", function() {
	expect(6);

	$("<div></div>").appendTo("body").dialog().remove();
	ok(true, ".dialog() called on element");

	$([]).dialog().remove();
	ok(true, ".dialog() called on empty collection");

	$("<div></div>").dialog().remove();
	ok(true, ".dialog() called on disconnected DOMElement - never connected");

	$("<div></div>").appendTo("body").remove().dialog().remove();
	ok(true, ".dialog() called on disconnected DOMElement - removed");

	var element = $("<div></div>").dialog();
	element.dialog("option", "foo");
	element.remove();
	ok(true, "arbitrary option getter after init");

	$("<div></div>").dialog().dialog("option", "foo", "bar").remove();
	ok(true, "arbitrary option setter after init");
});

test("destroy", function() {
	expect( 17 );

	var element, element2;

	$( "#dialog1, #form-dialog" ).hide();
	domEqual( "#dialog1", function() {
		var dialog = $( "#dialog1" ).dialog().dialog( "destroy" );
		equal( dialog.parent()[ 0 ], $( "#qunit-fixture" )[ 0 ] );
		equal( dialog.index(), 0 );
	});
	domEqual( "#form-dialog", function() {
		var dialog = $( "#form-dialog" ).dialog().dialog( "destroy" );
		equal( dialog.parent()[ 0 ], $( "#qunit-fixture" )[ 0 ] );
		equal( dialog.index(), 2 );
	});

	// Ensure dimensions are restored (#8119)
	$( "#dialog1" ).show().css({
		width: "400px",
		minHeight: "100px",
		height: "200px"
	});
	domEqual( "#dialog1", function() {
		$( "#dialog1" ).dialog().dialog( "destroy" );
	});

	// Don't throw errors when destroying a never opened modal dialog (#9004)
	$( "#dialog1" ).dialog({ autoOpen: false, modal: true }).dialog( "destroy" );
	equal( $( ".ui-widget-overlay" ).length, 0, "overlay does not exist" );
	equal( $.ui.dialog.overlayInstances, 0, "overlayInstances equals the number of open overlays");

	element = $( "#dialog1" ).dialog({ modal: true }),
	element2 = $( "#dialog2" ).dialog({ modal: true });
	equal( $( ".ui-widget-overlay" ).length, 2, "overlays created when dialogs are open" );
	equal( $.ui.dialog.overlayInstances, 2, "overlayInstances equals the number of open overlays" );
	element.dialog( "close" );
	equal( $( ".ui-widget-overlay" ).length, 1, "overlay remains after closing one dialog" );
	equal( $.ui.dialog.overlayInstances, 1, "overlayInstances equals the number of open overlays" );
	element.dialog( "destroy" );
	equal( $( ".ui-widget-overlay" ).length, 1, "overlay remains after destroying one dialog" );
	equal( $.ui.dialog.overlayInstances, 1, "overlayInstances equals the number of open overlays" );
	element2.dialog( "destroy" );
	equal( $( ".ui-widget-overlay" ).length, 0, "overlays removed when all dialogs are destoryed" );
	equal( $.ui.dialog.overlayInstances, 0, "overlayInstances equals the number of open overlays" );
});

asyncTest("#9000: Dialog leaves broken event handler after close/destroy in certain cases", function() {
	expect( 1 );
	$( "#dialog1" ).dialog({ modal:true }).dialog( "close" ).dialog( "destroy" );
	setTimeout(function() {
		$( "#favorite-animal" ).focus();
		ok( true, "close and destroy modal dialog before its really opened" );
		start();
	}, 2 );
});

test("#4980: Destroy should place element back in original DOM position", function(){
	expect( 2 );
	var container = $("<div id='container'><div id='modal'>Content</div></div>"),
		modal = container.find("#modal");
	modal.dialog();
	ok(!$.contains(container[0], modal[0]), "dialog should move modal element to outside container element");
	modal.dialog("destroy");
	ok($.contains(container[0], modal[0]), "dialog(destroy) should place element back in original DOM position");
});

test( "enable/disable disabled", function() {
	expect( 2 );
	var element = $( "<div></div>" ).dialog();
	element.dialog( "disable" );
	equal(element.dialog( "option", "disabled" ), false, "disable method doesn't do anything" );
	ok( !element.dialog( "widget" ).hasClass( "ui-dialog-disabled" ), "disable method doesn't add ui-dialog-disabled class" );
});

test("close", function() {
	expect( 3 );

	var element,
		expected = $("<div></div>").dialog(),
		actual = expected.dialog("close");
	equal(actual, expected, "close is chainable");

	element = $("<div></div>").dialog();
	ok(element.dialog("widget").is(":visible") && !element.dialog("widget").is(":hidden"), "dialog visible before close method called");
	element.dialog("close");
	ok(element.dialog("widget").is(":hidden") && !element.dialog("widget").is(":visible"), "dialog hidden after close method called");
});

test("isOpen", function() {
	expect(4);

	var element = $("<div></div>").dialog();
	equal(element.dialog("isOpen"), true, "dialog is open after init");
	element.dialog("close");
	equal(element.dialog("isOpen"), false, "dialog is closed");
	element.remove();

	element = $("<div></div>").dialog({autoOpen: false});
	equal(element.dialog("isOpen"), false, "dialog is closed after init");
	element.dialog("open");
	equal(element.dialog("isOpen"), true, "dialog is open");
	element.remove();
});

test("moveToTop", function() {
	expect( 5 );
	function order() {
		var actual = $( ".ui-dialog" ).map(function() {
			return +$( this ).find( ".ui-dialog-content" ).attr( "id" ).replace( /\D+/, "" );
		}).get().reverse();
		deepEqual( actual, $.makeArray( arguments ) );
	}
	var dialog1, dialog2,
		focusOn = "dialog1";
	dialog1 = $( "#dialog1" ).dialog({
		focus: function() {
			equal( focusOn, "dialog1" );
		}
	});
	focusOn = "dialog2";
	dialog2 = $( "#dialog2" ).dialog({
		focus: function() {
			equal( focusOn, "dialog2" );
		}
	});
	order( 2, 1 );
	focusOn = "dialog1";
	dialog1.dialog( "moveToTop" );
	order( 1, 2 );
});

test("open", function() {
	expect( 3 );
	var element,
		expected = $("<div></div>").dialog(),
		actual = expected.dialog("open");
	equal(actual, expected, "open is chainable");

	element = $("<div></div>").dialog({ autoOpen: false });
	ok(element.dialog("widget").is(":hidden") && !element.dialog("widget").is(":visible"), "dialog hidden before open method called");
	element.dialog("open");
	ok(element.dialog("widget").is(":visible") && !element.dialog("widget").is(":hidden"), "dialog visible after open method called");
});

test("#6137: dialog('open') causes form elements to reset on IE7", function() {
	expect(2);

	var d1 = $("<form><input type='radio' name='radio' id='a' value='a' checked='checked'></input>" +
				"<input type='radio' name='radio' id='b' value='b'>b</input></form>").appendTo( "body" ).dialog({autoOpen: false});

	d1.find("#b").prop( "checked", true );
	equal(d1.find("input:checked").val(), "b", "checkbox b is checked");

	d1.dialog("open");
	equal(d1.find("input:checked").val(), "b", "checkbox b is checked");

	d1.remove();
});

asyncTest( "#8958: dialog can be opened while opening", function() {
	expect( 1 );

	var element = $( "<div>" ).dialog({
		autoOpen: false,
		modal: true,
		open: function() {
			equal( $( ".ui-widget-overlay" ).length, 1 );
			start();
		}
	});

	$( "#favorite-animal" )
		// We focus the input to start the test. Once it receives focus, the
		// dialog will open. Opening the dialog, will cause an element inside
		// the dialog to gain focus, thus blurring the input.
		.bind( "focus", function() {
			element.dialog( "open" );
		})
		// When the input blurs, the dialog is in the process of opening. We
		// try to open the dialog again, to make sure that dialogs properly
		// handle a call to the open() method during the process of the dialog
		// being opened.
		.bind( "blur", function() {
			element.dialog( "open" );
		})
		.focus();
});

test("#5531: dialog width should be at least minWidth on creation", function () {
	expect( 4 );
	var element = $("<div></div>").dialog({
			width: 200,
			minWidth: 300
		});

	equal(element.dialog("option", "width"), 300, "width is minWidth");
	element.dialog("option", "width", 200);
	equal(element.dialog("option", "width"), 300, "width unchanged when set to < minWidth");
	element.dialog("option", "width", 320);
	equal(element.dialog("option", "width"), 320, "width changed if set to > minWidth");
	element.remove();

	element = $("<div></div>").dialog({
			minWidth: 300
		});
	ok(element.dialog("option", "width") >=  300, "width is at least 300");
	element.remove();

});

})(jQuery);
