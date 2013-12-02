var socket = null;
try{
	$.getScript('http://'+window.location.host+':8080/socket.io/socket.io.js');
	socket = io.connect('http://'+window.location.host+':8080', {
		'max reconnection attempts': Infinity,
		'reconnection delay': 3000
		}
	);
	chat = io.connect('http://'+window.location.host+':8080/chat', {
		'max reconnection attempts': Infinity,
		'reconnection delay': 3000
		}
	);
} catch(e) {
}
var datasource = [];
var slide_to_type_mapping = ['firstempty'];
var slide_response_count = ['firstempty'];
var is_active = true; //take the client side offline/online
var removeSlide = function(slide_number, slide_deck_id) {
	$.ajax({
        url: "/arraylearn/slide-view/delete-slide?slide_number="+slide_number+"&slide_deck_id="+slide_deck_id,
        type: "GET",
        async: false,
		complete: function(response){
	    	//do something here if we need to
			$('#galleria').data('galleria').splice( (slide_number-1), 1);
			slide_to_type_mapping.splice( (slide_number), 1);
			slide_response_count.splice( (slide_number), 1);
	    }
    });
};
var updateSlides = function(slideDeckId){
	slide_to_type_mapping = ['firstempty'];
	slide_response_count = ['firstempty'];
	if(!is_active) //if we want to take the slide deck offline for some reason we can do it here
		return;
	slide_deck_id = slideDeckId;
	var slides = [];
    $.ajax({
        url: "/arraylearn/dashboard/get-slide-deck?slide_deck_id="+slideDeckId,
        type: "GET",
        async: false,
        complete: function(response){
        	var responseObj = $.parseJSON(response.responseText);
        	datasource = responseObj;
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
        			activity_id: activity_id,
        			response_count: this.responseCount
        		};
        		slides.push(slideObj);
        		slide_to_type_mapping.push(this.type);
        		slide_response_count.push(this.responseCount);
        	});
        	data = slides;
        }
    });
    return slides;
};
// Load the classic theme
Galleria.loadTheme('/js/themes/classic/galleria.classic.min.js');
// Initialize Galleria
Galleria.run('#galleria', {dataSource: updateSlides(slide_deck_id), height:$(window).height()});
Galleria.ready(function(options) {
	var findIndexById = function(data, id){
		for(var x in data) {
			if (data[x].id == id) {
				return x;
			}
		}
		return null;
	};
	var slide_index = null;
	if (current_slide != null) {
		slide_index = findIndexById(this._data, 'slide'+current_slide);
	}
	Galleria.configure({
		maxScaleRatio:1,
		imageMargin:10,
		responsive:true,
	    _toggleInfo: false,
	    showInfo: false,
	    show: slide_index,
	    extend: function() {
	    }
	});
	this.bind('thumbnail', function(e) {
		var index = (e.index + 1);
		//add the slide number
		$(e.thumbTarget).parent().append('<div class="galleria-slide-number" style="width:30px;z-index:1000;">'+index+'</div>');
		//add the slide delete, etc
		if(slide_to_type_mapping[index]!='SLIDE'){
			if(slide_to_type_mapping[index]=='QUESTION'){
				$(e.thumbTarget).parent().append('<div class="galleria-slide-type response" slidenumber="'+index+'" style="z-index:1000;margin-top:30px;">QUESTION<br /><span style="font-size:12px;" id="respcount_'+index+'">('+slide_response_count[index]+')</span></div>');
			}else{
				//we add a class and an attribute to this so we can update the response count later
				$(e.thumbTarget).parent().append('<div class="galleria-slide-type response" slidenumber="'+index+'" style="z-index:1000;margin-top:30px;">RESPONSE<br /><span style="font-size:12px;" id="respcount_'+index+'">('+slide_response_count[index]+')</span></div>');
			}
		}else{
			$(e.thumbTarget).parent().append('<div class="galleria-slide-type" style="z-index:1000;">&nbsp;</div>');
		}
		$(e.thumbTarget).parent().append('<div class="galleria-slide-delete" style="width:25px;z-index:1000;"><img src="/img/delete.png" onclick="if(confirm(\'Are you sure you want to do this?\')){ removeSlide('+index+', '+slide_deck_id+'); }else{ return false; }" /></div>');
		//add the hover event
		this.bindTooltip( e.thumbTarget, this.getData( e.index ).hover_title );
	});
	this.attachKeyboard({
	    left: this.prev, // applies the native prev() function
	    right: this.next,
	    up: this.prev,
	    down: this.next
	});
    this.bind('image', function(e) {
    	if(!is_active) //take offline if needs be
    		return;
    	var slide = this.getData(e.index);
    	if (slide.type == 'QUESTION' || slide.type == 'RESPONSE') {
        	$(document).bind("keydown", DisableArrowKeys); //take away the presenters clicker actions!!!!!
    	}
        var nextSlide = this.getData(this.getNext());
        var slideId = this.getData().title;
        current_slide = slideId;
        $.ajax({
            url: "/arraylearn/activity/update-current-slide",
            type: "POST",
            async: false,
            data: {
                activity_id: activity_id,
                current_slide_id: slideId
            }
        })
        .complete(function(response) {
        });
        var questionParams = {};
        var chartOutput = null;
        var type = 'SLIDE';
        if (slide.type == 'QUESTION' || slide.type == 'RESPONSE') {
	        $.ajax({
	            url: "/arraylearn/slide-view/get-current-slide/"+activity_id+"?activity_id="+activity_id,
	            type: "GET",
	            dataType: 'json',
	            async: false,
	            complete: function(response){
	            	var responseObj = $.parseJSON(response.responseText);
			questionParams = responseObj.question_params;
	            	chartOutput = responseObj.chart_output;
	            }
	        });
        }else{
        	try{
        		$(document).unbind("keydown", DisableArrowKeys);
        	}catch(e){}
        }
        var slideObject = {
            slide_url: e.imageTarget.src,
            next_slide_url: nextSlide.image,
            question_params: questionParams,
            chart_output: chartOutput,
            activity_id: activity_id,
            slide_id:slideId,
        };
        if (socket != null) {
        	try{
        		socket.emit('newSlide', slideObject);
        	} catch(e) {
        	}
        } else {
        	try{
        		$.getScript('http://'+window.location.host+':8080/socket.io/socket.io.js');
        		socket = io.connect('http://'+window.location.host+':8080', {
        			'max reconnection attempts': Infinity,
        			'reconnection delay': 3000
        			});
        		socket.emit('newSlide', slideObject);
        		chat = io.connect('http://'+window.location.host+':8080/chat', {
        			'max reconnection attempts': Infinity,
        			'reconnection delay': 3000
        			}
        		);
        	} catch(e) {
        	}
        }
    });
});
var updateResponseCount = function(){
	var count = 1;
	$(".galleria-thumbnails .galleria-image").each(function(val){
		if ($('#respcount_'+count)) {
			$('#respcount_'+count).html('('+slide_response_count[count]+')');
		}
        count++;
	});
    $('#galleria').data('galleria').unbind('loadfinish');
};
var DisableArrowKeys = function(e){
	var ar = new Array(37, 38, 39, 40);
    if ($.inArray(e.which, ar) > -1) {
    	//alert('here');
        e.preventDefault();
        return false; 
    }
    return true;
};

