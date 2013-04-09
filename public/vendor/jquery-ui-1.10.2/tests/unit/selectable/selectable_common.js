TestHelpers.commonWidgetTests("selectable", {
	defaults: {
		appendTo: "body",
		autoRefresh: true,
		cancel: "input,textarea,button,select,option",
		delay: 0,
		disabled: false,
		distance: 0,
		filter: "*",
		tolerance: "touch",

		// callbacks
		create: null,
		selected: null,
		selecting: null,
		start: null,
		stop: null,
		unselected: null,
		unselecting: null
	}
});
