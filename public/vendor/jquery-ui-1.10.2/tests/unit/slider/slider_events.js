/*
 * slider_events.js
 */
(function( $ ) {

module( "slider: events" );

//Specs from http://wiki.jqueryui.com/Slider#specs
//"change callback: triggers when the slider has stopped moving and has a new
// value (even if same as previous value), via mouse(mouseup) or keyboard(keyup)
// or value method/option"
test( "mouse based interaction", function() {
	expect( 4 );

	var element = $( "#slider1" )
		.slider({
			start: function( event ) {
				equal( event.originalEvent.type, "mousedown", "start triggered by mousedown" );
			},
			slide: function( event) {
				equal( event.originalEvent.type, "mousemove", "slider triggered by mousemove" );
			},
			stop: function( event ) {
				equal( event.originalEvent.type, "mouseup", "stop triggered by mouseup" );
			},
			change: function( event ) {
				equal( event.originalEvent.type, "mouseup", "change triggered by mouseup" );
			}
		});

	element.find( ".ui-slider-handle" ).eq( 0 )
		.simulate( "drag", { dx: 10, dy: 10 } );

});
test( "keyboard based interaction", function() {
	expect( 3 );

	// Test keyup at end of handle slide (keyboard)
	var element = $( "#slider1" )
		.slider({
			start: function( event ) {
				equal( event.originalEvent.type, "keydown", "start triggered by keydown" );
			},
			slide: function() {
				ok( false, "Slider never triggered by keys" );
			},
			stop: function( event ) {
				equal( event.originalEvent.type, "keyup", "stop triggered by keyup" );
			},
			change: function( event ) {
				equal( event.originalEvent.type, "keyup", "change triggered by keyup" );
			}
		});

	element.find( ".ui-slider-handle" ).eq( 0 )
		.simulate( "keydown", { keyCode: $.ui.keyCode.LEFT } )
		.simulate( "keypress", { keyCode: $.ui.keyCode.LEFT } )
		.simulate( "keyup", { keyCode: $.ui.keyCode.LEFT } );

});
test( "programmatic event triggers", function() {
	expect( 6 );

	// Test value method
	var element = $( "<div></div>" )
		.slider({
			change: function() {
				ok( true, "change triggered by value method" );
			}
		})
		.slider( "value", 0 );

	// Test values method
	element = $( "<div></div>" )
		.slider({
			values: [ 10, 20 ],
			change: function() {
				ok( true, "change triggered by values method" );
			}
		})
		.slider( "values", [ 80, 90 ] );

	// Test value option
	element = $( "<div></div>" )
		.slider({
			change: function() {
				ok( true, "change triggered by value option" );
			}
		})
		.slider( "option", "value", 0 );

	// Test values option
	element = $( "<div></div>" )
		.slider({
			values: [ 10, 20 ],
			change: function() {
				ok( true, "change triggered by values option" );
			}
		})
		.slider( "option", "values", [ 80, 90 ] );

});

test( "mouse based interaction part two: when handles overlap", function() {
	expect( 4 );

	var element = $( "#slider1" )
		.slider({
			values: [ 0, 0, 0 ],
			start: function( event, ui ) {
				equal( handles.index( ui.handle ), 2, "rightmost handle activated when overlapping at minimum (#3736)" );
			}
		}),
		handles = element.find( ".ui-slider-handle" );
	handles.eq( 0 ).simulate( "drag", { dx: 10 } );
	element.slider( "destroy" );

	element = $( "#slider1" )
		.slider({
			values: [ 10, 10, 10 ],
			max: 10,
			start: function( event, ui ) {
				equal( handles.index( ui.handle ), 0, "leftmost handle activated when overlapping at maximum" );
			}
		}),
		handles = element.find( ".ui-slider-handle" );
	handles.eq( 0 ).simulate( "drag", { dx: -10 } );
	element.slider( "destroy" );

	element = $( "#slider1" )
		.slider({
			values: [ 19, 20 ]
		}),
		handles = element.find( ".ui-slider-handle" );
	handles.eq( 0 ).simulate( "drag", { dx: 10 } );
	element.one( "slidestart", function( event, ui ) {
		equal( handles.index( ui.handle ), 0, "left handle activated if left was moved last" );
	});
	handles.eq( 0 ).simulate( "drag", { dx: 10 } );
	element.slider( "destroy" );

	element = $( "#slider1" )
		.slider({
			values: [ 19, 20 ]
		}),
		handles = element.find( ".ui-slider-handle" );
	handles.eq( 1 ).simulate( "drag", { dx: -10 } );
	element.one( "slidestart", function( event, ui ) {
		equal( handles.index( ui.handle ), 1, "right handle activated if right was moved last (#3467)" );
	});
	handles.eq( 0 ).simulate( "drag", { dx: 10 } );

});

})( jQuery );
