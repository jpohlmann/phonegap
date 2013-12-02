/**
 * The controller for the slide notes
 *
 * Uses JQuery
 *
 * @package   ArrayLearn
 * @author    Dean Clow <dclow@educationalmeasures.com>
 * @copyright 2013 Educational Measures
 * @license   Not licensed for external use.
 * @link      http://educationalmeasures.com/
 */

SlideNotesController = function() {
	this.activity_id = 0;
	this.registration_id = 0;
	this.current_slide_id = 0;
	this.allowed_to_change_slide_id = true;
	
	/**
	 * Render the form
	 * @param Int
	 * @param Int
	 */
	this.render = function(activity_id, registration_id) {
		this.activity_id = activity_id;
		this.registration_id = registration_id;
		this.current_slide_id = SlideViewController.current_slide_id; //keeps a track of the slide id they clicked on
		SlideNotesController.allowed_to_change_slide_id = false;
		$("#notesload").click();
	};
	
	/**
	 * Process the form
	 * @info This uses the CURRENT slide AFTER the button click (not the current viewed slide id)
	 */
	this.process = function() {
		if($("#email").val()==""){
			$("#error_message").show();
			$('.email-note.control-group').addClass('error');
			$('.email-note span.help-block').show();
			return false;
		}
		//test if email is an email
		if(typeof $("#email").val()!=='undefined'){
			var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
			if( !emailReg.test( $("#email").val() ) ) {
				$("#error_message").show();
				$('.email-note.control-group').addClass('error');
				$('.email-note span.help-block').show();
				return false;
			}
		}
		$("#error_message").hide();
		if($("#text").val()==""){
			$("#error_message_note").show();
			$('.note-text.control-group').addClass('error');
			$('.note-text span.help-block').show();
			return false;
		}
		$("#error_message_note").hide();
		$.ajax({
			type: "POST",
			crossDomain: true,
			headers: {
				"Array-Registration-Id": SlideViewController.user_id,
				"Array-Activity-Id": SlideViewController.activity_id
			},
			data: $("#slide_note").serialize(),
			url: 'http://'+SlideViewController.socket_host+'/arraylearn/dashboard/slidenote'
		})
		.done(function(html) {
                        try{
                            socket.emit("updateNoteCount");
                        }catch(e){}
			$('#noteSuccessModal').modal('show');
			$('.notes-container').hide();
			if ($('#email').length != 0) {
				$('#email').remove();
				$('#emailLabel').remove();
			}
			$('#slideContainer').show();
			setTimeout(function(){
				$('#noteSuccessModal').modal('hide');
				$('.control-group').removeClass('error');
				$('#fullScreenWrapper').show();
				$('span.help-block').hide();
				$('#hideFS').css('margin-left', '0px');
			}, 2000);
			SlideNotesController.allowed_to_change_slide_id = true; //allow the socketclient to modify the slide id
			SlideNotesController.current_slide_id = SlideViewController.current_slide_id; //change the current slide to the newest slide id
		})
		.fail(function(response) { console.log(response.responseText); });
	};
};
SlideNotesController = new SlideNotesController();