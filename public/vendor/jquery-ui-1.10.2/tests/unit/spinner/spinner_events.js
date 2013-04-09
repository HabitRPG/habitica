(function( $ ) {

var simulateKeyDownUp = TestHelpers.spinner.simulateKeyDownUp;

module( "spinner: events" );

test( "start", function() {
	expect( 10 );
	var element = $( "#spin" ).spinner();

	function shouldStart( expectation, msg ) {
		element.spinner( "option", "start", function() {
			ok( expectation, msg );
		});
	}

	shouldStart( true, "key UP" );
	simulateKeyDownUp( element, $.ui.keyCode.UP );
	shouldStart( true, "key DOWN" );
	simulateKeyDownUp( element, $.ui.keyCode.DOWN );

	shouldStart( true, "key PAGE_UP" );
	simulateKeyDownUp( element, $.ui.keyCode.PAGE_UP );
	shouldStart( true, "key PAGE_DOWN" );
	simulateKeyDownUp( element, $.ui.keyCode.PAGE_DOWN );

	shouldStart( true, "button up" );
	element.spinner( "widget" ).find( ".ui-spinner-up" ).mousedown().mouseup();
	shouldStart( true, "button down" );
	element.spinner( "widget" ).find( ".ui-spinner-down" ).mousedown().mouseup();

	shouldStart( true, "stepUp" );
	element.spinner( "stepUp" );
	shouldStart( true, "stepDown" );
	element.spinner( "stepDown" );

	shouldStart( true, "pageUp" );
	element.spinner( "pageUp" );
	shouldStart( true, "pageDown" );
	element.spinner( "pageDown" );

	shouldStart( false, "value" );
	element.spinner( "value", 999 );
});

test( "spin", function() {
	expect( 10 );
	var element = $( "#spin" ).spinner();

	function shouldSpin( expectation, msg ) {
		element.spinner( "option", "spin", function() {
			ok( expectation, msg );
		});
	}

	shouldSpin( true, "key UP" );
	simulateKeyDownUp( element, $.ui.keyCode.UP );
	shouldSpin( true, "key DOWN" );
	simulateKeyDownUp( element, $.ui.keyCode.DOWN );

	shouldSpin( true, "key PAGE_UP" );
	simulateKeyDownUp( element, $.ui.keyCode.PAGE_UP );
	shouldSpin( true, "key PAGE_DOWN" );
	simulateKeyDownUp( element, $.ui.keyCode.PAGE_DOWN );

	shouldSpin( true, "button up" );
	element.spinner( "widget" ).find( ".ui-spinner-up" ).mousedown().mouseup();
	shouldSpin( true, "button down" );
	element.spinner( "widget" ).find( ".ui-spinner-down" ).mousedown().mouseup();

	shouldSpin( true, "stepUp" );
	element.spinner( "stepUp" );
	shouldSpin( true, "stepDown" );
	element.spinner( "stepDown" );

	shouldSpin( true, "pageUp" );
	element.spinner( "pageUp" );
	shouldSpin( true, "pageDown" );
	element.spinner( "pageDown" );

	shouldSpin( false, "value" );
	element.spinner( "value", 999 );
});

test( "stop", function() {
	expect( 10 );
	var element = $( "#spin" ).spinner();

	function shouldStop( expectation, msg ) {
		element.spinner( "option", "stop", function() {
			ok( expectation, msg );
		});
	}

	shouldStop( true, "key UP" );
	simulateKeyDownUp( element, $.ui.keyCode.UP );
	shouldStop( true, "key DOWN" );
	simulateKeyDownUp( element, $.ui.keyCode.DOWN );

	shouldStop( true, "key PAGE_UP" );
	simulateKeyDownUp( element, $.ui.keyCode.PAGE_UP );
	shouldStop( true, "key PAGE_DOWN" );
	simulateKeyDownUp( element, $.ui.keyCode.PAGE_DOWN );

	shouldStop( true, "button up" );
	element.spinner( "widget" ).find( ".ui-spinner-up" ).mousedown().mouseup();
	shouldStop( true, "button down" );
	element.spinner( "widget" ).find( ".ui-spinner-down" ).mousedown().mouseup();

	shouldStop( true, "stepUp" );
	element.spinner( "stepUp" );
	shouldStop( true, "stepDown" );
	element.spinner( "stepDown" );

	shouldStop( true, "pageUp" );
	element.spinner( "pageUp" );
	shouldStop( true, "pageDown" );
	element.spinner( "pageDown" );

	shouldStop( false, "value" );
	element.spinner( "value", 999 );
});

asyncTest( "change", function() {
	expect( 14 );
	var element = $( "#spin" ).spinner();

	function shouldChange( expectation, msg ) {
		element.spinner( "option", "change", function() {
			ok( expectation, msg );
		});
	}

	function focusWrap( fn, next ) {
		element[0].focus();
		setTimeout( function() {
			fn();
			setTimeout(function() {
				element[0].blur();
				setTimeout( next );
			});
		});
	}

	function step1() {
		focusWrap(function() {
			shouldChange( false, "key UP, before blur" );
			simulateKeyDownUp( element, $.ui.keyCode.UP );
			shouldChange( true, "blur after key UP" );
		}, step2 );
	}

	function step2() {
		focusWrap(function() {
			shouldChange( false, "key DOWN, before blur" );
			simulateKeyDownUp( element, $.ui.keyCode.DOWN );
			shouldChange( true, "blur after key DOWN" );
		}, step3 );
	}

	function step3() {
		focusWrap(function() {
			shouldChange( false, "key PAGE_UP, before blur" );
			simulateKeyDownUp( element, $.ui.keyCode.PAGE_UP );
			shouldChange( true, "blur after key PAGE_UP" );
		}, step4 );
	}

	function step4() {
		focusWrap(function() {
			shouldChange( false, "key PAGE_DOWN, before blur" );
			simulateKeyDownUp( element, $.ui.keyCode.PAGE_DOWN );
			shouldChange( true, "blur after key PAGE_DOWN" );
		}, step5 );
	}

	function step5() {
		focusWrap(function() {
			shouldChange( false, "many keys, before blur" );
			simulateKeyDownUp( element, $.ui.keyCode.PAGE_DOWN );
			simulateKeyDownUp( element, $.ui.keyCode.UP );
			simulateKeyDownUp( element, $.ui.keyCode.UP );
			simulateKeyDownUp( element, $.ui.keyCode.UP );
			simulateKeyDownUp( element, $.ui.keyCode.DOWN );
			shouldChange( true, "blur after many keys" );
		}, step6 );
	}

	function step6() {
		focusWrap(function() {
			shouldChange( false, "many keys, same final value, before blur" );
			simulateKeyDownUp( element, $.ui.keyCode.UP );
			simulateKeyDownUp( element, $.ui.keyCode.UP );
			simulateKeyDownUp( element, $.ui.keyCode.DOWN );
			simulateKeyDownUp( element, $.ui.keyCode.DOWN );
			shouldChange( false, "blur after many keys, same final value" );

			shouldChange( false, "button up, before blur" );
			element.spinner( "widget" ).find( ".ui-spinner-up" ).mousedown().mouseup();
			shouldChange( true, "blur after button up" );
		}, step7 );
	}

	function step7() {
		focusWrap(function() {
			shouldChange( false, "button down, before blur" );
			element.spinner( "widget" ).find( ".ui-spinner-down" ).mousedown().mouseup();
			shouldChange( true, "blur after button down" );
		}, step8 );
	}

	function step8() {
		focusWrap(function() {
			shouldChange( false, "many buttons, same final value, before blur" );
			element.spinner( "widget" ).find( ".ui-spinner-up" ).mousedown().mouseup();
			element.spinner( "widget" ).find( ".ui-spinner-up" ).mousedown().mouseup();
			element.spinner( "widget" ).find( ".ui-spinner-down" ).mousedown().mouseup();
			element.spinner( "widget" ).find( ".ui-spinner-down" ).mousedown().mouseup();
			shouldChange( false, "blur after many buttons, same final value" );
		}, step9 );
	}

	function step9() {
		shouldChange( true, "stepUp" );
		element.spinner( "stepUp" );

		shouldChange( true, "stepDown" );
		element.spinner( "stepDown" );

		shouldChange( true, "pageUp" );
		element.spinner( "pageUp" );

		shouldChange( true, "pageDown" );
		element.spinner( "pageDown" );

		shouldChange( true, "value" );
		element.spinner( "value", 999 );

		shouldChange( false, "value, same value" );
		element.spinner( "value", 999 );

		shouldChange( true, "max, value changed" );
		element.spinner( "option", "max", 900 );

		shouldChange( false, "max, value not changed" );
		element.spinner( "option", "max", 1000 );

		shouldChange( true, "min, value changed" );
		element.spinner( "option", "min", 950 );

		shouldChange( false, "min, value not changed" );
		element.spinner( "option", "min", 200 );
		start();
	}

	setTimeout( step1 );
});

})( jQuery );
