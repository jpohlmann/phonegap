DesignController = function() {
	this.id = 0;
	this.page_id = 0;
	this.view = new DesignView();
	this.model = new DesignModel();
	this.mode = "design";
	
	/**
	 * Get the loading image
	 * @return String
	 */
	this.get_loading_image = function() {
		return '<div style="text-align:center;"><img src="/images/loading.gif" alt="Loading..." title="Loading" /></div>';
	};
	
	/**
	 * Render the design view
	 * @return Boolean
	 */
	this.render = function(id, page_id, mode) {
		this.id = id;
		this.page_id = page_id;
		this.mode = mode;
		$( "#design_window_container" ).html(this.get_loading_image());
		var url = "/surveyengine/page/design/"+id+"?page_id="+page_id+"&is_terminal=true&mode="+this.mode;
		$.ajax({
			type: "GET",
			url: url
		})
		.done(function(html) { 
			$("#design_window_container").html(html);
		});
		//.fail(function() { alert("error"); });
		return true;
	};
	
	/**
	 * Load the list of current available questions
	 * @return Boolean
	 */
	this.load_questions = function(page_id) {
		$( "#question_container" ).html(this.get_loading_image());
		var url = "/surveyengine/question/design?is_terminal=true&page_id="+page_id+"&mode="+this.mode;
		//var data = {'is_terminal':true, 'page_id':this.page_id};
		$.ajax({
			type: "GET",
			url: url
		})
		.done(function(html) { 
			$("#question_container").html(html);
		});
		
		//create the droppable container
		$(function() {
			 $( "#design_window_container" ).droppable({
			 drop: function( event, ui ) {
				 var element = ui.draggable;
				 var question_id = element.attr('id').split('_');
				 $( "#design_window_container" ).html(DesignController.get_loading_image());
				 element.hide();
				 DesignController.catch_drag_drop(element.attr('page_id'), question_id[1]);
			 }
			 });
		 });
	};
	
	/**
	 * Catch the drag and drop action
	 * @param Int
	 * @param Int
	 * @return Boolean
	 */
	this.catch_drag_drop = function(page_id, question_id) {
		$( "#design_window_container" ).html(this.get_loading_image());
		var url = "/surveyengine/page/addquestion/"+page_id+"?question_id="+question_id;
		$.ajax({
			type: "GET",
			url: url
		})
		.done(function(html) {
			DesignController.render(DesignController.id, page_id); //reload the screen
		});
	};
	
	/**
	 * Remove a question from a survey
	 * @param Int
	 * @return Boolean
	 */
	this.delete_question_link = function(page_id, question_id) {
		$( "#design_window_container" ).html(this.get_loading_image());
		var url = "/surveyengine/page/removequestion/"+page_id+"?question_id="+question_id;
		$.ajax({
			type: "GET",
			url: url
		})
		.done(function(html) {
			DesignController.render(DesignController.id, page_id); //reload the screen
			DesignController.load_questions(page_id);
		})
		return true;
	};
};

DesignModel = function() {
	/**
	 * Save the drag and drop action
	 * @return Boolean
	 */
	this.save_drag_drop = function() {
		return true;
	};
};

DesignView = function() {
	
};

DesignController = new DesignController();