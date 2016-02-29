function Weather(my_container) {
	//-- Prefix used to prevent any styling/naming conflicts when creating HTML elements
	var _widgetPrefix = 'dbw_';

	//-- Typically set on return of getWeatherByZip()/getWeatherByLatLng()
	var _weatherDetails = {};

	//-- Pointer to location data, currently retrieved via getLocation()
	var _position = null;

	//-- The HTML element we are displaying results in
	var _container = document.getElementById(my_container);

	//-- Getters
	this.getContainer = function() {
		return _container;
	};

	this.getWidgetPrefix = function() {
		return _widgetPrefix;
	};

	//-- Setters
	this.setWeatherDetails = function(my_weatherDetails) {
		_weatherDetails = my_weatherDetails;
	};

	this.setPosition = function(my_position) {
		_position = my_position;
	};

	/**
	* HTML output of weather details
	* @TODO: Convert to template-based or similar
	*
	* @return string output String containing results of weather resposne
	*/
	this.getWeatherDetailsOutput = function() {
		var output = '';
		output = 'The weather in ' + _weatherDetails.name + ' is currently ' + _weatherDetails.weather[0].description + '.';
		output += 'The temperature is currently ' + this.convertKelvinToF(_weatherDetails.main.temp);
		return output;
	};

	/**
	* Convert Kelvin temp to Fahrenheit
	*
	* @param {string|int|float|double} my_temp Temperature in Kelvins
	* @return int tmpInF Temperature converted from Kelving to Fahrenheit
	*/
	this.convertKelvinToF = function(my_kelvinTemp) {

		//-- 
		var tmpInF = parseInt(((my_kelvinTemp - 273.15) * 1.8) + 32, 0);
		tmpInF += '&deg; F';
		return tmpInF;
	};

	/**
	* Process error objects typically from Promise() rejects
	*
	* @param {string} my_error String to display via alert
	* @return none
	*/
	this.handleError = function(my_error) {
		alert(my_error);
	};

	/**
	* Convert HTTP status codes (404, 429, etc) to a readable string based on defined rules via switch(). If
	* no rules exist for a specific code, return status text as that code.
	*
	* @param {int} my_httpStatus HTTP status code to process
	* @return {string} httpStatusText Converted text from HTTP status code
	*/
	this.resolveHttpStatus = function(my_httpStatus) {
		var httpStatusText = my_httpStatus;

		switch (my_httpStatus) {
			case 429:
				httpStatusText = 'Too many requests';
				break;
		}

		return httpStatusText;
	};
}

/**
* Static main method. Init container and attempt to lookup weather by HTML5 geolocation. If lookup
* fails, display zip lookup form.
*
* @return none
*/
Weather.showWeather = function(my_container) {
	var w = new Weather(my_container);
	var that = this;

	//-- If no container is defined, do nothing
	if (my_container !== undefined) {
		//-- Get current location. If not able to, display zip lookup
		w.getLocation().then(function(data) {
			//-- Using the location data, retrieve weather based on lat/lng.
			w.getWeatherByLatLng(data.coords).then(function(data) {
				//-- On success, show results and zip lookup to retrieve any other weather
				w.showResults();
				w.showZipForm();
			}).catch(function(data) {
				//-- On error, display alert
				that.handleError(data.message);
			});
		}).catch(function(data) {
			w.showZipForm();
		});
	}
};

/**
* Public method to create and display a zip lookup form.
*
* @return none
*/
Weather.prototype.showZipForm = function() {
	var that = this;

	//-- Main HTML container from page
	var container = this.getContainer();

	//-- HTML elements to create with main container
	var zipContainer = document.createElement('div');
	var zipInput = document.createElement('input');
	var zipBtn = document.createElement('button');
	
	//-- Assign unique id to zipContainer
	zipContainer.id = that.getWidgetPrefix() + 'weatherZip';

	//-- Define zipInput as a text field
	zipInput.type = 'text';

	//-- Create button and click handler
	zipBtn.innerHTML = "Get Weather";
	zipBtn.addEventListener('click', function(e) {
		that.getWeatherByZip(zipInput.value).then(function(data) {
			that.setWeatherDetails(data);
			that.showResults();
		}).catch(function(data) {
			that.handleError(data.message);
		});
	});

	//-- Add input and button to zipContainer
	zipContainer.appendChild(zipInput);
	zipContainer.appendChild(zipBtn);

	//-- Add zipContainer to main container
	container.appendChild(zipContainer);
};

