var socket = null;
var pageReload = true;
$(document).ready(function(){
    var preloadDeckUrl = function(){
        for (var id in slideDeck) {
            if ((window.slideDeck[id].image == null) && (parseInt(id) > parseInt(current_slide_id))) {
                window.slideDeck[id].image = preload(window.slideDeck[id].url);
                break;
            }
        }
    };
    var preloadLoop = setInterval(preloadDeckUrl, 6000);
    
    /**
     * Get the rating for the current slide from the rating array.
     * 
     * @param slideId Id of slide
     * 
     * @return int
     */
    var getRating = function(slideId){
    	if (window.rating[user_id+"#"+slideId] != undefined) {
    		return window.rating[user_id+"#"+slideId];
    	}
    	return null;
    };
    var slidePull = function(){
        if ((socket == null) || (!socket.socket.connected)) {
            if ((typeof io != "undefined")) {
                //IF SOCKET NOT FOUND
                if((socket == null) || (!socket.socket.connecting)) {
                    socket = io.connect('http://'+socket_host+':'+socket_port);
                    socket.on('clearClientCookies', function () {
                        var rand = parseInt(Math.floor((Math.random()*9)+1)) + 1000; //randomize up to 10 seconds
                        setTimeout(function(){
                            $.cookie('activity_id', null, { path: '/' });
                            $.cookie('registration_id', null, { path: '/' });
                            $.cookie('attendee_id', null, { path: '/' });
                            window.location.reload();
                        }, rand);
                    });                    
                    socket.on('updateSlide', function (data) {
                        clearTimeout(preloadLoop);
                        showSlide(data);
                        preloadLoop = setInterval(preloadDeckUrl, 6000);
                    });
                    socket.on('disconnect', function(){
                        setTimeout(function(){slidePull();}, 3000);
                    });
                    socket.on('activityEnd', function(){
                    	window.location.href='/arraylearn/slide-view/no-activity-running';
                    });
                    socket.on('refreshClientDevices', function(){
                    	var rand = parseInt(Math.floor((Math.random()*9)+1)) + 1000; //randomize up to 10 seconds
                        setTimeout(function(){
                            location.reload();
                        }, rand);
                    });
                	socket.on('updateButtons', function(){
                		var url = "/arraylearn/client/getbuttons";
                		$.ajax({
                			type: "POST",
                			url: url
                		})
                		.done(function(response) {
                			$("#button-container").html(response);
                		})
                		.fail(function(html) { alert("Error updating buttons"); });
                	});
                }
            }
            $.ajax({
                type: "GET",
                url: '/arraylearn/slide-view/get-current-slide',
                dataType: "json"
            })
            .done(function(response) {
            	if (response.activity_id == 0) {
                    window.location.href='/arraylearn/slide-view/no-activity-running';
            	}
                showSlide(response);
                setTimeout(function(){slidePull();}, 3000); //BUG HERE WITH RANKING QUESTIONS
                var rating = getRating(response.slide_id);
                $('.ratings_stars').removeClass('ratings_vote');
                $('.voted').html('');
                for (var i= 1; i <= rating; i++) {
                    $('.star_'+i).addClass('ratings_vote');
                }                  
            })
            .fail(function(response) {});
        }
    };
    var getImage = function(src) {
        var image = $('<img/>', {'src': src} );
        image.attr('id', 'theSlide');
        image.attr('alt', 'slide');
        image.load();
        return image;
    };
    var preload = function(image) {
        return getImage(image);
    };
    var setChartingSettings = function(controller) {
		if (activity_settings.graphDisable3d != null) {
			controller.disable_3d = (activity_settings.graphDisable3d == "1");
		}
    	if (activity_settings.graphHanddrawn != null) {
    		controller.handdrawn = (activity_settings.graphHanddrawn == "1");
    	}
    	if (activity_settings.graphDisableGridlines != null) {
    		controller.disable_gridlines = (activity_settings.graphDisableGridlines == "1");
    	}
    	if (activity_settings.graphDynamicScale != null) {
    		controller.dynamic_scale = (activity_settings.graphDynamicScale == "1");
    	}
    	if (activity_settings.graphInlineAnswers != null) {
    		controller.inline_answers = (activity_settings.graphInlineAnswers == "1");
    	}
    	if (activity_settings.graphCustomPointlabelSize != null) {
    		controller.custom_pointlabel_size = activity_settings.graphCustomPointlabelSize;
    	}
    	if (activity_settings.graphCustomLabelsize != null) {
    		controller.label_size = activity_settings.graphCustomLabelsize;
    	}
    	if (activity_settings.graphLabelbold != null) {
    		controller.label_bold = (activity_settings.graphLabelbold == "1");
    	}
    	if (activity_settings.graphCustomLabelfont != null) {
    		controller.label_font = activity_settings.graphCustomLabelfont;
    	}
    	return controller;
    	
    }
    function showSlide(json) {
    	SurveyDesignViewController.priority_ranking_mapping = [];
        if ( json.question_params )
            json.question_params.activity_id = json.activity_id;
        if ((current_slide_id == json.slide_id) && (!pageReload)) {
        	return true;
        }
        current_slide_id = json.slide_id;
        if(SlideNotesController.allowed_to_change_slide_id==true)
            SlideNotesController.current_slide_id = json.slide_id;
        //Fix to git rid of the chart resize listener, because it was
        //redrawing the chart.
        $(window).unbind('resize');
        if (typeof (json) === 'object' && null !== json) { //if question
            if (json.question_params && json.question_params.page_id != undefined && json.chart_output == null) {
                //create a new design view js
                var view = new SurveyDesignView();
                view.set_data(json);
                if ($('#survey_form').length == 0  && $('.notes-container').length == 1) {
					$('link[id="styleCss"]').prop('disabled', false); // User in Take a Note / Stylus view, enable style.css
					$('link[id="mobileCss"]').prop('disabled', false); // User in Take a Note / Stylus view, enable mobile.css
				} else if ($('#survey_form').length == 0) {
					$('link[id="styleCss"]').prop('disabled', false); // fallback: if not polling, enable style.css
					$('link[id="mobileCss"]').prop('disabled', false); // fallback: if not polling, enable mobile.css
				} else {
					$('link[id="styleCss"]').prop('disabled', false); // fallback: if not polling, enable style.css
					$('link[id="mobileCss"]').prop('disabled', false); // fallback: if not polling, enable mobile.css
				}
	                
                $('#iframeContainer').hide();
                $('#fullScreenWrapper').hide();
                $('#slideArea').show();
                $('#hideFS').hide();
				$('.toggle-polling').hide();
				$('#slideAreaWrapper').removeClass('span10').addClass('span12');
                $("#slideArea").html(view.render());
                
                $('#slideAreaWrapper').show();
                $( "div[data-role=page]" ).page( "destroy" ).page(); //re-style the page controls using jquery mobile!!!
                
            
            } else if (json.chart_output != null) { //if results
            	$('#fullScreenWrapper').hide();
            	$('#iframeContainer').hide();
                $('#hideFS').hide();
                $('#slideAreaWrapper').removeClass('span10').addClass('span12').css('margin-top', '30px');
            	$( "div[data-role=page]" ).page( "destroy" ).page(); //re-style the page controls using jquery mobile!!!
            	$('#slideAreaWrapper').show();                
            	var view = new ChartingController();
            	view = setChartingSettings(view);
                view.set_data(json);
                view.render(); //render the chart  
                $(window).resize(function() {
					view = new ChartingController();
	            	view = setChartingSettings(view);
					view.set_data(json);
                	view.render(); //render the chart again so it redraws and fills the screen on orientation change 
                });
                if ($('#survey_form').length == 0  && $('.notes-container').length == 1) {
					$('link[id="styleCss"]').prop('disabled', false); // User in Take a Note / Stylus view, enable style.css
					$('link[id="mobileCss"]').prop('disabled', false); // User in Take a Note / Stylus view, enable mobile.css
				} else if ($('#survey_form').length == 0) {
					$('link[id="styleCss"]').prop('disabled', false); // fallback: if not polling, show style.css
					$('link[id="mobileCss"]').prop('disabled', false); // fallback: if not polling, show mobile.css
				} else {
					$('link[id="styleCss"]').prop('disabled', false); // fallback: if not polling, show style.css
					$('link[id="mobileCss"]').prop('disabled', false); // fallback: if not polling, show mobile.css
				}              
            } else {
                if (json['slide_url']) {
                    if ('' != json.slide_url) {
                        if (($('#theSlide') == undefined) || ($('#theSlide').attr('src') != json.slide_url)) {
                            var rating = 0;
                            if ( window.rating[user_id+'#'+json.slide_id]!= undefined)
                                rating = window.rating[user_id+'#'+json.slide_id];
                            $('.ratings_stars').removeClass('ratings_vote');
                            $('.voted').html('');
                            for (var i= 1; i <= rating; i++) {
                                $('.star_'+i).addClass('ratings_vote');
                            }                      
                            var newImage = null;
                            if ((window.slideDeck[json.slide_id] == undefined) || (window.slideDeck[json.slide_id].image == null)) {
                                var newSlideObj = {
                                	'url' : json.slide_url,
                                	'image' : getImage(json.slide_url)
                                };
                            	window.slideDeck[json.slide_id] = newSlideObj;
                            }
                            newImage = window.slideDeck[json.slide_id].image;
                            $('link[id="styleCss"]').prop('disabled', false); // enable style.css
							$('link[id="mobileCss"]').prop('disabled', false); // enable mobile.css
                            $('#slideArea').empty();
                            $('#hideFS').show();
                            newImage.appendTo($('#slideArea'));
                            if($('#fullScreen').css('display') != 'none'){
                            	$('#hideFS').show();
                            	$('#slideAreaWrapper').removeClass('span12').addClass('span10').css('margin-top', '8px');
                            }
                            $('#fullScreenWrapper').show();
							$('link[id="styleCss"]').prop('disabled', false); // fallback: if not polling, enable style.css
							$('link[id="mobileCss"]').prop('disabled', false); // fallback: if not polling, enable mobile.css 
                         }
                    } // json.slide_url
                } //json['slide_url']
            } 
        }
        //We're controlling via json from here on out
    	pageReload = false;
    }
    slidePull();
});

