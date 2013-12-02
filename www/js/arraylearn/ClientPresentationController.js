ClientPresentationController = function() {
	this.has_buttons = true;
	
	/**
	 * Holds the socket object if found
	 * @var Object
	 */
	this.socket = null;
	
	/**
	 * Holds the next image to display
	 * @var Object
	 */
	this.nextImage = null;
	
	/**
	 * Toggle full screen
	 * @var Boolean
	 */
	this.full_screen = false;
	
	/**
	 * Holds the slide count
	 * @var Int
	 */
	this.slide_count = 0;
	
	/**
	 * Holds the current slide deck id
	 * @var Int
	 */
	this.current_deck_id = 0;
	
	/**
	 * Holds the activity id
	 * @var Int
	 */
	this.activity_id = 0;
	
	/**
	 * Holds the slides datasource
	 * @var Array
	 */
	this.datasource = [];
	
	/**
	 * Holds the current slide
	 * @var Int
	 */
	this.current_slide = 0;
	
	/**
	 * Holds the slide type mapping
	 * @var Array
	 */
	this.slide_to_type_mapping = ['firstempty'];
	
	/**
	 * Load the galleria view showing the current slide deck + selected slide
	 * @return void
	 */
	this.load = function(deck_id, activity_id) {
		this.current_deck_id = deck_id;
		this.datasource = this.update_slides(this.current_deck_id);
		Galleria.loadTheme('/js/themes/classic/galleria.classic.min.js');
		var minus = 80;
		if(!this.has_buttons)
			minus = 30;
		Galleria.run('#galleria', {
									dataSource: this.datasource, 
									height:$(window).height()-minus,
									width:$(window).width(),
									imagePosition: 'top left'
								  });
		var position = $(window).width() - 255;
		$("#controls").css("left", position);
		minus = 155;
		if(!this.has_buttons)
			minus = 105;
		$("#controls").css("top", $(window).height()-minus);
		$("#slide_counter").html('Slide 1 / '+this.slide_count);
		//load the opening slide (keeps in sync with admin)
		Galleria.ready(function(options) {
			Galleria.configure({
				maxScaleRatio:1,
				imageMargin:10,
				responsive:true,
			    _toggleInfo: false,
			    showInfo: false,
			    show: ClientPresentationController.get_slide_index(ClientPresentationController.current_slide),
			    extend: function() {
			    	ClientPresentationController.attach_slide_numbers();
			    	ClientPresentationController.attach_slide_type();
			    }
			});
			this.bind('thumbnail', function(e) {
				this.bindTooltip( e.thumbTarget, this.getData( e.index ).hover_title );
			});
			this.bind('image', function(e) {
		    	var slide = this.getData(e.index);
		    	if(slide.type=='QUESTION'){
		    		
		    	}else if(slide.type=='RESPONSE'){
		    		
		    	}
		    });
		});
	};
	
	/**
	 * Toggle full screen mode on/off
	 * @return void
	 */
	this.toggle_fullscreen = function() {
		if(this.full_screen)
			this.full_screen = false;
		else
			this.full_screen = true;
		if(this.full_screen){
			$("#test").html('Exit full screen');
			$("#controls").hide();
			//$("#top-controls").hide();
			$(".galleria-thumbnails-container").hide();
			var h = $(window).height() - 110;
			var w = $(window).width() - 20;
			$(".galleria-container").css("width", $(window).width());
			$(".galleria-stage").css("height", h);
			$(".galleria-stage").css("width", w);
	        $("#gallerycontainer").css("height", h);
			$("#gallerycontainer").css("width", w);
			$("#gallery").css("height", h);
			$("#gallery").css("width", w);
			$(".galleria-layer").css("height", h);
			$(".galleria-layer").css("width", w);
			$(".galleria-images").css("height", h);
			$(".galleria-images").css("width", w);
			$(".galleria-image").css("height", h);
			$(".galleria-image").css("width", w);
			$(".galleria-stage img").each(function(){
				$(this).css("height", h);
				$(this).css("width", w);
			});
		}else{
			$("#test").html('Full screen mode');
			window.location.reload();
		}
	};
	
	/**
	 * Update the slides
	 * @return Object
	 */
	this.update_slides = function(slide_deck_id) {
		var slides = [];
	    $.ajax({
	        url: "/arraylearn/dashboard/get-client-slide-deck?slide_deck_id="+slide_deck_id,
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
	        			activity_id: this.activity_id,
	        			response_count: this.responseCount
	        		};
	        		slides.push(slideObj);
	        		ClientPresentationController.slide_to_type_mapping.push(this.type);
	        	});
	        }
	    });
	    this.slide_count = slides.length;
	    return slides;
	};
	
	/**
	 * Get the slide index
	 * @param Int
	 * @return Int
	 */
	this.get_slide_index = function(slide_id) {
		var count = 0;
		var current_slide_index = 0;
    	jQuery.each(this.datasource, function() {
    		if(this.title==slide_id){
    			current_slide_index = count;
    			return;
    		}
    		count++;
    	});
    	return current_slide_index;
	};
	
	/**
	 * Use an interval to check the activity is still running every 15 seconds
	 * @return void
	 */
	this.check_activity_is_running = function() {
		//set the method of seeing if an activity is turned off during a meeting
		setInterval(function(){
			$.ajax({
				url: "/arraylearn/client/is-activity-still-running",
			    type: "POST",
			    async: false,
			    complete: function(response){
			    	if(response.responseText=='0'){
			    		window.location.href='/arraylearn/slide-view/no-activity-running';
			    		return;
			    	}
			    }
			});
		}, 15000); //every 15 seconds
	};
	
	/**
	 * Pull the slide (either using refresh method or socket) - needs revamping
	 * @return void
	 */
	this.slide_pull = function(){
		if ((this.socket == null) || (!this.socket.socket.connected)) {
			if ((typeof io != "undefined")) {
				//IF SOCKET FOUND
				if((this.socket == null) || (!this.socket.socket.connecting)) {
					this.socket = io.connect('http://'+window.location.host+':8080');
					this.socket.on('updateSlide', function (data) {
						ClientPresentationController.show_slide(data);
					});
					this.socket.on('disconnect', function(){
						setTimeout(function(){ ClientPresentationController.slide_pull(); }, 3000);
					});
				}
			}
			$.ajax({
				type: "GET",
				url: '/arraylearn/client/presentation',
				dataType: "json",
			})
			.done(function(response) {
				this.show_slide(response);
				setTimeout(function(){ ClientPresentationController.slide_pull(); }, 3000);
			})
			.fail(function(response) {});
		}
	  };
	  
	  /**
	   * Get the image tag
	   * @return Object
	   */
	  this.get_image = function(src, maxWidth) {
	        var image = $('<img/>', {'src': src} );
	        image.attr('id', 'theSlide');
	        image.attr('alt', 'slide');
	        image.load();
	        return image;
	    };
	    
	    /**
	     * Preload the next image
	     * @return Object
	     */
	    this.preload = function(image, maxWidth) {
	        return getImage(image, maxWidth);
	    };
	    
	    /**
	     * Show the slide on the screen
	     * @param String
	     * @return void
	     */
	    this.show_slide = function(json) {
	    	ClientPresentationController.current_slide = json.slide_id;
	    	$('#galleria').data('galleria').show(ClientPresentationController.get_slide_index(ClientPresentationController.current_slide));
	    	return;
	    };
	    
	    /**
	     * Attach the slide numbers
	     * @return void
	     */
	    this.attach_slide_numbers = function(){
	        var count = 1;
	        $(".galleria-thumbnails .galleria-image").each(function(){
	            $(this).append('<div class="galleria-slide-number" style="width:30px;z-index:1000;">'+count+'</div>');
	            count++;
	        });
	        $('#galleria').data('galleria').unbind('loadfinish');
	    };
	    
	    /**
	     * Attach the slide type
	     * @return void
	     */
	    this.attach_slide_type = function(){
	    	var count = 1;
	    	$(".galleria-thumbnails .galleria-image").each(function(){
	    		if(ClientPresentationController.slide_to_type_mapping[count]!='SLIDE'){
	    			if(ClientPresentationController.slide_to_type_mapping[count]=='QUESTION'){
	    				$(this).append('<div class="galleria-slide-type response" slidenumber="'+count+'" style="z-index:1000;margin-top:30px;">QUESTION</div>');
	    			}else{
	    				//we add a class and an attribute to this so we can update the response count later
	    				$(this).append('<div class="galleria-slide-type response" slidenumber="'+count+'" style="z-index:1000;margin-top:30px;">RESPONSE</div>');
	    			}
	    		}else{
	    			$(this).append('<div class="galleria-slide-type" style="z-index:1000;">&nbsp;</div>');
	    		}
	            count++;
	    	});
	        $('#galleria').data('galleria').unbind('loadfinish');
	    };
};
ClientPresentationController = new ClientPresentationController();