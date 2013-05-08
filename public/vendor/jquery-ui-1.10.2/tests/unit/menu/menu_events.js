(function( $ ) {

var log = TestHelpers.menu.log,
	logOutput = TestHelpers.menu.logOutput,
	click = TestHelpers.menu.click;

module( "menu: events", {
	setup: function() {
		TestHelpers.menu.clearLog();
	}
});

test( "handle click on menu", function() {
	expect( 1 );
	var element = $( "#menu1" ).menu({
		select: function() {
			log();
		}
	});
	log( "click", true );
	click( $( "#menu1" ), "1" );
	log( "afterclick" );
	click( element, "2" );
	click( $( "#menu1" ), "3" );
	click( element, "1" );
	equal( logOutput(), "click,1,afterclick,2,3,1", "Click order not valid." );
});

test( "handle click on custom item menu", function() {
	expect( 1 );
	var element = $( "#menu5" ).menu({
		select: function() {
			log();
		},
		menus: "div"
	});
	log( "click", true );
	click( $( "#menu5" ), "1" );
	log( "afterclick" );
	click( element, "2" );
	click( $( "#menu5" ), "3" );
	click( element, "1" );
	equal( logOutput(), "click,1,afterclick,2,3,1", "Click order not valid." );
});

asyncTest( "handle blur", function() {
	expect( 1 );
	var blurHandled = false,
		element = $( "#menu1" ).menu({
			blur: function( event ) {
				// Ignore duplicate blur event fired by IE
				if ( !blurHandled ) {
					blurHandled = true;
					equal( event.type, "menublur", "blur event.type is 'menublur'" );
				}
			}
		});

	click( element, "1" );
	setTimeout(function() {
		element.blur();
		setTimeout(function() {
			start();
		}, 350 );
	});
});

asyncTest( "handle blur via click outside", function() {
	expect( 1 );
	var blurHandled = false,
		element = $( "#menu1" ).menu({
			blur: function( event ) {
				// Ignore duplicate blur event fired by IE
				if ( !blurHandled ) {
					blurHandled = true;
					equal( event.type, "menublur", "blur event.type is 'menublur'" );
				}
			}
		});

	click( element, "1" );
	setTimeout(function() {
		$( "<a>", { id: "remove"} ).appendTo( "body" ).trigger( "click" );
		setTimeout(function() {
			start();
		}, 350 );
	});
});

asyncTest( "handle focus of menu with active item", function() {
	expect( 1 );
	var element = $( "#menu1" ).menu({
		focus: function( event ) {
			log( $( event.target ).find( ".ui-state-focus" ).parent().index() );
		}
	});

	log( "focus", true );
	element[0].focus();
	setTimeout(function() {
		element.simulate( "keydown", { keyCode: $.ui.keyCode.DOWN } );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.DOWN } );
		element[0].blur();
		setTimeout(function() {
			element[0].focus();
			setTimeout(function() {
				equal( logOutput(), "focus,0,1,2,2", "current active item remains active" );
				start();
			});
		});
	});
});

asyncTest( "handle submenu auto collapse: mouseleave", function() {
	expect( 4 );
	var element = $( "#menu2" ).menu(),
		event = $.Event( "mouseenter" );

	function menumouseleave1() {
		equal( element.find( "ul[aria-expanded='true']" ).length, 1, "first submenu expanded" );
		element.menu( "focus", event, element.find( "li:nth-child(7) li:first" ) );
		setTimeout( menumouseleave2, 350 );
	}
	function menumouseleave2() {
		equal( element.find( "ul[aria-expanded='true']" ).length, 2, "second submenu expanded" );
		element.find( "ul[aria-expanded='true']:first" ).trigger( "mouseleave" );
		setTimeout( menumouseleave3, 350 );
	}
	function menumouseleave3() {
		equal( element.find( "ul[aria-expanded='true']" ).length, 1, "second submenu collapsed" );
		element.trigger( "mouseleave" );
		setTimeout( menumouseleave4, 350 );
	}
	function menumouseleave4() {
		equal( element.find( "ul[aria-expanded='true']" ).length, 0, "first submenu collapsed" );
		start();
	}

	element.find( "li:nth-child(7)" ).trigger( "mouseenter" );
	setTimeout( menumouseleave1, 350 );
});

