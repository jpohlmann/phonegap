/**
 * The controller for the faculty questions
 *
 * Uses JQuery
 *
 * @package   ArrayLearn
 * @author    Dean Clow <dclow@educationalmeasures.com>
 * @copyright 2013 Educational Measures
 * @license   Not licensed for external use.
 * @link      http://educationalmeasures.com/
 */

FacultyQuestionController = function() {
	this.activity_id = 0;
	this.registration_id = 0;
	
	/**
	 * Render the form
	 * @param Int
	 * @param Int
	 */
	this.render = function(activity_id, registration_id) {
		this.activity_id = activity_id;
		this.registration_id = registration_id;
	};
	
	/**
	 * Process the form
	 */
	this.process = function() {
		if($("#question").val()==""){
			$('.control-group').addClass('error');
			$('span.help-block').show();
			return false;
		}
		var url = "http://"+SlideViewController.socket_host+"/arraylearn/dashboard/facultyquestion?activity_id="+FacultyQuestionController.activity_id+"&registration_id="+FacultyQuestionController.registration_id+"&current_slide="+SlideViewController.current_slide_id+"&";
		url += $("#faculty_question").serialize();
		$.ajax({
			type: "GET",
			headers: {
				"Array-Registration-Id": SlideViewController.user_id,
				"Array-Activity-Id": SlideViewController.activity_id
			},
			crossDomain: true,
			url: url
		})
		.done(function(html) {
			$('#questionSuccessModal').modal('show');
			try{
				socket.emit('newPresenterQuestion');
			}catch(e){}
			$('.questions-container').hide();
			$('#slideContainer').show();
			setTimeout(function(){
				$('#questionSuccessModal').modal('hide');
				$('.control-group').removeClass('error');
				$('span.help-block').hide();
			}, 2000);
		})
		.fail(function() { 
			/* alert("error submitting faculty question"); */ 
			$('#questionFailAlert').show();
		});
	};
};
FacultyQuestionController = new FacultyQuestionController();