var last_slide_online = null;
$(document).ready(function(){
	$('#slideDecks').change(function(){
		$('#galleria').data('galleria').load(updateSlides($(this).val()));
	});	
	$("#take_offline").click(function(){
		is_active = is_active? false : true;
		if(is_active){
			$('#galleria').data('galleria').show(last_slide_online);
			$("#take_offline").prop('value', 'ONLINE');
		}else{
			last_slide_online = $('#galleria').data('galleria').getIndex();
			$("#take_offline").prop('value', 'OFFLINE');
		}
	});
	
	//now create the button event for the poll button
	 $("#question-choice-poll-submit-pre").click( function(){
		 AddQuestionDashboardController.insert_question($("#question_selection_form input[type='radio']:checked").val(), activity_id, 1);
	 });
	 $("#question-choice-poll-submit-post").click( function(){
		 AddQuestionDashboardController.insert_question($("#question_selection_form input[type='radio']:checked").val(), activity_id, 2);
	 });
	 
	 try{
		 chat.on('updateResponseCount', function (data) {
			 $.ajax({
		            url: "/arraylearn/dashboard/get-response-count/"+current_slide,
		            type: "GET",
		            dataType: 'json',
		            async: false,
		            complete: function(response){
		            	//update the slide response number
		            	var slide_num = $('#galleria').data('galleria').getIndex();
		            	slide_response_count[(slide_num+1)] = response.responseText;
		            	if(slide_to_type_mapping[(slide_num+2)]=='RESPONSE'){
		            		slide_response_count[(slide_num+2)] = response.responseText;
		            	}
		            	updateResponseCount();
		            }
		     });
			 
		 });
	 }catch(e){}
	 $( "#tabs" ).tabs();
	 PresenterQuestionController.render(activity_id); //render the presenter questions
	 setInterval(function(){
		 PresenterQuestionController.render(activity_id); //re-render the presenter questions every 15 seconds
	 }, 15000); //every 15 seconds
	 try{
		 $( document ).tooltip( "option", "tooltipClass", "test_tooltip" ); 
	 }catch(e){}
	 $("#question_side_panel").height($(window).height());
	 $("#tabs").height($(window).height());
});
