<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>jQuery UI Autocomplete - Remote with caching</title>
	<link rel="stylesheet" href="../../themes/base/jquery.ui.all.css">
	<script src="../../jquery-1.9.1.js"></script>
	<script src="../../ui/jquery.ui.core.js"></script>
	<script src="../../ui/jquery.ui.widget.js"></script>
	<script src="../../ui/jquery.ui.position.js"></script>
	<script src="../../ui/jquery.ui.menu.js"></script>
	<script src="../../ui/jquery.ui.autocomplete.js"></script>
	<link rel="stylesheet" href="../demos.css">
	<style>
	.ui-autocomplete-loading {
		background: white url('images/ui-anim_basic_16x16.gif') right center no-repeat;
	}
	</style>
	<script>
	$(function() {
		var cache = {};
		$( "#birds" ).autocomplete({
			minLength: 2,
			source: function( request, response ) {
				var term = request.term;
				if ( term in cache ) {
					response( cache[ term ] );
					return;
				}

				$.getJSON( "search.php", request, function( data, status, xhr ) {
					cache[ term ] = data;
					response( data );
				});
			}
		});
	});
	</script>
</head>
<body>

<div class="ui-widget">
	<label for="birds">Birds: </label>
	<input id="birds">
</div>

<div class="demo-description">
<p>The Autocomplete widgets provides suggestions while you type into the field. Here the suggestions are bird names, displayed when at least two characters are entered into the field.</p>
<p>Similar to the remote datasource demo, though this adds some local caching to improve performance. The cache here saves just one query, and could be extended to cache multiple values, one for each term.</p>
</div>
</body>
</html>