function saveReponseData(activity_id, element){
	//validation for textareas
    var allow = true;
    $("#survey_form textarea").each(function() {
         if(this.value==""){
             alert("Please enter an answer");
             allow = false;
         }
     });
    //validation for text
    $("#survey_form input[type=text]").each(function() {
        if(this.value==""){
            alert("Please enter an answer");
            allow = false;
        }
    });
    //validation for radio
    if($("[name='type']").val()=='radio'){
    	if(typeof $('input[type=radio]:checked', '#survey_form').val()=='undefined'){
    		alert("Please select an answer");
            allow = false;
    	}
    };
    //validation for checkbox
    if($("[name='type']").val()=='checkbox'){
    	if(typeof $('input[type=checkbox]:checked', '#survey_form').val()=='undefined'){
    		alert("Please select an answer");
            allow = false;
    	}
    };
    if(allow==false)
        return false;
    
    
    var data = $("#survey_form").serialize();
    if($("#type").val()=='priority_ranking'){
    	var url = "&";
    	for(var i=0;i<SurveyDesignViewController.priority_ranking_mapping.length;i++){
            url += SurveyDesignViewController.priority_ranking_mapping[i].drag + '=' + SurveyDesignViewController.priority_ranking_mapping[i].drop + '&';
    	}
    	data += url;
    }
    $.ajax({
        url: "/arraylearn/slide-view/view",
        type: "POST",
        data: data,
        async: false,
        complete: function(response){
            var currentdate = new Date();
            var minutes = "" + currentdate.getMinutes();
            if(minutes.length==1)
                minutes = '0' + minutes;
            var seconds = "" + currentdate.getSeconds();
            if(seconds.length==1)
                seconds = '0' + seconds;
            var datetime =  currentdate.getHours() + ":"  
                            + minutes + ":" 
                            + seconds;
            $("#user_feedback").html('<div id="response_submitted" class="alert alert-block alert-success fade in"><button type="button" class="close" data-dismiss="alert">&times;</button><h4 class="alert-heading">Your answer has been submitted.</h4><p>To modify your answer, select new answer and tap submit.</p><p>Last response submitted @ '+datetime+'</p></div><div>');
            $("#user_feedback").show();
            socket.emit('updateResponses');
        }
    });
};
