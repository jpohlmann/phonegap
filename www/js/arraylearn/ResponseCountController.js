ResponseCountController = function() {
	this.update = function(){
		$(".galleria-slide-type").each(function(){
			if($(this).hasClass('response')){
				console.log('hi');
			}
		});
	};
};
ResponseCountController = new ResponseCountController();

//update the response counts
$(document).ready(function(){
	ResponseCountController.update();
});