$(document).ready(function() {
$(function() {
        $('.iframe-button').click(function() {
                   		    
        	var windowSize = $(window).width();
			if (windowSize <= 700) {
				//alert('you are on a small window');
		        $('#slideContainer .span2').css('position', 'relative');
	            $('#iframeContainer').show().css('width', '100%').css('height','300px');
	            $('#hideFS').css('margin-left', '0');
	            $('#slideContainer #main_content').css('padding', '0px 0px 0 0px');
	            $('#fullScreen').hide();
	            $('#hamburgerWrapper').show(); // show fullscreen
	            $('#fullScreenFrame').hide();
	            $('#hamburgerWrapperFrame').fadeIn(); // show fullscreen
	            $('#iframeContainer').show();
	            $('#slideAreaWrapper').hide();
	            
	            if ($(this).attr('href').match(/\.(jpg|png|gif)/i)) {
	        	//alert('contains jpg, png or gif');
	        	$('#fullScreenSliderWrapper').show();
	            $('#resourceSlider').show();
	            
	            } else if ($(this.href.indexOf('activity_files') != -1) && $(this).attr('href').match(/\.(html)/i)) {
			        //alert("Contains activity_files and html extension");
			        $('#fullScreenSliderWrapper').hide(); // hide on small screens
			        $('#resourceSlider').hide();
			        
			    } else if ($(this.href.indexOf('http://www') != -1)) {
				    //alert("Web link - don't show");
				    $('#fullScreenSliderWrapper').hide(); // hide on small 
			        $('#resourceSlider').hide();
			    } 
			    
			    if ($(this).attr('href').match(/\.(pdf)/i)) {
				    //alert("This must be pdf");
				    $('#fullScreenSliderWrapper').show();
			        $('#resourceSlider').show();
			    }
		        
	        } else {
	        	
	            $('#animate').animate({'left': '-27%'});
	            $('#hideFS').animate({'left': '-27%'});
	            $('#iframeContainer').show().css('width', '100%');
	            $('#fullScreen').hide();
	            $('#hamburgerWrapper').show(); // show fullscreen
	            $('#fullScreenFrame').hide();
	            $('#hamburgerWrapperFrame').fadeIn(); // show fullscreen
	            $('#iframeContainer').show();
	            $('#slideAreaWrapper').hide();
	            
	            if ($(this).attr('href').match(/\.(jpg|png|gif)/i)) {
	        	//alert('contains jpg, png or gif');
	        	$('#fullScreenSliderWrapper').show();
	            $('#resourceSlider').show();
	            
	            } else if ($(this.href.indexOf('activity_files') != -1) && $(this).attr('href').match(/\.(html)/i)) {
			        //alert("Contains activity_files and html extension");
			        $('#fullScreenSliderWrapper').show();
			        $('#resourceSlider').hide();
			        
			    } else if ($(this.href.indexOf('http://www') != -1)) {
				    //alert("Web link - don't show");
				    $('#fullScreenSliderWrapper').show(); // show on larger screens
			        $('#resourceSlider').hide();
			    } 
			    
			    if ($(this).attr('href').match(/\.(pdf)/i)) {
				    //alert("This must be pdf");
				    $('#fullScreenSliderWrapper').show();
			        $('#resourceSlider').show();
			    }
            }
        });

        $('#showSlideArea').click(function() {
            $('#slideAreaWrapper').show();
            $('#iframeContainer').hide();
        });

        var howManyBtns = $('#button-container a').length;
        if (howManyBtns <= 3) {
            $('#button-container').css('min-height', '180px');
        } else {
            $('#button-container').css('min-height', '350px');
        }
    });


    $("#questionButton").click(function() {
        $("#survey_form").submit();
    });

    $("#presentationButton").click(function() {
        $('#iframeContainer').hide();
        $('#slideAreaWrapper').show();
    });
    $("#slideNoteButton, #slideNoteIcon").click(function() {
        $('#text').val('');
        $('#fullScreenWrapper').hide();
        $("#noteSlideImg").attr("src", $("#theSlide").attr("src"));
        $('#note-slide-id').val(SlideViewController.current_slide_id);
        $('.notes-container').show();
        $('#slideContainer').hide();
        $(window).scrollTop(0);
        $('#hideFS').css('margin-left', '0px');
    });

    $('#fullScreenFrame').click(function() {
        $('#animate').animate({'left': '-27%'});
        $('#hideFS').animate({'left': '-27%'});
        $('#iframeContainer').show().css('width', '100%');
        $(this).hide();
        $('#hamburgerWrapper').show();
        $('#fullScreen').hide();
        $('#hamburgerWrapperFrame').fadeIn(); // show fullscreen
    });

    $('#hamburgerWrapperFrame').click(function() { // hide fullscreen & show buttons
        $('#animate').animate({'left': '0px'});
        $('#iframeContainer').show().css('width', '85%');
        $('#hideFS').show().animate({'left': '0px'});
        $(this).hide();
        $('#hamburgerWrapper').hide();
        $('#fullScreen').show();
        $('#fullScreenFrame').fadeIn().css('margin-left', '10px');
    });

    $('#fullScreen').click(function() {
        $('#animate').animate({'left': '-27%'});
        $('#hideFS').animate({'left': '-27%'});
        $('#slideArea').find('.span12').addClass('smallleftmargin');
        $('#slideAreaWrapper').removeClass('span10').addClass('span12');
        $(this).hide();
        $('#hamburgerWrapper').fadeIn(); // show fullscreen
    });

    $('#hamburgerWrapper').click(function() { // hide fullscreen & show buttons
        $('#animate').animate({'left': '0px'});
        $('#hideFS').show().animate({'left': '0px'});
        $(this).hide();
        /* $('#theSlide').css('margin', '5%'); */
        $('#slideAreaWrapper').removeClass('span12').addClass('span10');
        $('#fullScreen').fadeIn();
    });


    $('#cancelNote').click(function() {
        $('.notes-container').hide();
        $('#slideContainer').show();
        $('.control-group').removeClass('error');
        $('span.help-block').hide();
        if ($('#survey_form').length == 1) { // hide full screen wrapper if polling 
			$('#fullScreenWrapper').hide();
		} else {
			$('#fullScreenWrapper').show();
		}
        $('#hideFS').css('margin-left', '0px');
    });

    $('#hide-slide').click(function() {
        $('#hide-slide-wrapper').hide();
        $('#show-slide-wrapper').show();
        $('.span5').removeClass('span5').addClass('span11');
        $('#show-slide-container').css('display', 'block');
        $('#changeMargin').addClass('marginleft3percent');
    });
    $('#show-slide').click(function() {
        $('#hide-slide-wrapper').show();
        $('#show-slide-container').hide();
        $('.span11').removeClass('span11').addClass('span5');
        $('#hide-slide-container').css('display', 'block');
        $('#changeMargin').removeClass('marginleft3percent');
    });

    $('#cancelQuestion').click(function() {
        $('.questions-container').hide();
        $('#slideContainer').show();
        $('.control-group').removeClass('error');
        $('span.help-block').hide();
    });

    $('#hide-slide-q').click(function() {
        $('#hide-slide-wrapper-q').hide();
        $('.span5').removeClass('span5').addClass('span11');
        $('#show-slide-container-q').css('display', 'block');
        $('#changeMarginQ').addClass('marginleft3percent');
    });
    $('#show-slide-q').click(function() {
        $('#hide-slide-wrapper-q').show();
        $('.span11').removeClass('span11').addClass('span5');
        $('#show-slide-container-q').css('display', 'none');
        $('#changeMarginQ').removeClass('marginleft3percent');
    });
    $('#stylus-link').click(function() {
        window.location = 'note.html?slide_id=' + SlideViewController.current_slide_id;
    });
    $("#slideNoteButtonStylus").click(function() {
        window.location = 'note.html?slide_id=' + SlideViewController.current_slide_id;
    });
});
