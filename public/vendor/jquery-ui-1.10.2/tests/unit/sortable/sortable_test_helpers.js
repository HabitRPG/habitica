TestHelpers.sortable = {
	sort: function( handle, dx, dy, index, msg ) {
		$( handle ).simulate( "drag", {
			dx: dx,
			dy: dy
		});
		equal( $( handle ).parent().children().index( handle ), index, msg );
	}
};