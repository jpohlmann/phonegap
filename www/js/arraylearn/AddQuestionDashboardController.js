/**
 * The controller for the insert question to slide deck
 *
 * Uses JQuery
 *
 * @package   ArrayLearn
 * @author    Dean Clow <dclow@educationalmeasures.com>
 * @copyright 2013 Educational Measures
 * @license   Not licensed for external use.
 * @link      http://educationalmeasures.com/
 */

AddQuestionDashboardController = function(){
	/**
	 * Render the question list for an activity
	 * @param Int
	 */
	this.render_questions = function(id) {
		var html = '<div style="display: inline" align="center"><div id="question-choice-poll-submit-pre" class="btn btn-info" aria-disabled="false" data-dismiss="modal">Poll using Pre</div><div id="question-choice-poll-submit-post" class="btn btn-info largeleftmargin" data-dismiss="modal">Poll using Post</div></div>';
		$(function() {
			 $( "#dialog" ).dialog({
				 width:900,
				 title:'Select your interval:'
			 });
		 });
		 $("#pollingModal .modal-body").html(html);
		 $("#pollingModal").modal();
		 //now create the button event for the poll button
		 $("#question-choice-poll-submit-pre").click( function(){
			 AddQuestionDashboardController.insert_question(id, 1);
			 $("#question_selection_form input[type='radio']:checked").prop('checked', false);
		 });
		 $("#question-choice-poll-submit-post").click( function(){
			 AddQuestionDashboardController.insert_question(id, 2);
			 $("#question_selection_form input[type='radio']:checked").prop('checked', false);
		 });
                 $("#dismiss").click(function(){
                        $("#question_selection_form input[type='radio']:checked").prop('checked', false);
                 });
                 $("#dismiss_button").click(function(){
                        $("#question_selection_form input[type='radio']:checked").prop('checked', false);
                 });
	};

	/**
	 * Poll the question
	 * @param Int
	 */
	this.insert_question = function(question_id, interval_id) {
		if(question_id==0 || interval_id==0){
			alert("There was going to be a problem when committing this, so I stopped! Please refresh the screen and try again");
			return false;
		}
		//now we create the slide into the slide deck and refresh the deck listing)
		var url = "/arraylearn/dashboard/addquestiontoslide?id="+question_id
			+"&slide_deck_id="+SlideDashboardController.slideDeckId
			+"&current_slide="+SlideDashboardController.currentSlide
			+"&interval_id="+interval_id;
		$.ajax({
			type: "GET",
			url: url,
			dataType: "json",
		})
		.done(function(responseObj) {
			var current_index = parseInt($('#galleria').data('galleria').getIndex()) + 1;
			var history = current_index;
			$.each(responseObj, function(){
				var slideObj = {
		        		image: this.url,
		        		id: 'slide'+this.id,
		        		title: this.id,
		        		type:this.type,
		        		question_id:this.questionId,
		        		page_id:this.pageId,
		        		interval_id:this.intervalId,
		        		layer: '<div style="margin:10px;margin-left:20px;">'+this.questionHtml+'</div>',
		        		hover_title: this.title,
		        		response_count:this.responseCount
		        	};
				SlideDashboardController.slideToTypeMapping.splice( (current_index+1), 0, this.type);
				SlideDashboardController.slideResponseCount.splice( (current_index+1), 0, this.responseCount);
                                if($('#galleria').data('galleria').getNext()==0){
                                    $('#galleria').data('galleria').push( slideObj);
                                }else{
                                    $('#galleria').data('galleria').splice( current_index, 0, slideObj);
                                }
				current_index++;
			});
			$("#dialog").dialog('close');
			//give a small delay before we swap to the new slide (to allow the splice to happen)
			setTimeout(function(){
				$('#galleria').data('galleria').show(history);
			}, 500);
		})
		.fail(function(html) { document.write(html.responseText); alert("Error inserting question"); });
	};
};
AddQuestionDashboardController = new AddQuestionDashboardController();

$("#question-button").click( function(){
	AddQuestionDashboardController.render_questions();
});