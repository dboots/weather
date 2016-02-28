function Weather(my_container) {
	var _widgetPrefix = 'dbw_';
	var _weatherDetails = {};
	var _weatherData = {};
	var _position = null;
	var _container = document.getElementById(my_container);

	this.getContainer = function() {
		return _container;
	};

	this.setWeatherDetails = function(my_weatherDetails) {
		_weatherDetails = my_weatherDetails;
	};

	this.getWeatherDetailsOutput = function() {
		var output = '';
		output = 'The weather in ' + _weatherDetails.name + ' is currently ' + _weatherDetails.weather[0].description + '.';
		output += 'The temperature is currently ' + this.convertToF(_weatherDetails.main.temp);
		return output;
	};

	this.convertToF = function(my_temp) {
		var tmpInF = parseInt(((my_temp - 273.15) * 1.8) + 32, 0);
		tmpInF += '&deg; F';
		return tmpInF;
	};

	this.setPosition = function(my_position) {
		_position = my_position;
	};

	this.getWidgetPrefix = function() {
		return _widgetPrefix;
	};
}

Weather.showWeather = function(my_container) {
	var w = new Weather(my_container);

	if (my_container !== undefined) {
		w.getLocation().then(function(data) {
			w.getWeatherByLatLng(data.coords).then(function(data) {
				w.showResults();
				w.showZipForm();
			});
		}).catch(function(data) {
			w.showZipForm();
		});
	}
};

Weather.prototype.showZipForm = function() {
	var that = this;
	var container = this.getContainer();
	var zipContainer = document.createElement('div');
	var zipInput = document.createElement('input');
	var zipBtn = document.createElement('button');
	
	zipContainer.id = that.getWidgetPrefix() + 'weatherZip';

	zipInput.type = 'text';

	zipBtn.innerHTML = "Get Weather";
	zipBtn.addEventListener('click', function(e) {
		that.getWeatherByZip(zipInput.value).then(function(data) {
			if (data.message) {
				alert(data.message);
			} else {
				that.setWeatherDetails(data);
				that.showResults();
			}
		});
	});

	zipContainer.appendChild(zipInput);
	zipContainer.appendChild(zipBtn);

	container.appendChild(zipContainer);
};

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

Weather.prototype.apiUrl = 'http://api.openweathermap.org/data/2.5/weather?appid=44db6a862fba0b067b1930da0d769e98';

Weather.prototype.getLocation = function() {
	var that = this;

	return new Promise(function(resolve, reject) {
		var timeout = setTimeout(function() {
			reject('timeout');
		}, 5000);

		navigator.geolocation.getCurrentPosition(function(position) {
			clearTimeout(timeout);
			that.setPosition(position);

			resolve(position);
		}, function(error) {
			reject(error);
		});
	});
};

Weather.prototype.getWeatherByLatLng = function(my_locationData) {
	var url = this.apiUrl + '&lat=' + my_locationData.latitude + '&lon=' + my_locationData.longitude;
	var that = this;

	return new Promise(function(resolve, reject) {
		var xhr = new XMLHttpRequest();

		xhr.open("GET", url, true);

		xhr.onload = function() {
			if (this.status == 200 && this.status < 300) {
				var responseJSON = JSON.parse(xhr.response);
				that.setWeatherDetails(responseJSON);
				resolve(responseJSON);
			} else {
				reject({
					status: this.status,
					statusText: xhr.statusText
				});
			}
		};

		xhr.send();
	});
};

Weather.prototype.getWeatherByZip = function(my_zip) {
	if (my_zip) {
		var url = this.apiUrl + '&zip=' + my_zip;
		var that = this;

		return new Promise(function(resolve, reject) {
			var xhr = new XMLHttpRequest();

			xhr.open("GET", url, true);

			xhr.onload = function() {
				if (this.status == 200 && this.status < 300) {
					var responseJSON = JSON.parse(xhr.response);
					that.setWeatherDetails(responseJSON);
					resolve(responseJSON);
				} else {
					reject({
						status: this.status,
						statusText: xhr.statusText
					});
				}
			};

			xhr.send();
		});
	} else {
		return new Promise(function(resolve, reject) {
			resolve({'message':'no zip provided'});
		});
	}
};