asyncTest( "handle submenu auto collapse: mouseleave", function() {
	expect( 4 );
	var element = $( "#menu5" ).menu({ menus: "div" }),
		event = $.Event( "mouseenter" );

	function menumouseleave1() {
		equal( element.find( "div[aria-expanded='true']" ).length, 1, "first submenu expanded" );
		element.menu( "focus", event, element.find( ":nth-child(7)" ).find( "div" ).eq( 0 ).children().eq( 0 ) );
		setTimeout( menumouseleave2, 350 );
	}
	function menumouseleave2() {
		equal( element.find( "div[aria-expanded='true']" ).length, 2, "second submenu expanded" );
		element.find( "div[aria-expanded='true']:first" ).trigger( "mouseleave" );
		setTimeout( menumouseleave3, 350 );
	}
	function menumouseleave3() {
		equal( element.find( "div[aria-expanded='true']" ).length, 1, "second submenu collapsed" );
		element.trigger( "mouseleave" );
		setTimeout( menumouseleave4, 350 );
	}
	function menumouseleave4() {
		equal( element.find( "div[aria-expanded='true']" ).length, 0, "first submenu collapsed" );
		start();
	}

	element.find( ":nth-child(7)" ).trigger( "mouseenter" );
	setTimeout( menumouseleave1, 350 );
});


asyncTest( "handle keyboard navigation on menu without scroll and without submenus", function() {
	expect( 12 );
	var element = $( "#menu1" ).menu({
		select: function( event, ui ) {
			log( $( ui.item[0] ).text() );
		},
		focus: function( event ) {
			log( $( event.target ).find( ".ui-state-focus" ).parent().index() );
		}
	});

	log( "keydown", true );
	element[0].focus();
	setTimeout(function() {
		element.simulate( "keydown", { keyCode: $.ui.keyCode.DOWN } );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.DOWN } );
		equal( logOutput(), "keydown,0,1,2", "Keydown DOWN" );

		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.UP } );
		equal( logOutput(), "keydown,1", "Keydown UP" );

		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.LEFT } );
		equal( logOutput(), "keydown", "Keydown LEFT (no effect)" );

		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.RIGHT } );
		equal( logOutput(), "keydown", "Keydown RIGHT (no effect)" );

		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.PAGE_DOWN } );
		equal( logOutput(), "keydown,4", "Keydown PAGE_DOWN" );

		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.PAGE_DOWN } );
		equal( logOutput(), "keydown", "Keydown PAGE_DOWN (no effect)" );

		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.PAGE_UP } );
		equal( logOutput(), "keydown,0", "Keydown PAGE_UP" );

		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.PAGE_UP } );
		equal( logOutput(), "keydown", "Keydown PAGE_UP (no effect)" );

		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.END } );
		equal( logOutput(), "keydown,4", "Keydown END" );

		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.HOME } );
		equal( logOutput(), "keydown,0", "Keydown HOME" );

		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.ESCAPE } );
		equal( logOutput(), "keydown", "Keydown ESCAPE (no effect)" );

		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.ENTER } );
		equal( logOutput(), "keydown,Aberdeen", "Keydown ENTER" );

		start();
	});
});

