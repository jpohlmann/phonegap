/**
 * The controller for the presenter questions
 *
 * Uses JQuery
 *
 * @package   ArrayLearn
 * @author    Dean Clow <dclow@educationalmeasures.com>
 * @copyright 2013 Educational Measures
 * @license   Not licensed for external use.
 * @link      http://educationalmeasures.com/
 */

PresenterQuestionController = function() {
	/**
	 * Holds the current state of the presenter question screen
	 * @var String
	 */
	this.state = "UNANSWERED";
	
	/**
	 * Holds the multi action selections
	 * @var Array
	 */
	this.multiaction = [];
	
	/**
	 * Set the state
	 * @param String
	 */
	this.set_state = function(state) {
		this.state = state;
	};
	
	/**
	 * Render the presenter form
	 * @param Int
	 */
	this.render = function(activity_id) {
                if ( !activity_id )
                    return false;
		var url = "/arraylearn/presenter/dashboard/"+activity_id;
		$.ajax({
			type: "GET",
			url: url
		})
		.done(function(response) {
			$(".presenter-question").html(response);
			if($('.presenter-question tr').size()!=0){
				$("#pqcount").html($('.presenter-question tr').size()/2);
                                $("#presenterquestionscount").html($('.presenter-question tr').size()/2);
			}else{
				$("#pqcount").html('0');
                                $("#presenterquestionscount").html("0");
			}
		})
		.fail(function(html) {
			$('#failedQretreive').show();
		});
	};
	
	/**
	 * Render unanswered questions for an activity
	 * @param Int
	 */
	this.render_question_list = function(activity_id) {
		this.multiaction = [];
		var url = "/arraylearn/presenter/get-question-table/"+activity_id+"?view="+this.state;
		$.ajax({
			type: "GET",
			url: url
		})
		.done(function(html) {
			if(PresenterQuestionController.state=="UNANSWERED"){
				$("#pQuestions").html(html);
			}else{
				$("#cQuestions").html(html);
			}
		})
		.fail(function() {
			alert("Failed to update question list");
			return;
		});
	};
	
	/**
	 * Process the presenter click (this tells the system that a question has been answered or not)
	 * @param Object
	 * @param String
	 * @param Int
	 * @return Boolean
	 */
	this.toggle_is_answered = function(questions, activity_id, refresh) {
		//now send the message to update the db
		var url = "/arraylearn/presenter/answer?questions="+questions;
		$.ajax({
			type: "GET",
			url: url
		})
		.complete(function(html) {
			PresenterQuestionController.render_question_list(activity_id);
			socket.emit('newPresenterQuestion');
		})
		.fail(function() {
			alert("Failed to update");
			return;
		});
	};
	
	/**
	 * Toggle on/off the multi action
	 * @param Object
	 * @return Boolean
	 */
	this.toggle_multi_action_select = function(element) {
		if(this.multiaction.length<1){
			this.multiaction.push(element.id);
			return true;
		}
		var add = true;
		for(var i=0;i<=this.multiaction.length;i++){
			if(this.multiaction[i]==element.id){
				add = false;
				this.multiaction.splice(i,1);
			}
		}
		if(add==true){
			this.multiaction.push(element.id);
		}
	};
	
	/**
	 * Perform an action on multiple selected ites
	 * @param String
	 * @param Int
	 * @return Boolean
	 */
	this.performaction = function(type, activity_id) {
		if(this.multiaction.length==0){
			alert("Please select question to perform this action on");
			return false;
		}
		switch(type) {
			case 'hide':
				this.toggle_is_answered(this.multiaction.join(','), activity_id, true);
				break;
			case 'flag':
				this.flag(this.multiaction.join(','), activity_id, true);
				break;
			case 'unflag':
				this.unflag(this.multiaction.join(','), activity_id, true);
				break;
		}
		this.multiaction = [];
		socket.emit('newPresenterQuestion');
	};
	
	/**
	 * Flag a set of questions
	 * @param Object
	 * @param String
	 * @param Int
	 * @return Boolean
	 */
	this.flag = function(questions, activity_id, refresh) {
		//now send the message to update the db
		var url = "/arraylearn/presenter/flag?questions="+questions;
		$.ajax({
			type: "GET",
			url: url
		})
		.complete(function(html) {
			PresenterQuestionController.render_question_list(activity_id);
			socket.emit('newPresenterQuestion');
		})
		.fail(function() {
			alert("Failed to update");
			return;
		});
	};
	
	/**
	 * Un-Flag a set of questions
	 * @param Object
	 * @param String
	 * @param Boolean
	 * @return Boolean
	 */
	this.unflag = function(questions, activity_id, refresh) {
		//now send the message to update the db
		var url = "/arraylearn/presenter/unflag?questions="+questions;
		$.ajax({
			type: "GET",
			url: url
		})
		.complete(function(html) {
			PresenterQuestionController.render_question_list(activity_id);
			socket.emit('newPresenterQuestion');
		})
		.fail(function() {
			alert("Failed to update");
			return;
		});
	};
	
	/**
	 * Render the modal window view
	 * @param Object
	 * @param Int
	 * @param Int
	 * @param Int
	 * @param Int
	 * @return void
	 */
	this.render_modal = function(element, uid, activity_id, is_flagged, is_hidden) {
		var html = element.innerHTML.replace(/<img[^>]*>/g,""); //strip the flag image
		$(".modal-body p").html(html);
		$("#buttonshere").html('<br /><div id="action_bar_uncleared" style="margin-left:20px;"><a href="javascript:PresenterQuestionController.modal_performaction(\'hide\', '+activity_id+', '+uid+', '+is_flagged+', '+is_hidden+');" id="hidden_text">Un-hide</a>&nbsp;&nbsp;&nbsp;&nbsp;<a href="javascript:PresenterQuestionController.modal_performaction(\'flag\', '+activity_id+', '+uid+');">Flag</a>&nbsp;&nbsp;&nbsp;&nbsp;<a href="javascript:PresenterQuestionController.modal_performaction(\'unflag\', '+activity_id+', '+uid+');">Unflag</a></div>');
		if(!is_hidden)
			$("#hidden_text").html('Hide');
		$('#details').modal('show');
	};
	
	/**
	 * Perform an action from the modal window
	 * @param String
	 * @param Int
	 * @param Int
	 * @param Int
	 * @return Boolean
	 */
	this.modal_performaction = function(type, activity_id, uid, is_flagged, is_hidden) {
		switch(type) {
			case 'hide':
				this.toggle_is_answered(uid, activity_id, false);
				if(is_hidden){
					$("#buttonshere").html('<br /><div id="action_bar_uncleared" style="margin-left:20px;"><a href="javascript:PresenterQuestionController.modal_performaction(\'hide\', '+activity_id+', '+uid+', '+is_flagged+', 0);">Hide</a>&nbsp;&nbsp;&nbsp;&nbsp;<a href="javascript:PresenterQuestionController.modal_performaction(\'flag\', '+activity_id+', '+uid+');">Flag</a>&nbsp;&nbsp;&nbsp;&nbsp;<a href="javascript:PresenterQuestionController.modal_performaction(\'unflag\', '+activity_id+', '+uid+');">Unflag</a></div>');
				}else{
					$("#buttonshere").html('<br /><div id="action_bar_uncleared" style="margin-left:20px;"><a href="javascript:PresenterQuestionController.modal_performaction(\'hide\', '+activity_id+', '+uid+', '+is_flagged+', 1);">Un-Hide</a>&nbsp;&nbsp;&nbsp;&nbsp;<a href="javascript:PresenterQuestionController.modal_performaction(\'flag\', '+activity_id+', '+uid+');">Flag</a>&nbsp;&nbsp;&nbsp;&nbsp;<a href="javascript:PresenterQuestionController.modal_performaction(\'unflag\', '+activity_id+', '+uid+');">Unflag</a></div>');
				}
				break;
			case 'flag':
				this.flag(uid, activity_id, false);
				break;
			case 'unflag':
				this.unflag(uid, activity_id, false);
				break;
		}
		this.multiaction = [];
		socket.emit('newPresenterQuestion');
	};
};
PresenterQuestionController = new PresenterQuestionController();