ChartingController = function() {
	/**
	 * Holds the data params we need to process
	 * @var Json
	 */
	this.data = "";
	
	/**
	 * Holds the default colors for the bars
	 * @var Array
	 */
	this.color_set = ["#0015FF", "#FF0055"];
	
	/**
	 * Render the graph handdrawn
	 * @var boolean
	 */
	this.handdrawn = false;
	
	/**
	 * Scale the graph dynamically, rather than typical 0-100 scale
	 * @var boolean
	 */
	this.dynamic_scale = false;
	
	/**
	 * Display the answers inline, rather that above the graph
	 * @var boolean
	 */
	this.inline_answers = false;
	
	/**
	 * Custom size of the point labels
	 * @var integer
	 */
	this.custom_pointlabel_size = null;
	
	/**
	 * Custom size of labels
	 * @var integer
	 */
	this.label_size = 12;
	
	/**
	 * Make labels bold
	 * @var boolean
	 */
	this.label_bold = true;
	
	/**
	 * Label font
	 * @var string
	 */
	this.label_font = 'Arial';
	
	/**
	 * Disable 3d rendering of graphs
	 * @var boolean
	 */
	this.disable_3d = false;
	
	/**
	 * Disable gridlines on graphs
	 * @var boolean
	 */
	this.disable_gridlines = false;
	
	/**
	 * Set the data to process
	 * @param JSON
	 */
	this.set_data = function(data) {
		this.data = data;
	};
	
	/**
	 * Render the chart
	 * @return void
	 */
	this.render = function() {
        var answers = [];
		var history = this.data.chart_output;
		//create the datasource for the chart (something useful we can use!)
		$.each( this.data.chart_output, function( element, value ) {
			answers.push(value.response);
		});
		var question_text = this.data.question_params.question.question_text;
		var graph_type = 'Bar';
		if (this.data.question_params.question.graph_type != null) {
			graph_type = this.data.question_params.question.graph_type;
		}
                if ( graph_type=='Table') {
                    var html = question_text + '<div class="slot-1-2-3 span12" style="margin-left: 1%; margin-top: 30px;"><table class="table" id="table-response"><thead>';
                    var exist = false;
                    for(var i=0;i<this.data.chart_output.length;i++){
                        if ( typeof this.data.chart_output[i].Post !== 'undefined' )
                            exist = true;
                        if ( i==0 ) {
                            html += '<tr><th>Answer</th><th>Pre</th>';
                            if ( exist )
                                html += '<th>Post</th>';
                            html += '</tr></thead><tbody>';
                        }
                        var pre = 0;
                        if ( $.isNumeric(this.data.chart_output[i].Pre) ) {
                            pre = this.data.chart_output[i].Pre.toFixed(2);
                        }
                        var post = 0;
                        if ( $.isNumeric(this.data.chart_output[i].Post) ) {
                            post = this.data.chart_output[i].Post.toFixed(2);
                        }
                        html += '<tr><td>'+this.data.chart_output[i].response+'</td><td>'+pre+'%</td>';
                        if ( exist ) {
                            html += '<td>'+post+'%</td>';
                        }
                        html += '</tr>';
                    }
                    html += '</tbody></table></div>';
                    $("#slideArea").html(html);
                    return;
                }                
		var html = '<div class="slot-1-2-3-4-5-6">'+question_text+'';
        var chart1 = new cfx.Chart();
        html += '<style>';
        if (this.custom_pointlabel_size != null) {
        	html += '.jchartfx .PointLabel{font-size: '+this.custom_pointlabel_size+'px;}';
        }
        html += '.jchartfx{font-size: '+this.label_size+'pt;}';
        if (this.label_bold) {
        	html += '.jchartfx{font-weight: bold}';
        }
        html += '.jchartfx{font-family: \''+this.label_font+'\'}';
        html += '</style>';
        chart1.setGallery(cfx.Gallery[graph_type]);
        if (this.disable_gridlines) {
	        chart1.getAxisY().getGrids().getMajor().setVisible(false);
	        chart1.getAxisX().getGrids().getMajor().setVisible(false);
        }
		if (!this.dynamic_scale) {
	        chart1.getAxisY().setMin(0);
			chart1.getAxisY().setMax(100);
		}
		var history = this.data.chart_output;
		if(graph_type=='Gantt'){
			this.data.chart_output = this.refactor(this.data.chart_output);
		};
		offset = this.get_label_offset_values(this.data.chart_output);
		chart1.setDataSource(this.data.chart_output);
		if (!this.disable_3d) {
			chart1.getView3D().setEnabled(true);
			chart1.getAllSeries().getPointLabels().setOffset(offset);
		}
		chart1.getAnimations().getLoad().setEnabled(true);
		if (this.handdrawn) {
            html += '<style>.jchartfx{font-family: HandWritten;}</style>';
	        var handDrawn = new cfx.handdrawn.HandDrawn();
	        chart1.getExtensions().add(handDrawn);
	        chart1.getAnimations().getLoad().setEnabled(false);
		}
		chart1.getAllSeries().getPointLabels().setVisible(true);
		chart1.getAllSeries().getPointLabels().setFormat("%v%%");
		if(typeof this.data.chart_output[0].Post === 'undefined' && graph_type!="Pie"){
        	chart1.getLegendBox().setVisible(false);
        }
		for(var i=0;i<answers.length;i++){
			var axis;
			axis = chart1.getAxisX();
			if (this.inline_answers) {
				axis.getLabels().setItem(i, answers[i]);
			} else {
				axis.getLabels().setItem(i, i+1);
			}
			if (!this.inline_answers) {
				html += '<div class="row answer-row" style="margin-left:40px;">'+(i+1)+'. '+answers[i]+'</div>';
			}
		}
		//modify the graph axis label order if necessary
		if(graph_type=='Gantt'){
			var count = 0;
			for(var i=answers.length;i>=0;i--){
				var axis = chart1.getAxisX();
				if (this.inline_answers) {
					axis.getLabels().setItem(i, answers[count-1]);
				} else {
					axis.getLabels().setItem(i, count);
				}
				count++;
			};
            if(this.data.question_params.interval_id==1){
                html += '<style>.chartgantt .jchartfx .Attribute0{fill:cornflowerblue;}.chartgantt .jchartfx .Attribute1{fill:yellowgreen;}</style>';
            }else{
                html += '<style>.chartgantt .jchartfx .Attribute0{fill:yellowgreen;}.chartgantt .jchartfx .Attribute1{fill:cornflowerblue;}</style>';
            }
            html += '<div id="ChartDiv" class="chartgantt" style="width:80%;margin-left:10px;"></div></div>';
            $("#slideArea").html(html);
            var divHolder = document.getElementById('ChartDiv');
        }else{
            html += '<div id="ChartDiv" style="width:80%;margin-left:10px;"></div></div>';
            $("#slideArea").html(html);
            var divHolder = document.getElementById('ChartDiv');
        }
	    chart1.create(divHolder);
		this.data.chart_output = history;
	};
	
	/**
	 * Get the number of bars that will be on the graph from the chart data
	 * @param Array Chart data
	 * @return integer Number of bars
	 */
	this.get_number_of_bars = function(chart_data) {
		var bar_num = chart_data.length;
		if (bar_num == 0) {
			return bar_num;
		}
		//If we have post data, we'll have twice the bars
		if (chart_data[0].Post != 'undefined') {
			bar_num = bar_num * 2;
		}
		return bar_num;
	};
	
	/**
	 * Get the offset values for the point labels based on the number of bars.
	 * (more bars means less offset)
	 * 
	 * @param Array Chart data
	 * @return string pointlabel offset values
	 */
	this.get_label_offset_values = function(chart_data) {
		var bar_num = this.get_number_of_bars(chart_data);
		//This shouldn't ever happen, but just avoiding divide by zero
		if (bar_num == 0) {
			return "0,0";
		}
		var x_value = 100/bar_num;
		var y_value = 150/bar_num;
		return x_value+","+y_value;
	};
	
	/**
	 * Refactor the array to reverse the items
	 * @param Array
	 * @return Array
	 */
	this.refactor = function(data) {
		var count = (data.length-1);
		var new_obj = [];
		$.each(data, function( key, value ) {
                    var o = new Object();
                    var keys = Object.keys(value);
                    for(var i=0;i<keys.length;i++){
                        o[keys[i]] = value[keys[i]];
                    }
                    new_obj[count] = o;
                    count--;
		});
                return new_obj;
	};
};
