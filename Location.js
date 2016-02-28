function Location() {
	var _position = null;

	this.setPosition = function(my_position) {
		_position = my_position;
	};
}

Location.prototype.getLocation = function() {
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