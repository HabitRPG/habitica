module( "progressbar: events" );

test( "create", function() {
	expect( 1 );
	$( "#progressbar" ).progressbar({
		value: 5,
		create: function() {
			equal( $( this ).progressbar( "value" ), 5, "Correct value at create" );
		},
		change: function() {
			ok( false, "create has triggered change()" );
		}
	});
});

test( "change", function() {
	expect( 2 );
	var element = $( "#progressbar" ).progressbar();

	element.one( "progressbarchange", function() {
		equal( element.progressbar( "value" ), 5, "change triggered for middle value" );
	});
	element.progressbar( "value", 5 );
	element.one( "progressbarchange", function() {
		equal( element.progressbar( "value" ), 100, "change triggered for final value" );
	});
	element.progressbar( "value", 100 );
});

test( "complete", function() {
	expect( 5 );
	var value,
		changes = 0,
		element = $( "#progressbar" ).progressbar({
			change: function() {
				changes++;
				equal( element.progressbar( "value" ), value, "change at " + value );
			},
			complete: function() {
				equal( changes, 3, "complete triggered after change and not on indeterminate" );
				equal( element.progressbar( "value" ), 100, "value is 100" );
			}
		});

	value = 5;
	element.progressbar( "value", value );
	value = false;
	element.progressbar( "value", value );
	value = 100;
	element.progressbar( "value", value );
});
