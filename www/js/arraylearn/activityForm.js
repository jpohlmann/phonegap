$(document).ready(function(){

    $('#edit_activity').on('submit', function(){
    	if(!$('#emailForm').validationEngine('validate')){
            return false;
        }
        return true;
    });
});