(function( $ ) {

module( "tooltip: options" );

test( "disabled: true", function() {
	expect( 1 );
	$( "#tooltipped1" ).tooltip({
		disabled: true
	}).tooltip( "open" );
	equal( $( ".ui-tooltip" ).length, 0 );
});

test( "content: default", function() {
	expect( 1 );
	var element = $( "#tooltipped1" ).tooltip().tooltip( "open" );
	deepEqual( $( "#" + element.data( "ui-tooltip-id" ) ).text(), "anchortitle" );
});

test( "content: default; HTML escaping", function() {
	expect( 2 );
	var scriptText = "<script>$.ui.tooltip.hacked = true;</script>",
		element = $( "#tooltipped1" );

	$.ui.tooltip.hacked = false;
	element.attr( "title", scriptText )
		.tooltip()
		.tooltip( "open" );
	equal( $.ui.tooltip.hacked, false, "script did not execute" );
	deepEqual( $( "#" + element.data( "ui-tooltip-id" ) ).text(), scriptText,
		"correct tooltip text" );
});

test( "content: return string", function() {
	expect( 1 );
	var element = $( "#tooltipped1" ).tooltip({
		content: function() {
			return "customstring";
		}
	}).tooltip( "open" );
	deepEqual( $( "#" + element.data( "ui-tooltip-id" ) ).text(), "customstring" );
});

test( "content: return jQuery", function() {
	expect( 1 );
	var element = $( "#tooltipped1" ).tooltip({
		content: function() {
			return $( "<div>" ).html( "cu<b>s</b>tomstring" );
		}
	}).tooltip( "open" );
	deepEqual( $( "#" + element.data( "ui-tooltip-id" ) ).text(), "customstring" );
});

asyncTest( "content: sync + async callback", function() {
	expect( 2 );
	var element = $( "#tooltipped1" ).tooltip({
		content: function( response ) {
			setTimeout(function() {
				deepEqual( $( "#" + element.data("ui-tooltip-id") ).text(), "loading..." );

				response( "customstring2" );
				setTimeout(function() {
					deepEqual( $( "#" + element.data("ui-tooltip-id") ).text(), "customstring2" );
					start();
				}, 13 );
			}, 13 );
			return "loading...";
		}
	}).tooltip( "open" );
});

test( "content: change while open", function() {
	expect( 2 ) ;
	var element = $( "#tooltipped1" ).tooltip({
		content: function() {
			return "old";
		}
	});

	element.one( "tooltipopen", function( event, ui ) {
		equal( ui.tooltip.text(), "old", "original content" );
		element.tooltip( "option", "content", function() {
			return "new";
		});
		equal( ui.tooltip.text(), "new", "updated content" );
	});

	element.tooltip( "open" );
});

test( "content: string", function() {
	expect( 1 );
	$( "#tooltipped1" ).tooltip({
		content: "just a string",
		open: function( event, ui ) {
			equal( ui.tooltip.text(), "just a string" );
		}
	}).tooltip( "open" );
});

test( "items", function() {
	expect( 2 );
	var event,
		element = $( "#qunit-fixture" ).tooltip({
			items: "#fixture-span"
		});

	event = $.Event( "mouseenter" );
	event.target = $( "#fixture-span" )[ 0 ];
	element.tooltip( "open", event );
	deepEqual( $( "#" + $( "#fixture-span" ).data( "ui-tooltip-id" ) ).text(), "title-text" );

	// make sure default [title] doesn't get used
	event.target = $( "#tooltipped1" )[ 0 ];
	element.tooltip( "open", event );
	deepEqual( $( "#tooltipped1" ).data( "ui-tooltip-id" ), undefined );

	element.tooltip( "destroy" );
});

test( "tooltipClass", function() {
	expect( 1 );
	var element = $( "#tooltipped1" ).tooltip({
		tooltipClass: "custom"
	}).tooltip( "open" );
	ok( $( "#" + element.data( "ui-tooltip-id" ) ).hasClass( "custom" ) );
});

test( "track + show delay", function() {
	expect( 2 );
	var event,
		leftVal = 314,
		topVal = 159,
		offsetVal = 26,
		element = $( "#tooltipped1" ).tooltip({
			track: true,
			show: {
				delay: 1
			},
			position: {
				my: "left+" + offsetVal + " top+" + offsetVal,
				at: "right bottom"
			}
		});

	event = $.Event( "mouseover" );
	event.target = $( "#tooltipped1" )[ 0 ];
	event.originalEvent = { type: "mouseover" };
	event.pageX = leftVal;
	event.pageY = topVal;
	element.trigger( event );

	event = $.Event( "mousemove" );
	event.target = $( "#tooltipped1" )[ 0 ];
	event.originalEvent = { type: "mousemove" };
	event.pageX = leftVal;
	event.pageY = topVal;
	element.trigger( event );

	equal( $( ".ui-tooltip" ).css( "left" ), leftVal + offsetVal + "px" );
	equal( $( ".ui-tooltip" ).css( "top" ), topVal + offsetVal + "px" );
});

test( "track and programmatic focus", function() {
	expect( 1 );
	$( "#qunit-fixture div input" ).tooltip({
		track: true
	}).focus();
	equal( "inputtitle", $( ".ui-tooltip" ).text() );
});

}( jQuery ) );