asyncTest( "handle keyboard navigation on menu without scroll and with submenus", function() {
	expect( 16 );
	var element = $( "#menu2" ).menu({
		select: function( event, ui ) {
			log( $( ui.item[0] ).text() );
		},
		focus: function( event ) {
			log( $( event.target ).find( ".ui-state-focus" ).parent().index() );
		}
	});

	log( "keydown", true );
	element.one( "menufocus", function() {
		element.simulate( "keydown", { keyCode: $.ui.keyCode.DOWN } );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.DOWN } );
		equal( logOutput(), "keydown,1,2", "Keydown DOWN" );
		setTimeout( menukeyboard1, 50 );
	});
	element.focus();

	function menukeyboard1() {
		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.UP } );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.UP } );
		equal( logOutput(), "keydown,1,0", "Keydown UP" );

		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.LEFT } );
		equal( logOutput(), "keydown", "Keydown LEFT (no effect)" );

		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.DOWN } );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.DOWN } );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.DOWN } );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.DOWN } );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.RIGHT } );

		setTimeout(function() {
			equal( logOutput(), "keydown,1,2,3,4,0", "Keydown RIGHT (open submenu)" );
			setTimeout( menukeyboard2, 50 );
		}, 50 );
	}

	function menukeyboard2() {
		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.LEFT } );
		equal( logOutput(), "keydown,4", "Keydown LEFT (close submenu)" );

		// re-open submenu
		element.simulate( "keydown", { keyCode: $.ui.keyCode.RIGHT } );
		setTimeout( menukeyboard3, 50 );
	}

	function menukeyboard3() {
		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.PAGE_DOWN } );
		equal( logOutput(), "keydown,2", "Keydown PAGE_DOWN" );

		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.PAGE_DOWN } );
		equal( logOutput(), "keydown", "Keydown PAGE_DOWN (no effect)" );

		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.PAGE_UP } );
		equal( logOutput(), "keydown,0", "Keydown PAGE_UP" );

		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.PAGE_UP } );
		equal( logOutput(), "keydown", "Keydown PAGE_UP (no effect)" );

		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.END } );
		equal( logOutput(), "keydown,2", "Keydown END" );

		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.HOME } );
		equal( logOutput(), "keydown,0", "Keydown HOME" );

		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.ESCAPE } );
		equal( logOutput(), "keydown,4", "Keydown ESCAPE (close submenu)" );

		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.SPACE } );
		setTimeout( menukeyboard4, 50 );
	}

	function menukeyboard4() {
		equal( logOutput(), "keydown,0", "Keydown SPACE (open submenu)" );

		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.ESCAPE } );
		equal( logOutput(), "keydown,4", "Keydown ESCAPE (close submenu)" );

		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.DOWN } );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.DOWN } );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.RIGHT } );
		setTimeout( function() {
			element.simulate( "keydown", { keyCode: $.ui.keyCode.DOWN } );
			element.simulate( "keydown", { keyCode: $.ui.keyCode.RIGHT } );
			setTimeout( function() {
				element.simulate( "keydown", { keyCode: $.ui.keyCode.DOWN } );
				element.simulate( "keydown", { keyCode: $.ui.keyCode.DOWN } );
				element.simulate( "keydown", { keyCode: $.ui.keyCode.DOWN } );
				equal( logOutput(), "keydown,5,6,0,1,0,2,4,0", "Keydown skip dividers and items without anchors" );

				log( "keydown", true );
				element.simulate( "keydown", { keyCode: $.ui.keyCode.ENTER } );
				setTimeout( menukeyboard6, 50 );
			}, 50 );
		}, 50 );
	}

	function menukeyboard6() {
		equal( logOutput(), "keydown,Ada", "Keydown ENTER (open submenu)" );
		start();
	}
});

asyncTest( "handle keyboard navigation on menu with scroll and without submenus", function() {
	expect( 14 );
	var element = $( "#menu3" ).menu({
		select: function( event, ui ) {
			log( $( ui.item[0] ).text() );
		},
		focus: function( event ) {
			log( $( event.target ).find( ".ui-state-focus" ).parent().index());
		}
	});

	log( "keydown", true );
	element[0].focus();
	setTimeout(function() {
		element.simulate( "keydown", { keyCode: $.ui.keyCode.DOWN } );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.DOWN } );
		equal( logOutput(), "keydown,0,1,2", "Keydown DOWN" );

		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.UP } );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.UP } );
		equal( logOutput(), "keydown,1,0", "Keydown UP" );

		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.LEFT } );
		equal( logOutput(), "keydown", "Keydown LEFT (no effect)" );

		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.RIGHT } );
		equal( logOutput(), "keydown", "Keydown RIGHT (no effect)" );

		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.PAGE_DOWN } );
		equal( logOutput(), "keydown,10", "Keydown PAGE_DOWN" );

		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.PAGE_DOWN } );
		equal( logOutput(), "keydown,20", "Keydown PAGE_DOWN" );

		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.PAGE_UP } );
		equal( logOutput(), "keydown,10", "Keydown PAGE_UP" );

		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.PAGE_UP } );
		equal( logOutput(), "keydown,0", "Keydown PAGE_UP" );

		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.PAGE_UP } );
		equal( logOutput(), "keydown", "Keydown PAGE_UP (no effect)" );

		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.END } );
		equal( logOutput(), "keydown,37", "Keydown END" );

		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.PAGE_DOWN } );
		equal( logOutput(), "keydown", "Keydown PAGE_DOWN (no effect)" );

		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.HOME } );
		equal( logOutput(), "keydown,0", "Keydown HOME" );

		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.ESCAPE } );
		equal( logOutput(), "keydown", "Keydown ESCAPE (no effect)" );

		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.ENTER } );
		equal( logOutput(), "keydown,Aberdeen", "Keydown ENTER" );

		start();
	});
});

