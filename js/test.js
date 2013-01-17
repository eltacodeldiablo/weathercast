(function() {
	//hi api key
	var API_KEY = "ab3ee2e7092c2c87";

	var baseUrl = "http://api.wunderground.com/api/"
	var query = "/conditions/almanac/forecast10day/tide/hourly10day/q/";
	var location = "";

	var user_latitude;
	var user_longitude;

	var state = "";
	var city = "";

	//info to fill from json
	var hourly_forecast;
	var temps_f;
	var forecast_days;
	var tide_info;
	var graphNum = 0;

	var todayInt;

	var recordHigh;
	var recordLow;

	//fix geolocation in the future

	// if (navigator.geolocation) {
	//   navigator.geolocation.getCurrentPosition(searchPosition, error);
	// } else {
	//   error('not supported');
	// }

	// function displayError(error) {
	//   var errors = {
	//     1: 'Permission denied',
	//     2: 'Position unavailable',
	//     3: 'Request timeout'
	//   };
	//   alert("Error: " + errors[error.code]);
	//   $('#error').text(errors[error.code]);
	// }

	// function searchPosition() {
	// 	user_latitude = position.coords.latitude;
	// 	user_longitude = position.coords.longitude;

	// 	location =
	// 	getData();
	// }

	$('#today').text($.datepicker.formatDate('M d, yy', new Date()));
	setDates();
	//def
	getData("San_Francisco,_California");

	//set date
	function setDates() {
		var today = new Date();
		var d = today.getDate();
	   	var m = today.getMonth();
	   	var y = today.getYear();
	   	todayInt = today.getDay();
	   	var dayName = new Array("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat");
  		$('#day1').text($.datepicker.formatDate('D', today));
		$('#day2').text(dayName[(today.getDay()+1) % 7]);
		$('#day3').text(dayName[(today.getDay()+2) % 7]);
		$('#day4').text(dayName[(today.getDay()+3) % 7]);
		$('#day5').text(dayName[(today.getDay()+4) % 7]);
	}

	function fadeIn(selection,html) {
		$(selection).fadeOut(function() {
			var align_html = "<div class=\"tc\">" + html + "</div>";
			$(this).html(align_html).fadeIn();
		});}

	//on form submit
	$("form").submit(function() {
		if ($("#location").val() == "") {
			return true;
		}
		else {
			//check input by removing special characters and trim spaces
			location = $("#location").val().trim();
			// if (location.indexOf(',') == -1) {
			// location = location.replace(/[^\w\s]/gi, '');
			location = location.replace(" ","_");
			getData(location);
			return false;
		}
	});

	function getData(location) {
		// console.log(location);
		if (true) {
			$.ajax({
				url: baseUrl + API_KEY + "/geolookup/q/" + location + ".json",
				dataType: "jsonp",
				success: function(stateData) {
				    // get state and rewrite query if they only put the city
				    if (location.indexOf('_') == -1) {
						state = stateData['response']['results'][0]['state'];
				    	city = stateData['response']['results'][0]['city'];
				    	location = state + "/" + location;
				    }
				    else {
				    	state = stateData['location']['state'];
				    	city = stateData['location']['city'];
				    }

				    $('#city').text(city + ", " + state);

				    console.log(baseUrl + API_KEY + query + location + ".json");

				    $.ajax({
						url: baseUrl + API_KEY + query + location + ".json",
						dataType: "jsonp",
						success: function(weatherData) {
							success(weatherData);
						}
					});
				}
			});
		}
		else {
			$.ajax({
				url: "test.json",
				type : 'GET',
				dataType: "json",
				success: function(weatherData) {
					success(weatherData);
				}
			});
		}
	}

	function success(weatherData) {
		 // use the JSON data here for your visualization
		var city_state = weatherData['current_observation']['display_location']['full'];
	    var last_update = weatherData['current_observation']['observation_time'];
	    var weather = weatherData['current_observation']['weather'];
	    var curr_temp = weatherData['current_observation']['temp_f'];//['temperature_string'];
	    var forecast_img = weatherData['current_observation']['icon_url'];
	    var wind_mph = weatherData['current_observation']['wind_mph'];
	    var wind_dir = weatherData['current_observation']['wind_dir'];
	    var curr_humidity = weatherData['current_observation']['relative_humidity'];

	    //current condition/icon + last update
	    $("#lastUpdated").text(last_update);
	    $('#condition').text(weather);
	    $('#city').text(city_state);
	    // console.log(weather.toLowerCase());
	    if (true) {

	    	if ((new Date()).getHours() > 19) {
	    		$('.hero-unit').css('background','url(' + weather.toLowerCase().replace('heavy','').replace('light','').replace(' ','') + '_night.jpg) no-repeat');
				$('.hero-unit').css('color','white');
	    	}
	    	else {
	    		$('.hero-unit').css('background','url(' + weather.toLowerCase().replace('heavy','').replace('light','').replace(' ','') + '.jpg) no-repeat');
	    		$('.hero-unit').css('color','black');
	    	}
	    	if (weather == "Overcast")
	    		$('.hero-unit').css('color','darkorange');

	    	$('.hero-unit').css('background-size','cover');
	    	$('.hero-unit').css('background-position','50% 50%');

	    }
	    $('#current').html("Temp: " + curr_temp+" F <br>" + "Wind: " + wind_mph + " mph" + " " + wind_dir + "<br>Humidity: " + curr_humidity);
	    $('#forecast_icon').attr('src',forecast_img);

	    hourly_forecast = weatherData['hourly_forecast'];//.slice(0,24);

	    forecast_days = weatherData['forecast']['simpleforecast']['forecastday'];
	    tide_info = weatherData['tide']['tideSummary'];//.slice(0,24);
	    recordHigh = weatherData['almanac']['temp_high']['record']['F'];
	    recordLow = weatherData['almanac']['temp_low']['record']['F'];

	    displayGraphs();
	}

	$('#view_temp').click(function() {
		$('#view_temp').addClass('btn-primary');
		$('#view_humidity').removeClass('btn-primary');
		$('#view_tides').removeClass('btn-primary btn-danger');
		// $("#heat").removeAttr("disabled");
		graphNum = 0;
	 	showGraph(hourly_forecast,0);
	});

	$('#view_humidity').click(function() {
		$('#view_temp').removeClass('btn-primary');
		$('#view_humidity').addClass('btn-primary');
		$('#view_tides').removeClass('btn-primary btn-danger');
		// $("#heat").removeAttr("disabled");
		graphNum = 1;
	 	showGraph(hourly_forecast,1);
	});

	$('#view_tides').click(function() {
		$('#view_temp').removeClass('btn-primary');
		$('#view_humidity').removeClass('btn-primary');
		$('#view_tides').addClass('btn-primary');
		// $('#heat').attr('disabled', 'disabled');

	 	if (tide_info.length == 0) {
	 		$('#view_tides').removeClass('btn-primary');
	 		$('#view_tides').addClass('btn-danger');
	 	}
	 	else {
	 		graphNum = 2;
	 		showGraph(tide_info,2);
	 	}
	});

	function displayGraphs() {
		//day 1,2,3
		for (i = 0; i < 5; i++) {
			var days = forecast_days[i];
			var high = days['high']['fahrenheit'];
			var low = days['low']['fahrenheit'];
			var pop = days['pop'];
			var avg_humidity = days['avehumidity'];

			var day = $('#day' + (i+1) + "table");

			fadeIn($('#day' + (i+1) + "table").find('td')[0],low + "-" + high + " F");
			fadeIn(day.find('td')[1],avg_humidity + "%");
			fadeIn(day.find('td')[2],pop + "%");
		}

		if (line == null) {
			$('#view_temp').addClass('btn-primary');
			graphNum = 0;
			showGraph(hourly_forecast, 0);
		}
		else {

			$('#view_temp').addClass('btn-primary');
			$('#view_humidity').removeClass('btn-primary');
			$('#view_tides').removeClass('btn-primary btn-danger');
			graphNum = 0;
		 	showGraph(hourly_forecast, 0);
		}
	}

	// define dimensions of graph
	var m = [10, 80, 40, 80]; // margins
	var w = 1200 - m[1] - m[3]; // width
	var h = 390 - m[0] - m[2]; // height
	//var format = d3.time.format("%H");

	var maxCircles = 50,
		transitionDuration = 750,
		circleRadius = 3;
	// create a simple data array that we'll plot with a line (this array represents only the Y values, X will just be the index location)
	//var data = hourly_forecast;//[3, 6, 2, 7, 5, 2, 0, 3, 8, 9, 2, 5, 9, 3, 6, 3, 6, 2, 7, 5, 2, 1, 3, 8, 9, 2, 5, 9, 2, 7];

	// X scale will fit all values from data[] within pixels 0-w
	var x = d3.time.scale().range([0, w]);
	// Y scale will fit values from 0-10 within pixels h-0 (Note the inverted domain for the y-scale: bigger is up!)
	var y = d3.scale.linear().range([h, 0]);
	// automatically determining max range can work something like this
	// var y = d3.scale.linear().domain([0, d3.max(data)]).range([h, 0]);
	var line;
	var graph = null;
	var xAxis;
	var yAxisLeft;
	var dataCirclesGroup = null,
		yAxisGroup = null,
		xAxisGroup = null,
		dataLinesGroup = null;
	var minDate;
	var maxDate;
	var circles = null;
	var rect = null;
	var heat = null;
	var legend = null;
	var legendtext;
	var lAxis;
	var lScale;

	function getX(d,num) {
		if (num == 2) {
			return new Date(parseInt(d.date.epoch+"000"));
		}
		else {
			return new Date(parseInt(d.FCTTIME.epoch+"000"));
		}

    }

    function getY(d,num) {
		if (num == 0)
			return parseInt(d.temp.english);
		else if (num == 1)
			return parseInt(d.humidity);
		else {
			var result = d.data.height;
			if (result == "")
				return 0;
			else
				return parseInt((result).substring(0,result.length-3));
		}
    }

	function showGraph(data, num) {

		$('#graph').html("");

		//5 days
		if (data.length >= 120)
			data = data.slice(0,120);

		// get max and min dates - this assumes data is sorted
    	minDate = getX(data[0],num),
        maxDate = getX(data[data.length-1],num);
        //max/min values
        var max = d3.max(data, function(d) { return getY(d,num); });
		var min = d3.min(data, function(d) { return getY(d,num); });

		if (num == 0) {
			x.domain([new Date(0,0,0,0),new Date(0,0,0,23)]);
			y = d3.time.scale().domain([minDate,maxDate]).range([0,45*5]);
		}
		else if (num == 1) {
			x.domain([minDate,maxDate]);
			y = d3.scale.linear().domain([0, 100]).range([h, 0]);
		}
		else if (num == 2) {
			x.domain([minDate,maxDate]);
			y = d3.scale.linear().domain([min, max]).range([h, 0]);
		}

		xAxis = d3.svg.axis().scale(x).ticks(12);
		yAxisLeft = d3.svg.axis().scale(y).ticks(10).orient("left");

		if (num == 0) {
			xAxis.ticks(24).tickFormat(d3.time.format("%I"));
			yAxisLeft.ticks(5);
		}
		else {
			xAxis.ticks(5).tickFormat(d3.time.format("%a"));
		}

		// Add an SVG element with the desired dimensions and margin.
		graph = d3.select("#graph").select('svg').select('g');
		if (graph.empty()) {
			graph = d3.select('#graph')
			.append("svg:svg")
		      .attr("width", w + m[1] + m[3])
		      .attr("height", h + m[0] + m[2])
		    	.style("position", 'relative')
		    	.style("left", '0')
  				.style("top", 0)
		    .append("svg:g")
		      .attr("transform", "translate(" + m[3] + "," + m[0] + ")");
		}

		var t = null;
		t = graph.transition().duration(transitionDuration);

		if (num == 0) {
			xAxisGroup = graph.append("svg:g")
	    	.attr("class", "x axis")
	    	.attr("transform", "translate(20," + (225) + ")")
	    	.call(xAxis);

	    	var xAxisGroup2 = graph.append("svg:g")
	    	.attr("class", "x axis2")
	    	.attr("transform", "translate(20," + (250) + ")")
	    	.call(xAxis.ticks(2).tickFormat(d3.time.format("%p")));
	    }
	    else {
	    	xAxisGroup = graph.append("svg:g")
	    	.attr("class", "x axis")
	    	.attr("transform", "translate(20," + (h-8) + ")")
	    	.call(xAxis);

	    	xAxisGroup2 = graph.append("svg:g")
	    	.attr("class", "x axis2")
	    	.attr("transform", "translate(20," + (h+15-8) + ")")
	    	.call(xAxis.ticks(10).tickFormat(d3.time.format("%I%p")));
	    }

		yAxisGroup = graph.append("svg:g")
	      .attr("class", "y axis")
	      .attr("transform", "translate(-25,0)")
	      .call(yAxisLeft);

		if (num == 0) {
			var colorScale = d3.scale.linear().domain([recordLow,recordHigh]).range([0,100]);

			heat = graph.selectAll('.heat').data(data);

			heat
				.enter().append("svg:rect")
				.attr('class', 'heat')
				.attr("x", function(d, i) { return x(new Date(0,0,0,getX(d,num).getHours())); })
				.attr("y", function(d) {
					return 45*Math.floor((getX(d,num).getTime() - minDate.getTime()) / 86400000);
				})
				.style("fill", function(d) { return 'white';})
				.attr('num', num)
				.attr("width", 40)
				.attr("height", function(d) { return 40; });

			heat.transition()
				.duration(transitionDuration)
				.attr("x", function(d, i) { return x(new Date(0,0,0,getX(d,num).getHours())); })
				.attr("y", function(d) {
					return 45*Math.floor((getX(d,num).getTime() - minDate.getTime()) / 86400000);
				})
				.style("fill", function(d) { return 'hsl(' + ((100-colorScale(getY(d,num)))*1.1) + ', 95%, 53%)'; })

			heat.exit().transition()
				.duration(transitionDuration)
				.attr("x", function(d, i) { return x(new Date(0,0,0,getX(d,num).getHours())); })
				.attr("height", function(d) { return 0; })
					.remove();

			$('svg .heat').tipsy({
				gravity: 'w',
				html: true,
				title: function() {
					var d = this.__data__;
					var pDate = getX(d,this.getAttribute('num'));
				  	return 'Date: ' + pDate.getHours() + ":00 " +  pDate.getMonth() + "/" + pDate.getDate()  + '<br>Value: ' + getY(d,this.getAttribute('num')) + 'F';
				}
			});

			var highnum = (recordHigh+10-recordLow) % 100 / 10 | 0;
			var legendData = [highnum];
			for (i = 0; i < highnum; i++) {
				legendData[i] = ((recordLow % 100 / 10 | 0)+i)*10;
				// console.log(legendData[i]);
			}

			legend = graph.selectAll('.legend').data(legendData);

			legend
				.enter().append("svg:rect")
				.attr('class', 'legend')
				.attr("x", function(d, i) {return x(new Date(0,0,0,i)); })
				.attr("y", function(d) {
					return 45*6+2;
				})
				.style("fill", function(d,i ) { return 'hsl(' + ((100-colorScale(d))*1.1) + ', 95%, 53%)'; })
				.attr("width", 40)
				.attr("height", function(d) { return 40; });

			legend.exit().transition()
				.duration(transitionDuration)
				.attr("x", function(d, i) { return x(new Date(0,0,0,i)); })
				.attr("height", function(d) { return 0; })
					.remove();

			// y.domain([0, 100]);
			// var y = d3.scale.linear().range([h, 0]);
			// yAxisLeft = d3.svg.axis().scale(y).ticks(10).orient("left");

			lScale = d3.scale.linear().domain([legendData[0],legendData[legendData.length-1]]).range([0,38*6]);
			lAxis = d3.svg.axis().scale(lScale).ticks(legendData.length);

			legendtext = graph.append("svg:g")
		    	.attr("class", "legendtext")
		    	.attr("transform", "translate(20," + 45*7 + ")")
		    	.call(lAxis);

			$('svg .legend').tipsy({
				gravity: 'w',
				html: true,
				title: function() {
					var d = this.__data__;
				  	return 'Value: ' + d + 'F';
				}
			});
		}
		else if (num == 1) {
			// // create a line function that can convert data[] into x and y points
			line = d3.svg.line()
				// assign the X function to plot our line as we wish
				.x(function(d,i) {
					// verbose logging to show what's actually being done
					// console.log('Plotting X value for data point: ' + d + ' using index: ' + i + ' to be at: ' + x(i) + ' using our xScale.');
					// return the X coordinate where we want to plot this datapoint
					return x(getX(d,num));
				})
				.y(function(d) {
					// verbose logging to show what's actually being done
					// console.log('Plotting Y value for data point: ' + d + ' to be at: ' + y(d) + " using our yScale.");
					// return the Y coordinate where we want to plot this datapoint
					// console.log(d.temp.english);
					return y(getY(d,num));
				});

				dataLinesGroup = graph.append("svg:path")
						.attr("class", "line")
						.attr("d", line(data));

				dataCirclesGroup = graph.append('svg:g');

				circles = dataCirclesGroup.selectAll('.data-point')
						.data(data);

				circles
					.enter().append('svg:circle')
						.attr('class', 'data-point')
						.style('opacity', 1e-6)
						.attr('cx', function(d) { return x(getX(d,num)); })
						.attr('cy', function() { return y(0); })
						.attr('r', function(d,i) { return circleRadius;})//return (i % 4 == 0) ? circleRadius : 0; })
						.attr('num', num)
						.transition()
						.duration(transitionDuration)
							.style('opacity', 1)
							.attr('cx', function(d) { return x(getX(d,num)); })
							.attr('cy', function(d) { return y(getY(d,num)); });

				circles.transition()
					.duration(transitionDuration)
					.attr('cx', function(d) { return x(getX(d,num)); })
					.attr('cy', function(d) { return y(getY(d,num)); })
					.attr('r', function(d,i) { return circleRadius;})//return (i % 4 == 0) ? circleRadius : 0; })//(data.length <= maxCircles) ? circleRadius : 0 });
					.attr('num', num)
					.style('opacity', 1);

				circles.exit()
					.transition()
					.duration(transitionDuration)
						// Leave the cx transition off. Allowing the points to fall where they lie is best.
						//.attr('cx', function(d, i) { return xScale(i) })
						.attr('cy', function() { return y(0); })
						.style("opacity", 1e-6)
						.remove();

				$('svg circle').tipsy({
					gravity: 'w',
					html: true,
					title: function() {
						var d = this.__data__;
						this.getAttribute('num')
						var pDate = getX(d,this.getAttribute('num'));
					  	return 'Date: ' + pDate.getHours() + ":00 " +  pDate.getMonth() + "/" + pDate.getDate()  + '<br>Value: ' + getY(d,this.getAttribute('num')) + '%';
					}
				});
		}
		else if (num == 2) {
			rect = graph.selectAll('.rect').data(data);
			rect
				.enter().append("svg:rect")
				.attr('class', 'rect')
				.attr("x", function(d, i) { return x(getX(d,num)) - .5; })
				.attr("y", function(d) { return y(getY(d,num)) - .5; })
				.attr("width", 20)
				.attr("height", function(d) { return h - y(getY(d,num)); });

			rect.transition()
				.duration(transitionDuration)
				.attr("x", function(d, i) { return x(getX(d,num)) - .5; })
				.attr("y", function(d) { return y(getY(d,num)) - .5; })
				.attr("height", function(d) { return h - y(getY(d,num)); });

			rect.exit().transition()
				.duration(transitionDuration)
				.attr("height", function(d) { return 0; })
					.remove();

			$('svg .rect').tipsy({
				gravity: 's',
				html: true,
				title: function() {
					var d = this.__data__;
					var pDate = getX(d,2);
				  	return 'Date: ' + pDate.getHours() + ":00 " +  pDate.getMonth() + "/" + pDate.getDate()  + '<br>Value: ' + getY(d,2) + 'ft';
				}
			});
		}

	}

})();
