(function() {

var lastItem,
	log = [];

TestHelpers.menu = {
	log: function( message, clear ) {
		if ( clear ) {
			log.length = 0;
		}
		if ( message === undefined ) {
			message = lastItem;
		}
		log.push( $.trim( message ) );
	},

	logOutput: function() {
		return log.join( "," );
	},

	clearLog: function() {
		log.length = 0;
	},

	click: function( menu, item ) {
		lastItem = item;
		menu.children( ":eq(" + item + ")" ).find( "a:first" ).trigger( "click" );
	}
};

})();
