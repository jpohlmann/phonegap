SlideDashboardController = function() {
    /**
     * Holds the connection to the socket server
     * @var Object
     */
    this.socket = null;
    
    /**
     * Holds the chat socket connection
     * @var Object
     */
    this.chat = null;
    
    /**
     * Flag for if we are in offline mode or not
     * @var Boolean
     */
    this.isActive = true;
    
    /**
     * Holds the main datasource for galleria
     * @var Array
     */
    this.datasource = [];
    
    /**
     * Holds the slide type mapping (i.e. Question, Response, Slide)
     * @var Array
     */
    this.slideToTypeMapping = ['firstempty'];
    
    /**
     * Holds the slide response counts
     * @var Array
     */
    this.slideResponseCount = ['firstempty'];

    /**
     * Holds the current slide deck id
     * @var Int
     */
    this.slideDeckId = 0;
    
    /**
     * Holds the current slide id
     * @var Int
     */
    this.currentSlide = 0;
    
    /**
     * Holds the activity id
     * @var Int
     */
    this.activityId = 0;
    
    /**
     * The host of the socket server
     * @var string
     */
    this.socket_host = '';
    
    /**
     * The port of the socket server
     * @var integer
     */
    this.socket_port = 0;
    
    /**
     * Flag whether to disable arrow keys or not
     * @var Boolean
     */
    this.galleriaKeysDisabled = false;
    
    /**
     * Set the activity id
     * @param Int activityId
     * @returns void
     */
    this.setActivityId = function(activityId) {
        this.activityId = activityId;
    };
    
    /**
     * Set the current slide id
     * @param Int slideId
     * @returns void
     */
    this.setCurrentSlideId = function(slideId) {
        this.currentSlide = slideId;
    };
    
    /**
     * Set the slide deck id
     * @param Int deckId
     * @returns void
     */
    this.setSlideDeckId = function(deckId) {
        this.slideDeckId = deckId;
    };
    
    /**
     * Render the main view pieces
     * @return void
     */
    this.render = function() {
        $.ajax({
            url: "/arraylearn/dashboard/get-socket-settings",
            type: "GET",
            async: false,
            complete: function(response){
                var settingsArray = $.parseJSON(response.responseText);
                var settings = settingsArray[0];
                SlideDashboardController.socket_port = settings.port;
                SlideDashboardController.socket_host = settings.host;
            }
        });
        if ($.QueryString["offline"] == "1") {
            this.isActive = false;
        };            
        //set up the Galleria interface
        Galleria.loadTheme('/js/themes/classic/galleria.classic.min.js');
        // Initialize Galleria
        Galleria.run('#galleria', {dataSource: this.updateSlides(this.slideDeckId), height:$(window).height()});
        Galleria.ready(function(options) {
            Galleria.configure({
                maxScaleRatio:1,
                imageMargin:10,
                responsive:true,
                _toggleInfo: false,
                showInfo: false,
                show: SlideDashboardController.findIndexById(this._data, 'slide'+SlideDashboardController.currentSlide),
                extend: function() {}
            });
            if (SlideDashboardController.currentSlide != null) {
                $('#galleria').data('galleria').show(SlideDashboardController.findIndexById(this._data, 'slide'+SlideDashboardController.currentSlide));
            }
            
            /**
             * Attach keyboard events to Galleria
             * @return void
             */
            this.attachKeyboard({
                left: this.prev, // applies the native prev() function
                right: this.next,
                up: this.prev,
                down: this.next
            });
            
            /**
             * Add onclick to disable faculty control!
             * @return void
             */
            $("#disablefacultycontrol").click(function(){
                if(SlideDashboardController.galleriaKeysDisabled==false){
                    $('#galleria').data('galleria').detachKeyboard();
                    $("#disablefacultycontrol").html("Enable Faculty Control");
                    $("#disablefacultycontrol").removeClass( "btn-danger" );
                    $("#disablefacultycontrol").addClass( "btn-success" );
                    SlideDashboardController.galleriaKeysDisabled = true;
                }else{
                    $('#galleria').data('galleria').attachKeyboard({left: $('#galleria').data('galleria').prev, // applies the native prev() function
                                                                    right: $('#galleria').data('galleria').next,
                                                                    up: $('#galleria').data('galleria').prev,
                                                                    down: $('#galleria').data('galleria').next
                                                                    });
                    $("#disablefacultycontrol").html("Disable Faculty Control");
                    $("#disablefacultycontrol").removeClass( "btn-success" );
                    $("#disablefacultycontrol").addClass( "btn-danger" );
                    SlideDashboardController.galleriaKeysDisabled = false;
                }
            });
            
            /**
             * Override the load thumbnail action
             * @param Object
             * @return void
             */
            this.bind('thumbnail', function(e) {
                    $(e.thumbTarget).parent().click(function() {
                        $('#title_slide_image').remove();
                    });
                    var index = (e.index + 1);
                    var data = $('#galleria').data('galleria').getData(e.index);
                    
                    //allow us to override the click even for the thumbnails (allows to reload the current focused thumbnail)
                    $(e.thumbTarget).parent().unbind( "click" );
                    $(e.thumbTarget).parent().click(function() {
                        $('#title_slide_image').remove();
                        $('#galleria').data('galleria').show(e.index);
                    });
                    
                    //add the slide number
                    $(e.thumbTarget).parent().append('<div class="galleria-slide-number" style="width:30px;z-index:1000;">'+index+'</div>');
                    //add the slide delete, etc
                    if(SlideDashboardController.slideToTypeMapping[index]!='SLIDE'){
                            var intervalText = "<span style='color:#58acda;'>PRE</span>";
                            if(data.interval_id!=1){
                                    intervalText = "<span style='color:#94e24e;'>POST</span>";
                            }
                            var alias = data.hover_title.split(':');
                            if(SlideDashboardController.slideToTypeMapping[index]=='QUESTION'){
                                    alias = "Q: "+alias[0].substr(0,255);
                                    $(e.thumbTarget).parent().append('<div class="galleria-slide-type response" slidenumber="'+index+'" style="z-index:1000;margin-top:10px;margin-bottom:10px;height:150px;">'+intervalText+'<br />'+alias+'<br /><span style="font-size:12px;" id="respcount_'+index+'">('+SlideDashboardController.slideResponseCount[index]+')</span></div>'); //('+slide_response_count[index]+')
                            }else{
                                    alias = "R: "+alias[0].substr(0,255);
                                    //we add a class and an attribute to this so we can update the response count later
                                    $(e.thumbTarget).parent().append('<div class="galleria-slide-type response" slidenumber="'+index+'" style="z-index:1000;margin-top:10px;height:150px;">'+intervalText+'<br />'+alias+'<br /><span style="font-size:12px;" id="respcount_'+index+'">('+SlideDashboardController.slideResponseCount[index]+')</span></div>');
                            }
                    }else{
                            $(e.thumbTarget).parent().append('<div class="galleria-slide-type" style="z-index:1000;height:130px;">&nbsp;</div>');
                    }
                    $(e.thumbTarget).parent().append('<div class="galleria-slide-delete" style="width:25px;z-index:1000;"><img src="/img/delete.png" onclick="if(confirm(\'Are you sure you want to do this?\')){ SlideDashboardController.removeSlide('+index+', '+SlideDashboardController.slideDeckId+'); }else{ return false; }" /></div>');
                    //add the hover event
                    this.bindTooltip( e.thumbTarget, this.getData( e.index ).hover_title );
            });
            
            /**
             * Override load stage image event
             * @param Object
             */
            this.bind('image', function(e) {

                var nextIndex = $('#galleria').data('galleria').getNext(parseInt($('#galleria').data('galleria').getIndex()));
                var nextSlide = $('#galleria').data('galleria').getData(nextIndex);
                if (nextSlide.type == 'QUESTION' || nextSlide.type == 'RESPONSE') {
                    var intervalText = "<span style='color:#58acda;'>PRE</span>";
                    if(nextSlide.interval_id!=1){
                            intervalText = "<span style='color:#94e24e;'>POST</span>";
                    }
                    var alias = nextSlide.hover_title.split(':');
                    if(nextSlide.type=='QUESTION'){
                        alias = "Q: "+alias[0].substr(0,255);
                    }else{
                        alias = "R: "+alias[0].substr(0,255);
                    }
                    $("#nextSlideContainer_test").html('<div style="margin-left:auto;margin-right:auto;text-align:center;width:300px;height:225px;border:1px solid #000;background-color:#FFF;"><br />'+intervalText+'<br /><br />'+alias+'</div>');
                }else{
                    $("#nextSlideContainer_test").html('<img src="'+nextSlide.image+'" width="300px" height="300px" />');
                }
                $('#titleSlide').css('background-image','');
                var slide = this.getData(e.index);
                var nextSlide = this.getData(this.getNext());
                var slideId = this.getData().title;
                SlideDashboardController.currentSlide = slideId;
                SlideDashboardController.updateLiveSlideCounter();
                SlideDashboardController.updateNoteCounter(SlideDashboardController.currentSlide);
                SlideDashboardController.updateRatingCounter(SlideDashboardController.currentSlide);
                if(!SlideDashboardController.isActive) //take offline if needs be (stops content pushing)
                        return;
                $.ajax({
                    url: "/arraylearn/activity/update-current-slide",
                    type: "POST",
                    async: false,
                    data: {
                        activity_id: SlideDashboardController.activityId,
                        current_slide_id: slideId
                    }
                })
                .complete(function(response) {});
                var questionParams = {};
                var chartOutput = null;
                var type = 'SLIDE';
                if (slide.type == 'QUESTION' || slide.type == 'RESPONSE') {
                    //disable faculty controls
                    /*
                	$('#galleria').data('galleria').detachKeyboard();
                    $("#disablefacultycontrol").html("Enable Faculty Control");
                    $("#disablefacultycontrol").removeClass( "btn-danger" );
                    $("#disablefacultycontrol").addClass( "btn-success" );
                    SlideDashboardController.galleriaKeysDisabled = true;
                    */
                    $.ajax({
                        url: "/arraylearn/slide-view/get-current-slide/"+SlideDashboardController.activityId+"?activity_id="+SlideDashboardController.activityId,
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
                    //re-enable faculty control
                	/*
                    if(SlideDashboardController.galleriaKeysDisabled == true){
                        $('#galleria').data('galleria').attachKeyboard({left: $('#galleria').data('galleria').prev, // applies the native prev() function
                                                                        right: $('#galleria').data('galleria').next,
                                                                        up: $('#galleria').data('galleria').prev,
                                                                        down: $('#galleria').data('galleria').next
                                                                        });
                        $("#disablefacultycontrol").html("Disable Faculty Control");
                        $("#disablefacultycontrol").removeClass( "btn-success" );
                        $("#disablefacultycontrol").addClass( "btn-danger" );
                        SlideDashboardController.galleriaKeysDisabled = false;
                    }
                    */
                }
                var slideObject = {
                    slide_url: this.getData().image,
                    next_slide_url: nextSlide.image,
                    question_params: questionParams,
                    chart_output: chartOutput,
                    activity_id: this.activityId,
                    slide_id:slideId,
                };
                if (SlideDashboardController.socket != null) {
                    try{
                        SlideDashboardController.socket.emit('newSlide', slideObject);
                    } catch(e) {}
                } else {
                    SlideDashboardController.attemptConnection(); //attempt to connect with the socket server
                    try{
                        SlideDashboardController.socket.emit('newSlide', slideObject);
                    }catch(e){}  
                }
            });
            SlideDashboardController.addFastForward(); //render our own fast forward code
        });
        
        //now render the document.ready stuff
        $(document).ready(function(){
            SlideDashboardController.updateLiveSlideCounter();
            //update the socket connection count
            try{
                SlideDashboardController.attemptConnection();
                SlideDashboardController.socket.on('getClientCount', function (data) {
                    var newcount = parseInt(data);
                    $("#connectioncount").html(newcount); //set the html connection count
                });
                SlideDashboardController.chat.emit('getCount');    
            }catch(e){ $("#connectioncount").html("<strong>None</strong>"); }

               try{
                   SlideDashboardController.attemptConnection();
                   SlideDashboardController.chat.on('updateNoteCounter', function (data) {
                        SlideDashboardController.updateNoteCounter(SlideDashboardController.currentSlide);
                    });
                   SlideDashboardController.chat.on('updateRatingCounter', function (data) {
                        SlideDashboardController.updateRatingCounter(SlideDashboardController.currentSlide);
                    });                    
               }catch(e){}
            $("#header").hide();
            PresenterQuestionController.render(SlideDashboardController.activityId); //render the presenter questions
            setInterval(function(){
                    PresenterQuestionController.render(SlideDashboardController.activityId); //re-render the presenter questions every 15 seconds
            }, 15000); //every 15 seconds
            try{
                $( document ).tooltip( "option", "tooltipClass", "test_tooltip" ); 
            }catch(e){}
            $("#question_side_panel").height($("#galleria").height());
            //now create the button event for the poll button
            $("#firstSlide").click( function(){
                $('#galleria').data('galleria').show(0);
            });
            $("#question-choice-poll-submit-pre").click( function(){
                AddQuestionDashboardController.insert_question($("#question_selection_form input[type='radio']:checked").val(), this.activityId, 1);
            });
            $("#question-choice-poll-submit-post").click( function(){
                AddQuestionDashboardController.insert_question($("#question_selection_form input[type='radio']:checked").val(), this.activityId, 2);
            });
            $( "#slideDecks" ).change(function () {
                var value = $(this).val();
                if ( value ){
                    $('#galleria').data('galleria').load( SlideDashboardController.updateSlides(value) );
                    $(".galleria-thumbnails").css('left', '0px'); //move the view to the 1st slide in the deck
                    SlideDashboardController.updateLiveSlideCounter();
                    $("#liveslidecounter").html("<strong>Please select a slide</strong>");
                    SlideDashboardController.addFastForward(); //render our own fast forward code
                }
            });
            $( "#jumptoslide" ).change(function () {
                var value = $(this).val();
                if ( value!="ERROR" ){
                    try{
                        $('#galleria').data('galleria').show((parseInt(value)-1));
                    }catch(e){}
                    SlideDashboardController.updateLiveSlideCounter();
                }
            });
            try{
                SlideDashboardController.chat.on('updateResponseCount', function (data) {
                        $.ajax({
                           url: "/arraylearn/dashboard/get-response-count/"+SlideDashboardController.currentSlide,
                           type: "GET",
                           dataType: 'json',
                           async: false,
                           complete: function(response){
                               //update the slide response number
                               var slide_num = $('#galleria').data('galleria').getIndex();
                               SlideDashboardController.slideResponseCount[(slide_num+1)] = response.responseText;
                               if(SlideDashboardController.slideToTypeMapping[(slide_num+2)]=='RESPONSE'){
                                       SlideDashboardController.slideResponseCount[(slide_num+2)] = response.responseText;
                               }
                               SlideDashboardController.updateResponseCount();
                           }
                    });
                });
            }catch(e){}
        });
    };
    
    /**
     * Find slide index by slide id
     * @param data
     * @paramid
     * @return Mixed
     */
    this.findIndexById = function(data, id){
        for(var x in data) {
            if (data[x].id == id) {
                return x;
            }
        }
        return null;
    };
    
    /**
     * Add the fast foward buttons to override galleria's
     * @returns void
     */
    this.addFastForward = function() {
        if($('#galleria').data('galleria').getDataLength()<=2){
            try{
                $(".galleria-thumb-nav-left-ff").remove();
                $(".galleria-thumb-nav-left-f").remove();
                $(".galleria-thumb-nav-right-ff").remove();
                $(".galleria-thumb-nav-right-f").remove();
            }catch(e){}
            return false;
        }
        $(".galleria-container").height(662);
        $(".galleria-thumbnails-container").append("<div class='galleria-thumb-nav-left-ff'></div>");
        $(".galleria-thumbnails-container").append("<div class='galleria-thumb-nav-left-f'></div>");
        $(".galleria-thumbnails-container").append("<div class='galleria-thumb-nav-right-f'></div>");
        $(".galleria-thumbnails-container").append("<div class='galleria-thumb-nav-right-ff'></div>");
        //remove the default navigation so we can replace with our own
        $(".galleria-thumb-nav-left").css('display', 'none');
        $(".galleria-thumb-nav-right").css('display', 'none');
        //on click, do the fast forward!!!
        $(".galleria-thumb-nav-left-ff").click(function(){
            var offset = $(".galleria-thumbnails").offset();
            var new_offset = offset.left + 1716.5;
            var max = $(".galleria-thumbnails").width();
            if(new_offset>=0)
                    new_offset = 0;
            $(".galleria-thumbnails").css('left', new_offset+'px');
        });
        //on click, do the fast forward!!!
        $(".galleria-thumb-nav-left-f").click(function(){
            var offset = $(".galleria-thumbnails").offset();
            var new_offset = offset.left + 71.5;
            var max = $(".galleria-thumbnails").width();
            if(new_offset>=0)
                    new_offset = 0;
            $(".galleria-thumbnails").css('left', new_offset+'px');
        });
        //on click, do the fast forward!!!
        $(".galleria-thumb-nav-right-ff").click(function(){
            var offset = $(".galleria-thumbnails").offset();
            var new_offset = offset.left - 1716.5;
            var min = $(".galleria-thumbnails").width() - $(".galleria-thumbnails").width() - $(".galleria-thumbnails").width();
            if(new_offset<=min)
                    new_offset = (min+550);
            $(".galleria-thumbnails").css('left', new_offset+'px');
        });
        //on click, do the fast forward!!!
        $(".galleria-thumb-nav-right-f").click(function(){
            var offset = $(".galleria-thumbnails").offset();
            var new_offset = offset.left - 476.5;
            var min = $(".galleria-thumbnails").width() - $(".galleria-thumbnails").width() - $(".galleria-thumbnails").width();
            if(new_offset<=min)
                    new_offset = (min+550);
            $(".galleria-thumbnails").css('left', new_offset+'px');
        });
    };
    
    /**
     * Update slide info
     * @param Int slideDeckId
     * @returns Array
     */
    this.updateSlides = function(slideDeckId){
	SlideDashboardController.slideToTypeMapping = ['firstempty'];
	this.slideResponseCount = ['firstempty'];
	this.slideDeckId = slideDeckId;
	var slides = [];
        $.ajax({
            url: "/arraylearn/dashboard/get-slide-deck?slide_deck_id="+this.slideDeckId,
            type: "GET",
            async: false,
            complete: function(response){
                    var responseObj = $.parseJSON(response.responseText);
                    this.datasource = responseObj;
                    $.each(responseObj, function(){
                    	var slideObj = {
                            image: this.url,
                            id: 'slide'+this.id,
                            title: this.id,
                            type:this.type,
                            question_id:this.questionId,
                            page_id:this.pageId,
                            interval_id:this.intervalId,
                            layer: '<div style="margin:10px;margin-left:20px;" id="questiontext">'+this.questionHtml+'</div>',
                            hover_title: this.title,
                            activity_id: SlideDashboardController.activityId,
                            response_count: this.responseCount
                        };
                        slides.push(slideObj);
                        SlideDashboardController.slideToTypeMapping.push(this.type);
                        SlideDashboardController.slideResponseCount.push(this.responseCount);
                    });
                    data = slides;
            }
        });
        return slides;
    };

    /**
     * Update the live slide counter
     * @return void
     */
    this.updateLiveSlideCounter = function(){
        //update the slide counter
        try{
            var currentSlide = parseInt($('#galleria').data('galleria').getIndex()) + 1;
            if(isNaN(currentSlide)){
                $("#liveslidecounter").html("<strong>Please select a slide</strong>");
            }else{
                $("#liveslidecounter").html(currentSlide + " of " + $('#galleria').data('galleria').getDataLength());
            }
        }catch(e){}
        if(isNaN(currentSlide)){
            currentSlide = "None";
        }
        //now add the options for the jump slide
        $("#jumptoslide").html("");
        $("#jumptoslide").append($("<option/>", {
            value: "ERROR",
            text: "-- Please select a slide --"
        }));
        for(var i=1;i<=$('#galleria').data('galleria').getDataLength();i++){
            var text = i;
            if($('#galleria').data('galleria').getData((i-1)).type!="SLIDE"){
                var intervalText = "(PRE)";
                if($('#galleria').data('galleria').getData((i-1)).interval_id!=1){
                        intervalText = "(POST)";
                }
                var alias = $('#galleria').data('galleria').getData((i-1)).hover_title.split(':');
                if($('#galleria').data('galleria').getData((i-1)).type=='QUESTION'){
                    alias = "Q: "+alias[0].substr(0,255);
                }else{
                    alias = "R: "+alias[0].substr(0,255);
                }
                text += "  " + alias + " " + intervalText;
            }
            $("#jumptoslide").append($("<option/>", {
                value: i,
                text: text
            }));
            if(currentSlide!='None')
                $("#jumptoslide").val(currentSlide);
        }
    };
    
    /**
     * Remove a slide from Galleria
     * @param Int slide_number
     * @param Int slide_deck_id
     * @return void
     */
    this.removeSlide = function(slide_number, slide_deck_id) {
	$.ajax({
            url: "/arraylearn/slide-view/delete-slide?slide_number="+slide_number+"&slide_deck_id="+slide_deck_id,
            type: "GET",
            async: false,
                complete: function(response){
                    //do something here if we need to
                    $('#galleria').data('galleria').splice( (slide_number-1), 1);
                    SlideDashboardController.slideToTypeMapping.splice( (slide_number), 1);
                    SlideDashboardController.slideResponseCount.splice( (slide_number), 1);
                }
        });
    };

    /**
     * Attempt a connection to the socket server
     * @returns Boolean
     */
    this.attemptConnection = function() {
        $.ajax({
            url: "/arraylearn/dashboard/get-socket-settings",
            type: "GET",
            async: false,
            complete: function(response){
                var settingsArray = $.parseJSON(response.responseText);
                var settings = settingsArray[0];
                SlideDashboardController.socket_port = settings.port;
                SlideDashboardController.socket_host = settings.host;
            }
        });
        if(SlideDashboardController.socket==null){
            try{
                $.getScript('http://'+this.socket_host+':'+this.socket_port+'/socket.io/socket.io.js');
                SlideDashboardController.socket = io.connect('http://'+this.socket_host+':'+this.socket_port, {
                                         'max reconnection attempts': Infinity,
                                         'reconnection delay': 3000 }
                );
                jQuery('#warning').hide();
            } catch(e) { return false; }
        }
        
        if(SlideDashboardController.chat==null){
            try{
                SlideDashboardController.chat = io.connect('http://'+this.socket_host+':'+this.socket_port+'/chat', {
                                   'max reconnection attempts': Infinity,
                                   'reconnection delay': 3000 }
                );
            } catch(e) { return false; }
        }
        return true;
    };
    
    /**
     * Update the response count on the slide thumbnail view
     * @return void
     */
    this.updateResponseCount = function(){
	var count = 1;
	$(".galleria-thumbnails .galleria-image").each(function(val){
            if ($('#respcount_'+count)) {
                $('#respcount_'+count).html('('+SlideDashboardController.slideResponseCount[count]+')');
            }
            count++;
	});
        $('#galleria').data('galleria').unbind('loadfinish');
    };
    
    /**
     * Broadcast request for all connected client devices to refresh
     * @return void
     */
    this.doDeviceRefresh = function(){
	if (SlideDashboardController.socket != null) {
            try{
                SlideDashboardController.socket.emit('deviceRefresh');
            } catch(e) {}
        } else {
            SlideDashboardController.attemptConnection();
            try{
                SlideDashboardController.socket.emit('deviceRefresh');
            }catch(e){}    
        };
    };
    
    /**
     * Clear cookies if we need to
     * @returns void
     */
    this.doClearClientCookies = function() {
        if (SlideDashboardController.socket != null) {
            try{
                SlideDashboardController.socket.emit('clearcookies');
            } catch(e) {}
        } else {
            SlideDashboardController.attemptConnection();
            try{
                SlideDashboardController.socket.emit('clearcookies');
            }catch(e){}    
        };
    };

    /**
     * Update the presenter question number
     * @param Int activityId
     * @return void
     */
    this.updateQuestionCounter = function() {
        $.ajax({
            url: "/arraylearn/dashboard/get-presenter-question-count/"+SlideDashboardController.activityId,
            type: "GET",
            async: false,
                complete: function(response){
                    $("#presenterquestionscount").html(response.responseText);
                }
        });
    };
    
    /**
     * Update the note number
     * @param Int slideId
     * @return void
     */
    this.updateNoteCounter = function(slideId) {
        $.ajax({
            url: "/arraylearn/note/get-note-count/"+slideId+"?activity_id="+SlideDashboardController.activityId,
            type: "GET",
            async: false,
                complete: function(response){
                    $("#slidenotecount").html(response.responseText);
                }
        });
    };
    /**
     * Update the Rating and Average
     * @param Int slideId
     * @return void
     */
    this.updateRatingCounter = function(slideId) {
        $.ajax({
            url: "/arraylearn/dashboard/get-rating-count/"+slideId,
            type: "GET",
            dataType: 'json',
            async: false,
                success: function(response){
                    $("#slideratingcount").html(0);
                    $("#slideratingavg").html(0);
                    $.each( response, function( key, val ) {
                        var substr = val.split('#');              
                        $("#slideratingcount").html(substr[0]);
                        $("#slideratingavg").html(substr[1]);                        
                   });
               }
        });
    };    
};

(function($) {
    $.QueryString = (function(a) {
        if (a == "") return {};
        var b = {};
        for (var i = 0; i < a.length; ++i)
        {
            var p=a[i].split('=');
            if (p.length != 2) continue;
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
        }
        return b;
    })(window.location.search.substr(1).split('&'));
})(jQuery);

$("#titleSlide").click( function(){
    var index = parseInt($('#galleria').data('galleria').getIndex());
    if ( !$('#title_slide').val() )
        return false;
    $.ajax({
        url: "/arraylearn/activity/update-current-slide",
        type: "POST",
        async: false,
        data: {
            activity_id: SlideDashboardController.activityId,
            current_slide_id: $('#title_slide_id').val(),
        }
    });                
    $(this).css('background-image','linear-gradient(to bottom, green, green)');
    var title_slide_url = $('#title_slide').val();
    var title_slide_id = $('#title_slide_id').val();
    if ( index>=0) {
        $('#questiontext').text('');
        $(".galleria-stage").find('img').attr("src",title_slide_url);

        var slideObject = {
            slide_url: title_slide_url,
            next_slide_url: null,
            chart_output: null,
            question_params: {},
            activity_id: SlideDashboardController.activityId,
            slide_id:title_slide_id
        };
        if (SlideDashboardController.socket != null) {
            try{
                SlideDashboardController.socket.emit('newSlide', slideObject);
            } catch(e) {}
        } else {
            SlideDashboardController.attemptConnection(); //attempt to connect with the socket server
            try{
                SlideDashboardController.socket.emit('newSlide', slideObject);
            }catch(e){}  
        }
    } else {
        $('.galleria-stage .galleria-image:last-child').css({
        "width": "664px",
        "height": "400px"
        });
        $('.galleria-layer').last().after('<img id="title_slide_image" width="246" height="380" style="display: block; opacity: 1; min-width: 0px; min-height: 0px; max-width: none; max-height: none; width: 246px; height: 380px; position: absolute; top: 10px; left: 209px;" src="'+title_slide_url+'">').show();
    }
});
