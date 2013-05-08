/*
 * button_core.js
 */


(function($) {

module("button: core");

test("checkbox", function() {
	expect( 4 );
	var input = $("#check"),
		label = $("label[for=check]");
	ok( input.is(":visible") );
	ok( label.is(":not(.ui-button)") );
	input.button();
	ok( input.is(".ui-helper-hidden-accessible") );
	ok( label.is(".ui-button") );
});

test("radios", function() {
	expect( 4 );
	var inputs = $("#radio0 input"),
		labels = $("#radio0 label");
	ok( inputs.is(":visible") );
	ok( labels.is(":not(.ui-button)") );
	inputs.button();
	ok( inputs.is(".ui-helper-hidden-accessible") );
	ok( labels.is(".ui-button") );
});

function assert(noForm, form1, form2) {
	ok( $("#radio0 .ui-button" + noForm).is(".ui-state-active") );
	ok( $("#radio1 .ui-button" + form1).is(".ui-state-active") );
	ok( $("#radio2 .ui-button" + form2).is(".ui-state-active") );
}

test("radio groups", function() {
	expect( 12 );
	$("input[type=radio]").button();
	assert(":eq(0)", ":eq(1)", ":eq(2)");

	// click outside of forms
	$("#radio0 .ui-button:eq(1)").click();
	assert(":eq(1)", ":eq(1)", ":eq(2)");

	// click in first form
	$("#radio1 .ui-button:eq(0)").click();
	assert(":eq(1)", ":eq(0)", ":eq(2)");

	// click in second form
	$("#radio2 .ui-button:eq(0)").click();
	assert(":eq(1)", ":eq(0)", ":eq(0)");
});

test("input type submit, don't create child elements", function() {
	expect( 2 );
	var input = $("#submit");
	deepEqual( input.children().length, 0 );
	input.button();
	deepEqual( input.children().length, 0 );
});

test("buttonset", function() {
	expect( 6 );
	var set = $("#radio1").buttonset();
	ok( set.is(".ui-buttonset") );
	deepEqual( set.children(".ui-button").length, 3 );
	deepEqual( set.children("input[type=radio].ui-helper-hidden-accessible").length, 3 );
	ok( set.children("label:eq(0)").is(".ui-button.ui-corner-left:not(.ui-corner-all)") );
	ok( set.children("label:eq(1)").is(".ui-button:not(.ui-corner-all)") );
	ok( set.children("label:eq(2)").is(".ui-button.ui-corner-right:not(.ui-corner-all)") );
});

test("buttonset (rtl)", function() {
	expect( 6 );
	var set,
		parent = $("#radio1").parent();
	// Set to rtl
	parent.attr("dir", "rtl");

	set = $("#radio1").buttonset();
	ok( set.is(".ui-buttonset") );
	deepEqual( set.children(".ui-button").length, 3 );
	deepEqual( set.children("input[type=radio].ui-helper-hidden-accessible").length, 3 );
	ok( set.children("label:eq(0)").is(".ui-button.ui-corner-right:not(.ui-corner-all)") );
	ok( set.children("label:eq(1)").is(".ui-button:not(.ui-corner-all)") );
	ok( set.children("label:eq(2)").is(".ui-button.ui-corner-left:not(.ui-corner-all)") );
});

// TODO: simulated click events don't behave like real click events in IE
// remove this when simulate properly simulates this
// see http://yuilibrary.com/projects/yui2/ticket/2528826 fore more info
if ( !$.ui.ie || ( document.documentMode && document.documentMode > 8 ) ) {
	asyncTest( "ensure checked and aria after single click on checkbox label button, see #5518", function() {
		expect( 3 );

		$("#check2").button().change( function() {
			var lbl = $( this ).button("widget");
			ok( this.checked, "checked ok" );
			ok( lbl.attr("aria-pressed") === "true", "aria ok" );
			ok( lbl.hasClass("ui-state-active"), "ui-state-active ok" );
		});

		// support: Opera
		// Opera doesn't trigger a change event when this is done synchronously.
		// This seems to be a side effect of another test, but until that can be
		// tracked down, this delay will have to do.
		setTimeout(function() {
			$("#check2").button("widget").simulate("click");
			start();
		}, 1 );
	});
}

test( "#7092 - button creation that requires a matching label does not find label in all cases", function() {
	expect( 5 );
	var group = $( "<span><label for='t7092a'></label><input type='checkbox' id='t7092a'></span>" );
	group.find( "input[type=checkbox]" ).button();
	ok( group.find( "label" ).is( ".ui-button" ) );

	group = $( "<input type='checkbox' id='t7092b'><label for='t7092b'></label>" );
	group.filter( "input[type=checkbox]" ).button();
	ok( group.filter( "label" ).is( ".ui-button" ) );

	group = $( "<span><input type='checkbox' id='t7092c'></span><label for='t7092c'></label>" );
	group.find( "input[type=checkbox]" ).button();
	ok( group.filter( "label" ).is( ".ui-button" ) );

	group = $( "<span><input type='checkbox' id='t7092d'></span><span><label for='t7092d'></label></span>" );
	group.find( "input[type=checkbox]" ).button();
	ok( group.find( "label" ).is( ".ui-button" ) );

	group = $( "<input type='checkbox' id='t7092e'><span><label for='t7092e'></label></span>" );
	group.filter( "input[type=checkbox]" ).button();
	ok( group.find( "label" ).is( ".ui-button" ) );
});

test( "#5946 - buttonset should ignore buttons that are not :visible", function() {
	expect( 2 );
	$( "#radio01" ).next().addBack().hide();
	var set = $( "#radio0" ).buttonset({ items: "input[type=radio]:visible" });
	ok( set.find( "label:eq(0)" ).is( ":not(.ui-button):not(.ui-corner-left)" ) );
	ok( set.find( "label:eq(1)" ).is( ".ui-button.ui-corner-left" ) );
});

test( "#6262 - buttonset not applying ui-corner to invisible elements", function() {
	expect( 3 );
	$( "#radio0" ).hide();
	var set = $( "#radio0" ).buttonset();
	ok( set.find( "label:eq(0)" ).is( ".ui-button.ui-corner-left" ) );
	ok( set.find( "label:eq(1)" ).is( ".ui-button" ) );
	ok( set.find( "label:eq(2)" ).is( ".ui-button.ui-corner-right" ) );
});

asyncTest( "#6711 Checkbox/Radiobutton do not Show Focused State when using Keyboard Navigation", function() {
	expect( 2 );
	var check = $( "#check" ).button(),
		label = $( "label[for='check']" );
	ok( !label.is( ".ui-state-focus" ) );
	check.focus();
	setTimeout(function() {
		ok( label.is( ".ui-state-focus" ) );
		start();
	});
});

test( "#7534 - Button label selector works for ids with \":\"", function() {
	expect( 1 );
	var group = $( "<span><input type='checkbox' id='check:7534'><label for='check:7534'>Label</label></span>" );
	group.find( "input" ).button();
	ok( group.find( "label" ).is( ".ui-button" ), "Found an id with a :" );
});

})(jQuery);
