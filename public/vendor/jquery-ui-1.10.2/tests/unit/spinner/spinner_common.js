TestHelpers.commonWidgetTests( "spinner", {
	defaults: {
		culture: null,
		disabled: false,
		icons: {
			down: "ui-icon-triangle-1-s",
			up: "ui-icon-triangle-1-n"
		},
		incremental: true,
		max: null,
		min: null,
		numberFormat: null,
		page: 10,
		step: 1,

		// callbacks
		change: null,
		create: null,
		spin: null,
		start: null,
		stop: null
	}
});