/**
* Public method to create and display results from weather lookup.
*
* @return none
*/
Weather.prototype.showResults = function() {
	var that = this;
	var container = this.getContainer();
	var resultsContainer = document.createElement('div');
	var resultsContent = document.createElement('p');
	
	resultsContainer.id = that.getWidgetPrefix() + 'weatherResults';

	resultsContent.innerHTML = that.getWeatherDetailsOutput();

	resultsContainer.appendChild(resultsContent);
	container.appendChild(resultsContainer);
};

//-- Base URL for all weather API calls
Weather.prototype.apiUrl = 'http://api.openweathermap.org/data/2.5/weather?appid=44db6a862fba0b067b1930da0d769e98';

/**
* Use HTML5 geolocation to get current position. After 5 seconds, if a location is not determined, Promise object
* is rejected.
*
* @return Promise()
*/
Weather.prototype.getLocation = function() {
	var that = this;

	return new Promise(function(resolve, reject) {
		//-- Timeout request, typically triggered if a user denies location sharing
		var timeout = setTimeout(function() {
			reject({
				message: 'timeout'
			});
		}, 5000);

		//-- Get location via HTML5.
		navigator.geolocation.getCurrentPosition(function(position) {
			//-- On success, clear timeout, set position and return position via the Promise's resolve()
			clearTimeout(timeout);
			that.setPosition(position);

			resolve(position);
		}, function(error) {
			//-- On error return data via Promise's reject()
			reject(error);
		});
	});
};

/**
* Get weather by geolocation.
*
* @param {Object} my_locationData An object that must contain a latitude and longitude attribute
* @return Promise() 
*/
Weather.prototype.getWeatherByLatLng = function(my_locationData) {
	//-- If my_locationData doesn't have a latitude and longitude property, return error via Promise's reject()
	if (my_locationData.latitude && my_locationData.longitude) {
		//-- Construct url for lat/lng request
		var url = this.apiUrl + '&lat=' + my_locationData.latitude + '&lon=' + my_locationData.longitude;
		var that = this;

		return new Promise(function(resolve, reject) {
			var xhr = new XMLHttpRequest();
			xhr.open("GET", url, true);

			xhr.onload = function() {
				//-- On xhr success, set _weatherDetails and return data via resolve()
				if (this.status == 200 && this.status < 300) {
					var responseJSON = JSON.parse(xhr.response);
					that.setWeatherDetails(responseJSON);
					resolve(responseJSON);
				} else {
				//-- On xhr failure, return error via reject()
					reject({
						message: that.resolveHttpStatus(this.status) + ' ' + xhr.statusText
					});
				}
			};

			xhr.send();
		});
	} else {
		//-- Return invalid location (missing lat/lng) error via reject()
		return new Promise(function(resolve, reject) {
			reject({
				message: 'Invalid location'
			});
		});
	}
};

/**
* Get weather by zip code
*
* @param string my_zip Zip code we are getting weather for
* @return Promise()
*/

Weather.prototype.getWeatherByZip = function(my_zip) {
	//-- Make sure a zip is provided
	if (my_zip) {
		//-- Construct url for zip request
		var url = this.apiUrl + '&zip=' + my_zip;
		var that = this;

		return new Promise(function(resolve, reject) {
			var xhr = new XMLHttpRequest();

			xhr.open("GET", url, true);

			xhr.onload = function() {
				//-- On xhr success, process weather response
				if (this.status == 200 && this.status < 300) {
					var responseJSON = JSON.parse(xhr.response);

					//-- If response contains a message, reject as error
					if (responseJSON.message) {
						reject({
							message: responseJSON.message
						});
					} else {
					//-- Otherwise, set _weatherDetails and return data via resolve()
						that.setWeatherDetails(responseJSON);
						resolve(responseJSON);
					}
				} else {
					//-- On xhr failure, return error via reject()
					reject({
						message: that.resolveHttpStatus(this.status) + ' ' + xhr.statusText
					});
				}
			};

			xhr.send();
		});
	} else {
		//-- If no zip provided, return error via reject()
		return new Promise(function(resolve, reject) {
			reject({
				message: 'no zip provided'
			});
		});
	}
};
