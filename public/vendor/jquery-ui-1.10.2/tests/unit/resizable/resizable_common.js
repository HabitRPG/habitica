TestHelpers.commonWidgetTests( "resizable", {
	defaults: {
		alsoResize: false,
		animate: false,
		animateDuration: "slow",
		animateEasing: "swing",
		aspectRatio: false,
		autoHide: false,
		cancel: "input,textarea,button,select,option",
		containment: false,
		delay: 0,
		disabled: false,
		distance: 1,
		ghost: false,
		grid: false,
		handles: "e,s,se",
		helper: false,
		maxHeight: null,
		maxWidth: null,
		minHeight: 10,
		minWidth: 10,
		zIndex: 90,

		// callbacks
		create: null,
		resize: null,
		start: null,
		stop: null
	}
});
