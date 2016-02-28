function Weather() {
	var _zip = null;
	var _position = {};
	var _url = 'http://api.openweathermap.org/data/2.5/weather?appid=44db6a862fba0b067b1930da0d769e98';

	this.setPosition = function(my_position) {

		_position = my_position;
		console.log(_position);
	};

	this.getWeather = function(my_position) {
		if (my_position)
			_position = this.setPosition(my_position);

		var url = _url + '&lat=' + _position.latitude + '&lon=' + _position.longitude;
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (xhttp.readyState == 4 && xhttp.status == 200) {
				return xhttp.responseText;
			}
		};

		xhttp.open("GET", url, true);
		xhttp.send();
	};
}
