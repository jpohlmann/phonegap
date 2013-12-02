ClientIFrameController = function() {
	this.activate_link = function(link) {
		top.document.getElementById('mainframe').setAttribute("src", link);
	};
};
ClientIFrameController = new ClientIFrameController();
$(document).ready(function() {
	$(window).resize(function() {
		$('#button_bar').css('left', 0);
		$('#button_bar').css('bottom', 0);
	});
	//set the method of seeing if an activity is turned off during a meeting
	setInterval(function(){
		$.ajax({
			url: "/arraylearn/client/is-activity-still-running",
		    type: "POST",
		    async: false,
		    complete: function(response){
		    	if(response.responseText=='0'){
		    		window.location.href='/arraylearn/slide-view/no-activity-running';
		    		return;
		    	}
		    }
		});
	}, 10000); //every 10 seconds
});