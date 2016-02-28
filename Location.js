function Location() {
	var _position = null;

	this.getLocation = function() {
		return new Promise(function(resolve, reject) {
			navigator.geolocation.getCurrentPosition(function(position) {
				resolve(position);
			}, function(error) {
				reject(error);
			});
		});
	};
}