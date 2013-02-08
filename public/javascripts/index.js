socket = io.connect();
socket.on('connect', function() {
	console.log("about to trigger...");
	$(document).trigger("loaded");
});
$(document).ready(function () {
	if (location.hash !== '') $('a[href="' + location.hash + '"]').tab('show');
	return $('a[data-toggle="tab"]').on('shown', function(e) {
	  return location.hash = $(e.target).attr('href').substr(1);
	});	
});
