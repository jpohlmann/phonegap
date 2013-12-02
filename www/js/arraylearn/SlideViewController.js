SlideViewController = function() {
    /**
     * Holds the settings for the slide presentation
     * 
     * @var object
     */
    this.settings = null;
    
    /**
     * Holds the slide deck for the presentation
     * 
     * @var array
     */
    this.slide_deck = null;
    
    /**
     * Holds the ratings for the presentation
     * 
     * @var array
     */
    this.ratings = null;
    
    /**
     * Id of user
     * 
     * @var integer
     */
    this.user_id = null;
    
    /**
     * Email of user
     * 
     * @var integer
     */
    this.user_email = null;
    
    /**
     * Id of activity
     * 
     * @var integer
     */
    this.activity_id = null;
    
    /**
     * Id of current slide
     * 
     * @var integer
     */
    this.current_slide_id = null;
    
    /**
     * Url of current slide
     * 
     * @var string
     */
    this.current_slide_url = null;
    
    /**
     * Type of current slide
     * 
     * @var string
     */
    this.current_slide_type = null;
    
    /**
     * Question Parameters, if current slide is a question
     * 
     * @var object
     */
    this.question_params = null;
    
    /**
     * Socket connection
     * 
     * @var object
     */
    this.socket = null;
    
    /**
     * Port of socket connection
     * 
     * @var integer
     */
    this.socket_port = null;
    
    /**
     * Host of socket connection
     * 
     * @var string
     */
    this.socket_host = null;
    
    /**
     * Allow submitting a faculty question
     * 
     * @var boolean
     */
    this.allow_faculty_question = true;
    
    /**
     * Allow submitting slide notes
     * 
     * @var boolean
     */
    this.allow_slide_notes = true;

    /**
     * Buttons
     * 
     * @var array
     */
    this.buttons = null;
    
    /**
     * Was the page reloaded
     * 
     * @var boolean
     */
    this.page_reload = true;
    
    /**
     * Looping preload function
     * 
     * @var function
     */
    this.preload_deck_loop = null;
    
    /**
     * Retrieve the data for the slide, activity, and ratings.
     * 
     * @return void
     */
    this.render = function(){
        $.ajax({
            type: "GET",
            url: 'http://'+SlideViewController.socket_host+'/arraylearn/slide-view/view',
            dataType: "json",
			headers: {
				"Array-Registration-Id": this.user_id,
				"Array-Activity-Id": this.activity_id
			},
            async: false
        })
        .complete(function(resp) {
            var response = $.parseJSON(resp.responseText);
            SlideViewController.buttons = response.combined_buttons.values;
            SlideViewController.activity_id = response.activity_id;
            SlideViewController.current_slide_id = response.slide_id;
            SlideViewController.settings = response.settings;
            SlideViewController.allow_faculty_question = response.allow_faculty_question;
            SlideViewController.allow_slide_notes = response.allow_slide_notes;
            SlideViewController.current_slide_url = response.slide_url;
            SlideViewController.current_slide_type = response.type;
            SlideViewController.question_params = response.question_params;
            SlideViewController.slide_deck = SlideViewController.translateDeck(response.slides.values);
            SlideViewController.ratings = SlideViewController.translateRatings(response.rating.values);
            SlideViewController.user_id = response.registration_id;
            SlideViewController.user_email = response.registered_email;
        });
        this.preload_deck_loop = setInterval(this.preloadDeckUrl, 6000);
    };
    
    /**
     * Translates the ratings collection into an indexed array
     * 
     * @param array ratings Untranslated ratings from the json return
     * 
     * @return array
     */
    this.translateRatings = function(ratings){
        var ratingsArray = [];
        $.each(ratings, function(){
            ratingsArray[this.slideNumber] = this.value;
        });
        return ratingsArray;
    };
    
    /**
     * Translates the deck collection into an indexed array
     * 
     * @param array deck Untranslated deck from the json return
     * 
     * @return array
     */
    this.translateDeck = function(deck){
        var deckArray = [];
        $.each(deck, function(){
            deckArray[this.id] = {"image": null, "url": this.url};
        });
        return deckArray;
    };
    
    /**
     * Display the rating data for the slide.
     * 
     * @return void
     */
    this.displayRating = function()
    {
        var rating = {};
        var curr_rate = this.ratings[this.current_slide_id];
        for (var x=1; x<6; x++) {
            if ((curr_rate != undefined) && (curr_rate.value > x)) {
                rating[x] = true;
            } else {
                rating[x] = false;
            }
        }
        var template_source = $("#ratings-template").html();
        var compiled = Handlebars.compile(template_source);
        $('#ratings_div').html(compiled({"rating": rating}));
        this.addRatingListeners();
    };
    
    /**
     * Display the sidebar and buttons.
     * 
     * @return void
     */
    this.displaySidebar = function()
    {
        var config = {};
        config.buttons = this.buttons;
        config.logo = 'img/logo.png';
        config.logotext = 'Array Learning';
        config.allow_faculty_question = this.allow_faculty_question;
        config.allow_slide_notes = this.allow_slide_notes;
        var template_source = $("#sidebar-template").html();
        var compiled = Handlebars.compile(template_source);
        $('#hideFS').html(compiled(config));
    };
    
    /**
     * Display faculty question box.
     * 
     * @return void
     */
    this.displayFacultyQuestion = function()
    {
        var template_source = $("#faculty-question-template").html();
        var compiled = Handlebars.compile(template_source);
        $('#notequestiondiv').html(compiled({}));
    };
    
    /**
     * Display slide note box.
     * 
     * @return void
     */
    this.displaySlideNote = function()
    {
        var config = {};
        config.email = false;
        config.height = '100px';
        if (this.user_email.indexOf('@') >= 0) {
            config.email = true;
            config.height = '160px';
        }
        config.activity_id = this.activity_id;
        var template_source = $("#slide-note-template").html();
        var compiled = Handlebars.compile(template_source);
        $('#notequestiondiv').append(compiled(config));
    };
    
    /**
     * Preloads the next image in the deck.
     * 
     * @return void
     */
    this.preloadDeckUrl = function(){
        for (var id in SlideViewController.slide_deck) {
            if ((SlideViewController.slide_deck[id].image == null) && (parseInt(id) > parseInt(SlideViewController.current_slide_id))) {
                SlideViewController.slide_deck[id].image = SlideViewController.preload(SlideViewController.slide_deck[id].url);
                break;
            }
        }
    };
    
    /**
     * Get the rating for the current slide from the rating array.
     * 
     * @param slideId Id of slide
     * 
     * @return int
     */
    this.getRating = function(slideId){
        if (this.ratings[slideId] != undefined) {
            return this.ratings[slideId];
        }
        return null;
    };
    
    /**
     * Pulls the latest slide, tries to connect to the socket server.  If it 
     * can't, it calls itself in 3 seconds
     * 
     * @return void
     */
    this.slidePull = function(){
        if ((this.socket == null) || (!this.socket.socket.connected)) {
            if ((typeof io != "undefined")) {
                //IF SOCKET NOT FOUND
                if((this.socket == null) || (!this.socket.socket.connecting)) {
                    this.socket = io.connect('http://'+this.socket_host+':'+this.socket_port);
                    this.socket.on('clearClientCookies', function () {
                        var rand = parseInt(Math.floor((Math.random()*9)+1)) + 1000; //randomize up to 10 seconds
                        setTimeout(function(){
                            $.cookie('activity_id', null, { path: '/' });
                            $.cookie('registration_id', null, { path: '/' });
                            $.cookie('attendee_id', null, { path: '/' });
                            window.location.reload();
                        }, rand);
                    });                    
                    this.socket.on('updateSlide', function (data) {
                        clearTimeout(SlideViewController.preload_deck_loop);
                        SlideViewController.showSlide(data);
                        SlideViewController.preload_deck_loop = setInterval(SlideViewController.preloadDeckUrl, 6000);
                    });
                    this.socket.on('disconnect', function(){
                        setTimeout(function(){SlideViewController.slidePull();}, 3000);
                    });
                    this.socket.on('activityEnd', function(){
                        window.location.href='/arraylearn/slide-view/no-activity-running';
                    });
                    this.socket.on('activityHasStopped', function(){
                        window.location.href='/arraylearn/slide-view/no-activity-running';
                });
                    this.socket.on('refreshClientDevices', function(){
                        var rand = parseInt(Math.floor((Math.random()*9)+1)) + 1000; //randomize up to 10 seconds
                        setTimeout(function(){
                            location.reload();
                        }, rand);
                    });
                    this.socket.on('updateButtons', function(){
                        var url = 'http://'+SlideViewController.socket_host+"/arraylearn/client/getbuttons";
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
                url: 'http://'+SlideViewController.socket_host+'/arraylearn/slide-view/get-current-slide',
                dataType: "json"
            })
            .done(function(response) {
                if (response.activity_id == 0) {
                    window.location.href='/arraylearn/slide-view/no-activity-running';
                }
                SlideViewController.showSlide(response);
                setTimeout(function(){SlideViewController.slidePull();}, 3000); //BUG HERE WITH RANKING QUESTIONS
                var rating = SlideViewController.getRating(response.slide_id);
                $('.ratings_stars').removeClass('ratings_vote');
                $('.voted').html('');
                for (var i= 1; i <= rating; i++) {
                    $('.star_'+i).addClass('ratings_vote');
                }                  
            })
            .fail(function(response) {});
        }
    };
    
    /**
     * Add the image to the slide div, return it
     * 
     * @return object
     */
    this.getImage = function(src) {
        var image = $('<img/>', {'src': 'http://'+this.socket_host+src} );
        image.attr('id', 'theSlide');
        image.attr('alt', 'slide');
        image.load();
        return image;
    };
    
    /**
     * Preload the image
     * 
     * @return object
     */
    this.preload = function(image) {
        return this.getImage(image);
    };
    
    /**
     * Set the activity specific settings for the charts.
     * 
     * @return ChartingController
     */
    this.setChartingSettings = function(controller) {
        if (this.settings.graphDisable3d != null) {
            controller.disable_3d = (this.settings.graphDisable3d == "1");
        }
        if (this.settings.graphHanddrawn != null) {
            controller.handdrawn = (this.settings.graphHanddrawn == "1");
        }
        if (this.settings.graphDisableGridlines != null) {
            controller.disable_gridlines = (this.settings.graphDisableGridlines == "1");
        }
        if (this.settings.graphDynamicScale != null) {
            controller.dynamic_scale = (this.settings.graphDynamicScale == "1");
        }
        if (this.settings.graphInlineAnswers != null) {
            controller.inline_answers = (this.settings.graphInlineAnswers == "1");
        }
        if (this.settings.graphCustomPointlabelSize != null) {
            controller.custom_pointlabel_size = this.settings.graphCustomPointlabelSize;
        }
        if (this.settings.graphCustomLabelsize != null) {
            controller.label_size = this.settings.graphCustomLabelsize;
        }
        if (this.settings.graphLabelbold != null) {
            controller.label_bold = (this.settings.graphLabelbold == "1");
        }
        if (this.settings.graphCustomLabelfont != null) {
            controller.label_font = this.settings.graphCustomLabelfont;
        }
        return controller;
    };
    
    /**
     * Show the next slide based on json input
     * 
     * @return void
     */
    this.showSlide = function(json) {
        SurveyDesignViewController.priority_ranking_mapping = [];
        if ( json.question_params )
            json.question_params.activity_id = json.activity_id;
        if ((this.current_slide_id == json.slide_id) && (!this.page_reload)) {
            return true;
        }
        this.current_slide_id = json.slide_id;
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
                view = this.setChartingSettings(view);
                view.set_data(json);
                view.render(); //render the chart  
                $(window).resize(function() {
                    view = new ChartingController();
                    view = this.setChartingSettings(view);
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
                            if ( this.ratings[json.slide_id]!= undefined)
                                rating = this.ratings[json.slide_id];
                            $('.ratings_stars').removeClass('ratings_vote');
                            $('.voted').html('');
                            for (var i= 1; i <= rating; i++) {
                                $('.star_'+i).addClass('ratings_vote');
                            }                      
                            var newImage = null;
                            if ((this.slide_deck[json.slide_id] == undefined) || (this.slide_deck[json.slide_id].image == null)) {
                                var newSlideObj = {
                                    'url' : json.slide_url,
                                    'image' : this.getImage(json.slide_url)
                                };
                                this.slide_deck[json.slide_id] = newSlideObj;
                            }
                            newImage = this.slide_deck[json.slide_id].image;
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
        this.page_reload = false;
    };
    
    /**
     * Save the response data from a question
     * 
     * @return boolean false if not validated
     */
    this.saveResponseData = function(){
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
            url: 'http://'+SlideViewController.socket_host+"/arraylearn/slide-view/view",
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
//                $("#user_feedback").html('<div id="response_submitted" class="alert alert-block alert-success fade in"><button type="button" class="close" data-dismiss="alert">&times;</button><h4 class="alert-heading">Your answer has been submitted.</h4><p>To modify your answer, select new answer and tap submit.</p><p>Last response submitted @ '+datetime+'</p></div><div>');
                $("#user_feedback").html('<div id="response_submitted" class="alert alert-block alert-success fade in"><button type="button" class="close" data-dismiss="alert">&times;</button><h4 class="alert-heading">Your answer has been submitted.</h4><p>To modify your answer, select new answer and tap submit.</p></div><div>');
                $("#user_feedback").show();
                SlideViewController.socket.emit('updateResponses');
            }
        });
    };
    
    /**
     * Add the rating listeners for the stars.
     * 
     * @return void
     */
    this.addRatingListeners = function(){
        $('.ratings_stars').hover(
            // Handles the mouseover
            function() {
                $(this).prevAll().andSelf().addClass('ratings_over');
            },
            // Handles the mouseout
            function() {
                $(this).prevAll().andSelf().removeClass('ratings_over');
            }
        );
        //send ajax request to rate.php
        $('.ratings_stars').bind('click', function() {
            var me = $(this);
            var id=$(this).attr("id");
            var poststr="id="+id+"&current_slide="+SlideViewController.current_slide_id;
            if ( !id || !SlideViewController.current_slide_id)
                return;
            $.ajax({
                url:'http://'+SlideViewController.socket_host+"/arraylearn/dashboard/rating",
				headers: {
					"Array-Registration-Id": SlideViewController.user_id,
					"Array-Activity-Id": SlideViewController.activity_id
				},
                cache:0,
                data:poststr,
                success:function(result){
                    SlideViewController.socket.emit('updateRatingCount');
                    $(".voted").html("Thanks for voting.");
                    SlideViewController.ratings = result;
                    $('.ratings_stars').removeClass('ratings_over');
                    $('.ratings_stars').removeClass('ratings_vote');
                    me.prevAll().andSelf().addClass('ratings_vote');                
                }
            }); 
        });
    };
};