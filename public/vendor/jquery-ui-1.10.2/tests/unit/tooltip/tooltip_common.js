TestHelpers.commonWidgetTests( "tooltip", {
	defaults: {
		content: function() {},
		disabled: false,
		hide: true,
		items: "[title]:not([disabled])",
		position: {
			my: "left top+15",
			at: "left bottom",
			collision: "flipfit flip"
		},
		show: true,
		tooltipClass: null,
		track: false,

		// callbacks
		close: null,
		create: null,
		open: null
	}
});
