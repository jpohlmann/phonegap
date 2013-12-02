$(document).ready(function(){
    $('#edit_question').on('submit', function(){
    	if(!$('#edit_question').validationEngine('validate')){
            return false;
        }
    	if($("#question_type_id").val()=="ERROR"){
    		alert('Please select a category');
    		return false;
    	}
    	if($("#question_display_type_id").val()=="ERROR"){
    		alert('Please select a type');
    		return false;
    	}
        return true;
    });
});