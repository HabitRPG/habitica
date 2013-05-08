TestHelpers.commonWidgetTests( "draggable", {
	defaults: {
		appendTo: "parent",
		axis: false,
		cancel: "input,textarea,button,select,option",
		connectToSortable: false,
		containment: false,
		cursor: "auto",
		cursorAt: false,
		disabled: false,
		grid: false,
		handle: false,
		helper: "original",
		opacity: false,
		refreshPositions: false,
		revert: false,
		revertDuration: 500,
		scroll: true,
		scrollSensitivity: 20,
		scrollSpeed: 20,
		scope: "default",
		snap: false,
		snapMode: "both",
		snapTolerance: 20,
		stack: false,
		zIndex: false,

		//todo: remove the following option checks when interactions are rewritten:
		addClasses: true,
		delay: 0,
		distance: 1,
		iframeFix: false,

		// callbacks
		create: null,
		drag: null,
		start: null,
		stop: null
	}
});
