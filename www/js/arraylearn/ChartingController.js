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
        var correct = [];
        var pre_display_answer = 0;
        var post_display_answer = 0;
        var display_answer = 0;
		var history = this.data.chart_output;
		//create the datasource for the chart (something useful we can use!)
		$.each( this.data.chart_output, function( element, value ) {
                        var response = value.response.split('###');
			answers.push(response[0]);
                        correct.push(response[1]);
                        pre_display_answer = response[2];
                        post_display_answer = response[3];
		});
                if ((typeof this.data.chart_output[0].Post === 'undefined' && pre_display_answer==1) || (typeof this.data.chart_output[0].Post != 'undefined' && post_display_answer==1))  
                    display_answer = 1;
		var question_text = this.data.question_params.question.question_text;
		var graph_type = 'Bar';
		if (this.data.question_params.question.graph_type != null) {
			graph_type = this.data.question_params.question.graph_type;
		}
                if ( graph_type=='Table' || graph_type=='Grid') {
                    var prei = 0;
                    var posti = 0;
                    var totpre = {};
                    var totpost = {};
                    var gridview = '';
                    var html = '<div class="slot-1-2-3-4-5-6"><p>' + question_text + '</p></div><div class="slot-1-2-3 span12" style="margin-left: 1%; margin-top: 30px;">';
                    var exist = false;
                    htmlheading = '';
                    if ( typeof this.data.chart_output[0].Post !== 'undefined' )
                        exist = true;              
                    
                    for(var i=0;i<this.data.chart_output.length;i++){
                        htmlheading = '';
                        if ( graph_type=='Table' ) {
                            var pre = 0;
                            if ( $.isNumeric(this.data.chart_output[i].Pre) ) {
                                pre = parseFloat(this.data.chart_output[i].Pre).toFixed(2);
                            }
                            var post = 0;
                            if ( this.data.chart_output[i].Post !== 'undefined' ) {
                                if ( $.isNumeric(this.data.chart_output[i].Post) ) {
                                    post = parseFloat(this.data.chart_output[i].Post).toFixed(2);
                                }
                            }
                            pre = '<td>'+pre+'%</td>';
                            post = '<td>'+post+'%</td>';
                            
                            if ( i==0 ) {
                                
                                htmlheading += '<table class="table" id="table-response"><thead><tr><th>Answer</th><th>Pre</th>';
                                if ( exist==true )
                                    htmlheading += '<th>Post</th>';
                                htmlheading += '</tr></thead><tbody>';
                            }
                            
                        } else {

                            gridview = 'gridview';
                            var presplit = this.data.chart_output[i].Pre.split('#');
                            var pre = '';
                            for(prei=0; prei< presplit.length; prei++) {
                              pre += '<td>'+presplit[prei]+'</td>';
                              if (typeof totpre[prei]!=='undefined')
                                  totpre[prei] = parseInt(totpre[prei])+parseInt(presplit[prei]);
                              else
                                  totpre[prei] = presplit[prei];
                                  
                            }
                     
                            if ( exist==true ) {
                                var postsplit = this.data.chart_output[i].Post.split('#');
                                var post = ''
                                for(posti=0; posti< postsplit.length; posti++) {
                                  post += '<td>'+postsplit[posti]+'</td>';
                                  if (typeof totpost[posti]!=='undefined')
                                      totpost[posti] = parseInt(totpost[posti])+parseInt(postsplit[posti]);
                                  else
                                      totpost[posti] = postsplit[posti];                              
                                }    
                            }
                            
                            if ( i==0 ) {
                                 if ( exist==true ) {
                                    htmlheading += '<table id="table-response" class="table gridview"><thead><tr><th rowspan="2">Answer</th>';
                                    for ( var ij=1; ij<=prei; ij++ ) {
                                        htmlheading += '<th colspan="2">Rank '+ij+'</th>';
                                    }
                                    htmlheading += '</tr><tr>';
                                    for ( var ij=1; ij<=posti; ij++ ) {
                                        htmlheading += '<th>Pre</th><th>Post</th>';
                                    }
                                    htmlheading += '</tr></thead><tbody>';
                                 } else {
                                    htmlheading += '<table id="table-response" class="table gridview"><thead><tr><th>Answer</th>';
                                    for ( var ij=1; ij<=prei; ij++ ) {
                                        htmlheading += '<th>Rank '+ij+'</th>';
                                    }
                                    htmlheading += '</tr></thead><tbody>';
                                 }
                            }
                            
                        }
                        
                        
                        
                        var response = this.data.chart_output[i].response.split('###');
                        var color = '';
                        if ( response[1] == 1 && display_answer==1 ) {
                            color = 'style="background-color:#ffa500"';
                        }

                        html += htmlheading + '<tr '+color+' ><td>'+response[0]+'</td>'+pre;
                        if ( exist==true ) {
                            html += post;
                        }
                        html += '</tr>';
                    }
                    if ( graph_type=='Grid' ) {
                        html += '<tr><td>Total</td>';
                        for ( var ij=0; ij<prei; ij++ ) {
                            html += '<td>'+totpre[ij]+'</td>';
                        }                    
                        if ( exist==true ) {
                            for ( var ij=0; ij<posti; ij++ ) {
                                html += '<td>'+totpost[ij]+'</td>';
                            }                    
                        }
                        html += '</tr>';
                    }
                    html += '</tbody></table></div>';
                    $("#slideArea").html(html);
                    return;
                }                
		var html = '<div class="slot-1-2-3-4-5-6">'+question_text+'';
        cfx.Chart.setLicense("R;2013/10/29;0;arraylearn.com;5d53b219b9c1c1b87b52878a8e666f3b46a9eca87b0619d57573bb77029ab845ce6439733473c81a8bc812489f9a322a2d9b6f5c8580781638f4a2fdfd4bc6cc7649a97d9c28d98a5307462550b30e5a74a9ee615e3d01d5ee513cc1b9ccd690dc243073cfed6896c7bf4774f3600c4e60cb042b95757700135d10fb27c668ea");
        var chart1 = new cfx.Chart();
        html += '<style>#C0s{overflow:visible;}';
        if (graph_type=='Gantt'){
            if(this.data.question_params.interval_id==1){
                html += '.chartgantt .jchartfx .Attribute0{fill:cornflowerblue;}.chartgantt .jchartfx .Attribute1{fill:yellowgreen;}';
            }else{
                html += '.chartgantt .jchartfx .Attribute0{fill:yellowgreen;}.chartgantt .jchartfx .Attribute1{fill:cornflowerblue;}';
            }
        }
        if(pre_display_answer==1 && typeof this.data.chart_output[0].Post === 'undefined') {
            if (graph_type=='Gantt')
                html += '.chartgantt .jchartfx .Attribute0,.chartgantt .jchartfx .Attribute1,.chartgantt .jchartfx .Attribute2,.chartgantt .jchartfx .Attribute3,.chartgantt .jchartfx .Attribute4,.chartgantt .jchartfx .Attribute5,.chartgantt .jchartfx .Attribute6,.chartgantt .jchartfx .Attribute10,.jchartfx .Attribute7,.jchartfx .Attribute8,.jchartfx .Attribute9{fill:cornflowerblue;}';
            else if ( graph_type!='Pie' )
                html += '.jchartfx .Attribute0,.jchartfx .Attribute1,.jchartfx .Attribute2,.jchartfx .Attribute3,.jchartfx .Attribute4,.jchartfx .Attribute5,.jchartfx .Attribute6,.jchartfx .Attribute10,.jchartfx .Attribute7,.jchartfx .Attribute8,.jchartfx .Attribute9{fill:cornflowerblue;}';

        }
        if (graph_type=='Gantt')
            html += '.chartgantt .jchartfx .changecolor{fill:#ffa500;}';
        else
            html += '.jchartfx .changecolor{fill:#ffa500;}';
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
                if(typeof this.data.chart_output[0].Post === 'undefined' && pre_display_answer==1)
                    chart1.getAllSeries().setMultipleColors(true);
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
           

            var count = answers.length;
            var chartgantt = '';
            for(var i=0;i<answers.length;i++){
                var axis;
                axis = chart1.getAxisX();
                //modify the graph axis label order if necessary
                var graphi = i;
                if(graph_type=='Gantt'){
                    graphi = count-1;
                    var chartgantt = 'class="chartgantt"';
                    if (this.inline_answers) {
                        axis.getLabels().setItem(count, answers[i-1]);
                    } else {
                        axis.getLabels().setItem(count, i);
                    }
                } else {
                    if (this.inline_answers) {
                            axis.getLabels().setItem(i, answers[i]);
                    } else {
                            axis.getLabels().setItem(i, i+1);
                    }                        
                }

                var ans = correct[graphi];
                if ( graph_type!='Pie' && ans==1 && display_answer==1 ) {
                    chart1.getPoints().getItem(0, i).setTag("changecolor");
                    chart1.getPoints().getItem(1, i).setTag("changecolor");
                    //chart1.getPoints().getItem(0, i).setColor('#00ff00');
                }                
                var color = '';
                var ans = correct[i];
                if ( ans==1 && display_answer==1 ) {
                    color = 'color:#ffa500;';

                }
                if (!this.inline_answers) {
                        html += '<div class="row answer-row" style="margin-left:40px;'+color+'">'+(i+1)+'. '+answers[i]+'</div>';
                }
                count--;
            }
            if(graph_type=='Gantt')
                axis.getLabels().setItem(count, i);
            html += '<div id="ChartDiv" style="width:80%;margin-left:10px;" '+chartgantt+'></div></div>';
            
            $("#slideArea").html(html);
            var divHolder = document.getElementById('ChartDiv');
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
