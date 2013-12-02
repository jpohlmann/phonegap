SurveyDesignView = function() {
	/**
	 * Holds the data params we need to process
	 * @var Json
	 */
	this.data = "";
	
	/**
	 * Holds the start pos of the priority ranking draggable elements
	 * @var Object
	 */
	this.start_pos;
	
        /**
         * Keep track of the last moved item (priority ranking)
         * @var Object
         */
	this.last_moved;
	
	/**
	 * Holds the mapping of answer to weight for priority ranking
	 * @var Array
	 */
	this.priority_ranking_mapping = [];
	
	/**
	 * Holds the form action
	 * @var String
	 */
	this.form_action = "/surveyengine/survey/add";
	
	/**
	 * Set the data to process
	 * @param JSON
	 */
	this.set_data = function(data) {
		this.data = data;
	};
	
	/**
	 * Render the question view
	 * @return void
	 */
	this.render = function() {
		var data = this.data;
		var html = '<form method="post" name="survey_form" id="survey_form">';
		html += '<input type="hidden" name="page_id" value="'+data.question_params.page_id+'" />';
		html += '<input type="hidden" name="survey_id" value="'+data.question_params.survey_id+'" />';
		html += '<input type="hidden" name="mode" value="live" />';
		html += '<input type="hidden" name="interval_id" value="'+data.question_params.interval_id+'" />';
		html += '<input type="hidden" name="question_id" value="'+data.question_params.question.question_id+'" />';
		html += '<input type="hidden" id="type" name="type" value="'+data.question_params.type+'" />';
		html += '<div id="user_feedback" style="display:none;"></div>';
		var question_text = data.question_params.question.question_text;
		html += '<div class="slot-1-2-3-4-5-6">'+question_text+'</div>';
		html += '<div class="row-fluid"><div id="content" class="span12"> ';
		html += '<div id="chk-gr2-bak">';
		//add the answers
		if(data.question_params.type=='priority_ranking'){
			
			html += "<p style='text-align: center; font-size: 14px;'>Please rank your answers by dragging from left to right and then sort according to rank: ";
			html += '<a href="javascript:" onclick="SurveyDesignViewController.revert_draggable();$(\'#error_message\').hide();" style="color: blue; text-decoration: underline;  margin-left: 12px;">Undo</a></p>';
			html += "<div id='error_message' style='color:red;font-weight:bold;'></div>";
			html += this.create_priority_ranking(data);
		}else{
			for(var i=0;i<data.question_params.answers.length;i++){
				html += this.create_html_element(data, data.question_params.answers[i], data.activity_id);
			}
		}
		//add the js script for priority ranking if needed
		if(data.question_params.type=='priority_ranking'){
			html += this.create_draggable_script();
		}
		html += '</div>';
                var activity_id = data.activity_id;
                if(data.question_params.type!='radio'){
                    html += '<div class="noleftmargin largetopmargin" style="clear:both;"><a id="data_submit" class="btn btn-primary btn-large btn-block" href="javascript:;" onclick="return SlideViewController.saveResponseData('+activity_id+', this);">Submit</a></div>';
                }		
		html += '</form></div></div></div>';
		return html;
	};
	
	/**
	 * Create the html element
	 * @param Object
	 * @param Object
         * @param Int
	 * @return String
	 */
	this.create_html_element = function(data, val, activity_id) {
		switch(data.question_params.type){
			case 'text':
				return '<input type="text" name="q_'+data.question_params.question.question_id+'" id="q_'+data.question_params.question.question_id+'" required class="span6">';
			break;
			case 'textarea':
				return '<textarea rows="10" class="span6" name="q_'+data.question_params.question.question_id+'" id="q_'+data.question_params.question.question_id+'" required></textarea>';
			break;
			case 'checkbox':
				return '<div class="checkbox"><label for="a_'+val.answer_id+'">'+'<input type="checkbox" name="a_'+val.answer_id+'" id="a_'+val.answer_id+'"> '+val.answer_text+'</label></div>';
			break;
                        case 'radio':
                            return '<label for="a_'+val.answer_id+'_label" class="radio">'+'<input onclick="SlideViewController.saveResponseData('+activity_id+', this);" type="radio" name="q_'+data.question_params.question.question_id+'" id="a_'+val.answer_id+'_label" value="a_'+val.answer_id+'_'+val.answer_text+'" > '+val.answer_text+'</label>';
                        break;
			default:
				return '<label for="a_'+val.answer_id+'_label" class="radio">'+'<input type="radio" name="q_'+data.question_params.question.question_id+'" id="a_'+val.answer_id+'_label" value="a_'+val.answer_id+'_'+val.answer_text+'" > '+val.answer_text+'</label>';
			break;
		};
	};
	
	/**
	 * Create the draggable script
	 * @return String
	 */
	this.create_draggable_script = function() {
		var html = '<script>$(function() {$( "#rankQ, #rankA" ).sortable({ connectWith: ".list" });});</script>';
		//html += '<script>$(".droppable").droppable({tolerance: \'intersect\',drop: function(event, ui) { for(var i=0;i<SurveyDesignViewController.priority_ranking_mapping.length;i++){ if(SurveyDesignViewController.priority_ranking_mapping[i].drop==$(this).attr("id")){ $("#error_message").html("Only 1 item per rank please!!");$("#error_message").show();return false;}; };SurveyDesignViewController.priority_ranking_mapping.push({ "drag" : ui.draggable.attr("id"), "drop" : $(this).attr("id") });var drop_p = $(this).offset();var drag_p = ui.draggable.offset();var left_end = drop_p.left - drag_p.left + 1;var top_end = drop_p.top - drag_p.top + 1;ui.draggable.animate({top: \'+=\' + top_end,left: \'+=\' + left_end});}});</script>';
		//html += '<script>$(".drop-target").droppable({ accept: ".draggable", scope: "drop", disabled: false, activeClass: "ui-state-hover", tolerance: \'intersect\',drop: function(event, ui) { $( this ).droppable( ); $(ui.draggable).draggable("disable"); $("#priority-left-column-container").sortable({connectWith: ".drop-target"}); $(".drop-target").sortable({connectWith: "#priority-left-column-container"});  SurveyDesignViewController.priority_ranking_mapping.push({ "drag" : ui.draggable.attr("id"), "drop" : $(this).attr("id") });var drop_p = $(this).offset();var drag_p = ui.draggable.offset();var left_end = drop_p.left - drag_p.left + 1;var top_end = drop_p.top - drag_p.top + 1;ui.draggable.animate({top: \'+=\' + top_end,left: \'+=\' + left_end});}});</script>';
                
		return html;
	};
	
	/**
	 * Create the priority ranking question type
	 * @param Object
	 * @return String
	 */
	this.create_priority_ranking = function(data) {
		//add the left container (has the questions)
		var html = "<div id='priority-left-column-container' class='well'>";
		
		html += '<ul id="rankQ">'
		for(var i=0;i<data.question_params.answers.length;i++){
			var val = data.question_params.answers[i];
			html += '<li class="draggable img-polaroid left-column-drag" style="cursor:pointer;" id="a_'+val.answer_id+'">'+val.answer_text+'</li>';
		}
		html += '</ul></div>';
		//now add the right container (has the rankings)
		var weights = data.question_params.ranking.weights.split(',');
		html += "<div id='priority-right-column-container' class='well'>";
		html += "<ul id='rankA' class='list'>";
		for(var i=0;i<weights.length;i++){
			html += '<input type="hidden" name="'+weights[i]+'" id="'+weights[i]+'" value="'+weights[i]+'" />';

		}
		html += '</ul>';
		html += '</div>';
		
		return html;
	
		//var html = "<div id='priority-left-column-container'>";
		//for(var i=0;i<data.question_params.answers.length;i++){
		//	var val = data.question_params.answers[i];
		//	html += '<div class="draggable img-polaroid left-column-drag" style="cursor:pointer;" id="a_'+val.answer_id+'"><p>'+val.answer_text+'</p></div>';
		//}
		//html += '</div>';
		//now add the right container (has the rankings)
		//var weights = data.question_params.ranking.weights.split(',');
		//html += "<div id='priority-right-column-container' class='well'>";
		//html += "<div class='drop-target'>";
		//for(var i=0;i<weights.length;i++){
		//	html += '<div class="img-polaroid" style="cursor:pointer;" id="'+weights[i]+'"><p style="padding: 12px;">Rank '+(i+1)+'</p></div>';
		//}
		//html += '</div>';
		//html += '</div>';
		
		//return html;
		
	//};
		
	};
	
	/**
	 * Revert the draggable
	 * @return void
	 */
	this.revert_draggable = function() {
		SurveyDesignViewController.priority_ranking_mapping = [];
		$( ".draggable" ).animate({
			left: (SurveyDesignViewController.start_pos.left /2 -71),
	    	top: (SurveyDesignViewController.start_pos.top /2 -67.5)
	    }, 500);
            $(".draggable").draggable("enable");
            $(".drop-target").droppable( "option", "disabled", false );
	};
};

$(document).bind('mobileinit',function(){
	$.mobile.page.prototype.options.keepNative = "#keepNative select, #keepNative input, #keepNative textarea, #keepNative button, #slideContainer select, #slideContainer input, #slideContainer textarea, #slideContainer button";
});

var SurveyDesignViewController = new SurveyDesignView();