asyncTest( "handle keyboard navigation on menu with scroll and with submenus", function() {
	expect( 14 );
	var element = $( "#menu4" ).menu({
		select: function( event, ui ) {
			log( $( ui.item[0] ).text() );
		},
		focus: function( event ) {
			log( $( event.target ).find( ".ui-state-focus" ).parent().index());
		}
	});

	log( "keydown", true );
	element.one( "menufocus", function() {
		element.simulate( "keydown", { keyCode: $.ui.keyCode.DOWN } );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.DOWN } );
		equal( logOutput(), "keydown,1,2", "Keydown DOWN" );
		setTimeout( menukeyboard1, 50 );
	});
	element.focus();

	function menukeyboard1() {
		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.UP } );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.UP } );
		equal( logOutput(), "keydown,1,0", "Keydown UP" );

		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.LEFT } );
		equal( logOutput(), "keydown", "Keydown LEFT (no effect)" );

		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.DOWN } );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.RIGHT } );

		setTimeout( function() {
			equal( logOutput(), "keydown,1,0", "Keydown RIGHT (open submenu)" );
		}, 50 );
		setTimeout( menukeyboard2, 50 );
	}

	function menukeyboard2() {
		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.LEFT } );
		equal( logOutput(), "keydown,1", "Keydown LEFT (close submenu)" );

		// re-open submenu
		element.simulate( "keydown", { keyCode: $.ui.keyCode.RIGHT } );
		setTimeout( menukeyboard3, 50 );
	}

	function menukeyboard3() {
		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.PAGE_DOWN } );
		equal( logOutput(), "keydown,10", "Keydown PAGE_DOWN" );

		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.PAGE_DOWN } );
		equal( logOutput(), "keydown,20", "Keydown PAGE_DOWN" );

		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.PAGE_UP } );
		equal( logOutput(), "keydown,10", "Keydown PAGE_UP" );

		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.PAGE_UP } );
		equal( logOutput(), "keydown,0", "Keydown PAGE_UP" );

		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.END } );
		equal( logOutput(), "keydown,27", "Keydown END" );

		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.HOME } );
		equal( logOutput(), "keydown,0", "Keydown HOME" );

		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.ESCAPE } );
		equal( logOutput(), "keydown,1", "Keydown ESCAPE (close submenu)" );

		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.ENTER } );
		setTimeout( menukeyboard4, 50 );
	}

	function menukeyboard4() {
		equal( logOutput(), "keydown,0", "Keydown ENTER (open submenu)" );

		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.ENTER } );
		equal( logOutput(), "keydown,Aberdeen", "Keydown ENTER (select item)" );

		start();
	}
});

asyncTest( "handle keyboard navigation and mouse click on menu with disabled items", function() {
	expect( 6 );
	var element = $( "#menu6" ).menu({
		select: function( event, ui ) {
			log( $( ui.item[0] ).text() );
		},
		focus: function( event ) {
			log( $( event.target ).find( ".ui-state-focus" ).parent().index());
		}
	});

	log( "keydown", true );
	element.one( "menufocus", function() {
		element.simulate( "keydown", { keyCode: $.ui.keyCode.DOWN } );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.ENTER } );
		equal( logOutput(), "keydown,1", "Keydown focus but not select disabled item" );
		setTimeout( menukeyboard1, 50 );
	});
	element.focus();

	function menukeyboard1() {
		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.DOWN } );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.DOWN } );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.DOWN } );
		equal( logOutput(), "keydown,2,3,4", "Keydown focus disabled item with submenu" );

		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.LEFT } );
		equal( logOutput(), "keydown", "Keydown LEFT (no effect)" );

		log( "keydown", true );
		element.simulate( "keydown", { keyCode: $.ui.keyCode.RIGHT } );

		setTimeout( function() {
			equal( logOutput(), "keydown", "Keydown RIGHT (no effect on disabled sub-menu)" );

			log( "keydown", true );
			element.simulate( "keydown", { keyCode: $.ui.keyCode.ENTER } );

			setTimeout( function() {
				equal( logOutput(), "keydown", "Keydown ENTER (no effect on disabled sub-menu)" );
				log( "click", true );
				click( element, "1" );
				equal( logOutput(), "click", "Click disabled item (no effect)" );
				start();
			}, 50 );
		}, 50 );
	}
});

asyncTest( "handle keyboard navigation with spelling of menu items", function() {
	expect( 2 );
	var element = $( "#menu2" ).menu({
		focus: function( event ) {
			log( $( event.target ).find( ".ui-state-focus" ).parent().index() );
		}
	});

	log( "keydown", true );
	element.one( "menufocus", function() {
		element.simulate( "keydown", { keyCode: 65 } );
		element.simulate( "keydown", { keyCode: 68 } );
		element.simulate( "keydown", { keyCode: 68 } );
		equal( logOutput(), "keydown,0,1,3", "Keydown focus Addyston by spelling the first 3 letters" );
		element.simulate( "keydown", { keyCode: 68 } );
		equal( logOutput(), "keydown,0,1,3,4", "Keydown focus Delphi by repeating the 'd' again" );
		start();
	});
	element[0].focus();
});

})( jQuery );
