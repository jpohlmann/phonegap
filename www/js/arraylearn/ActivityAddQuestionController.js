ActivityAddQuestionController = function() {
	this.current_ranking_number = 3; //the default is 3
	
	/**
	 * Show/hide the answers table
	 */
	this.show_hide = function(element) {
		if(element.options[element.selectedIndex].value==1 || element.options[element.selectedIndex].value==2){
			$("#answer_table").hide();
			$("#ranking_table").hide();
		}else if(element.options[element.selectedIndex].value==5){
			$("#answer_table").show();
			$("#ranking_table").show();
		}else{
			$("#answer_table").show();
			$("#ranking_table").hide();
		}
	};
	
	this.toggle_ranking = function() {
		
	};
};
ActivityAddQuestionController = new ActivityAddQuestionController();

$(document).ready(function() {
	//deal with the ranking choices
	$('#ranking_number').change(function (){
		if(!$.isNumeric($('#ranking_number').val())){
			$('#ranking_number').focus();
			alert("This field must be numeric");
			return false;
		}else{
			ActivityAddQuestionController.current_ranking_number = $('#ranking_number').val();
			//process the options here
			var current_size = $("#ranking_table div").size()-1;
			if(ActivityAddQuestionController.current_ranking_number<current_size){
				for(var i=current_size;i>ActivityAddQuestionController.current_ranking_number;i--){
					$("#priority_"+i).remove();
				}
			}else if(ActivityAddQuestionController.current_ranking_number>current_size){
				var current_priority = $("#priority_"+current_size+" input").val();
				console.log(current_size);
				for(var i=(current_size+1);i<=ActivityAddQuestionController.current_ranking_number;i++){
					current_priority -= 1;
					$("#ranking_table").append('<div class="clear form-group" id="priority_'+i+'"><label id="priority_'+i+'">Priority weight: #'+i+'</label><input type="text" name="priority_'+i+'_value" id="priority_'+i+'_value" value="'+current_priority+'" class="span12"></div>');
				}
			}
		}
	});
});