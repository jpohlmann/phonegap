AgendaItemSettingsController = function() {
	/**
	 * Holds the current button color
	 * @var String
	 */
	this.current_color = "rgb(25, 7, 7)";
	
	/**
	 * Holds the current fore color
	 * @var String
	 */
	this.current_fore_color = "#FFFFFF";
	
	/**
	 * The current chosen icon
	 * @var String
	 */
	this.current_icon = "array-clipboard-gray";
	
	/**
	 * Render the sortable stuff
	 * @return void
	 */
	this.render = function() {
		var fixHelper = function(e, ui) {
        	ui.children().each(function() {
        		$(this).width($(this).width());
        	});
        	return ui;
        };
        $("#button_table tbody").sortable({
        	helper: fixHelper,
        	stop: function( event, ui ) { 
        		var id_order = [];
        		$("#button_table tr").each(function() {
            		id_order.push($(this).attr('id'));
            	});
        		//sort the order in php
        		var ajaxData = { data: JSON.stringify(id_order) };
        		var url = "/arraylearn/agenda-item-settings/sortbuttons";
        		$.ajax({
        			type: "POST",
        			url: url,
        			data: ajaxData
        		})
        		.done(function(response) {
        			//console.log(response);
        		})
        		.fail(function(html) { alert("Error updating order"); });
        	}
        }).disableSelection();
	};
	
	/**
	 * Add the modal window actions
	 * @param Int
	 * @param Int
	 * @return void
	 */
	this.add_button_modal = function(agenda_item_id, uid) {
		$('#addButtonModal').modal('show');
		$("#addButtonModal").height(560);
		$(".modal-body").css('overflowY', 'hidden');
		$(".modal-body").css('overflowX', 'hidden');
/*
		$( "#dialog" ).dialog({
			  title: "Add/Edit button",
		      height: 460,
		      width: 800,
		      modal: true
		    });
*/
		//grab and display the form for adding a new button
		var url = "/arraylearn/agenda-item-settings/addbutton/"+agenda_item_id+"?uid="+uid;
		$.ajax({
			type: "GET",
			url: url
		})
		.done(function(response) {
			$('#addButtonModal .modal-body').html(response);
			//controls the form submission (including file upload)
			(function() {
				var bar = $('.bar');
				var percent = $('.percent');
				var status = $('#status');
				$('#button_submission').ajaxForm({
				    beforeSend: function() {
				        status.empty();
				        var percentVal = '(0%)';
				        bar.width(percentVal);
				        percent.html(percentVal);
				    },
				    beforeSubmit: function() {
				    	if(!AgendaItemSettingsController.validate())
				    		return false;
				    },
				    uploadProgress: function(event, position, total, percentComplete) {
				        var percentVal = '('+percentComplete + '%)';
				        bar.width(percentVal);
				        percent.html(percentVal);
				    },
				    success: function(t) {
				        var percentVal = '(100%)';
				        bar.width(percentVal);
				        percent.html(percentVal);
				    },
					complete: function(xhr) {
						window.location.href = '/arraylearn/agenda-item-settings/'+agenda_item_id;
					},
				    error: function(r){
				    	console.log(r.responseText);
				    },
				}); 
			})();
		})
		.fail(function(html) { alert("error displaying form"); });
	};
	
	/**
	 * The function for when a color is selected
	 * @var Object
	 * @return void
	 */
	this.select_color = function(element) {
		this.current_color = element.style.backgroundColor;
		$("#background_color").val(this.current_color);
		$("#preview_button").css({ "background-color":this.current_color });
		$( ".button_color" ).each(function( ) {
			$(this).css({"border-color": "#C1E0FF", 
			             "border-width":"0", 
			             "border-style":"solid"});
		});
		$(element).css({"border-color": "#C1E0FF", 
			            "border-width":"2px", 
			            "border-style":"solid"});
	};
	
	/**
	 * Select the foreground color
	 * @param Object
	 * @return void
	 */
	this.select_foreground_color = function(element) {
		this.current_fore_color = element.style.backgroundColor;
		$("#foreground_color").val(this.current_fore_color);
		$("#preview_button").css({ "color":this.current_fore_color });
		$( ".fore_button_color" ).each(function( ) {
			$(this).css({"border-color": "#C1E0FF", 
			             "border-width":"0", 
			             "border-style":"solid"});
		});
		$(element).css({"border-color": "#C1E0FF", 
			            "border-width":"2px", 
			            "border-style":"solid"});
	};
	
	/**
	 * The function for when a color is selected by the color picker
	 * @var Object
	 * @return void
	 */
	this.select_background_color_by_picker = function(hexcode) {
		this.current_color = hexcode;
		$("#background_color").val(this.current_color);
		$("#preview_button").css({ "background-color":this.current_color });
		$( ".button_color" ).each(function( ) {
			$(this).css({"border-color": "#C1E0FF", 
			             "border-width":"0", 
			             "border-style":"solid"});
		});
	};
	
	/**
	 * The function for when a color is selected by the color picker
	 * @var Object
	 * @return void
	 */
	this.select_foreground_color_by_picker = function(hexcode) {
		this.current_fore_color = hexcode;
		$("#foreground_color").val(this.current_fore_color);
		$("#preview_button").css({ "color":this.current_fore_color });
		$( ".fore_button_color" ).each(function( ) {
			$(this).css({"border-color": "#C1E0FF", 
			             "border-width":"0", 
			             "border-style":"solid"});
		});
	};
	
	/**
	 * Validate the form
	 * @return Boolean
	 */
	this.validate = function() {
		//test for name
		var errors = [];
		if($("#button_text").val()==""){
			errors.push("Name is empty");
		}
		if($("#button_link").val()==""){
			if($("#button_file_upload").val()==""){
				errors.push("No target selected. Either upload a file or enter a link");
			}
		}
		//if there were errors, show what to fix
		if(errors.length>0){
			var html = "Please fix the following errors: ";
			for(var i=0;i<errors.length;i++){
				html += errors[i];
			}
			$("#error_display").html(html);
			$("#error_display").css({ "display":"block",
									  "margin-bottom":"8px"});
			return false;
		}
		return true;
	};
	
	/**
	 * Deactivate an activity level button
	 * @param Object
	 * @param Int
	 * @return Boolean
	 */
	this.remove_from_agenda_item = function(element, item_id) {
		var url = "/arraylearn/agenda-item-settings/deactivate-activity-button/"+element.id+'?agenda_item_id='+item_id+'&state='+element.checked;
		$.ajax({
			type: "GET",
			url: url
		})
		.done(function(response) {
			console.log(response.responseText);
		})
		.fail(function(html) { alert("Error updating order"); });
	};
	
	/**
	 * Revert back to activity settings
	 * @param Int
	 * @return Boolean
	 */
	this.revert = function(agenda_item_id) {
		var url = "/arraylearn/agenda-item-settings/revert/"+agenda_item_id;
		$.ajax({
			type: "GET",
			url: url
		})
		.done(function(response) {
			window.location.href = "/arraylearn/client/broadcast-agenda-button-update/"+agenda_item_id;
		})
		.fail(function(html) { alert("Error updating order"); });
		return true;
	};
	
	/**
	 * Update the button text on keyup
	 * @return void
	 */
	this.update_preview_text = function() {
		var icon_html = '<i class="array-icon '+AgendaItemSettingsController.current_icon+'"></i>';
		var button_text = "Default Button Preview";
		if($("#button_text").val())
			button_text = $("#button_text").val();
		var html = icon_html + button_text;
		$("#previewBtn .btn").html(html);
	};
	
	/**
	 * Set the icon name
	 * @param String
	 */
	this.set_icon = function(icon_name) {
		AgendaItemSettingsController.current_icon = icon_name;
		$("#pulldown").html('<i class="array-icon '+icon_name+'"></i>');
		$("#selected-icon").val(icon_name);
		this.update_preview_text();
	};
};
AgendaItemSettingsController = new AgendaItemSettingsController();