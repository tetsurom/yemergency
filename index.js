///<reference path="typings/jquery/jquery.d.ts" />
///<reference path="typings/googlemaps/google.maps.d.ts" />

var YEmergency;
(function (YEmergency) {
    var MarkerDB = (function () {
        function MarkerDB() {
            this.db = {};
        }
        MarkerDB.prototype.insertMarker = function (key, marker) {
            if (this.db[key]) {
                this.db[key] = [];
            }
            this.db[key].push(marker);
        };

        MarkerDB.prototype.getMarkers = function (key) {
            return this.db[key];
        };

        MarkerDB.prototype.deleteMarkers = function (key) {
            //TODO
        };
        return MarkerDB;
    })();
    YEmergency.MarkerDB = MarkerDB;

    function createMarker(map, latLang, text) {
        return new google.maps.Marker({
            position: latLang,
            map: map,
            title: text
        });
    }
    YEmergency.createMarker = createMarker;
})(YEmergency || (YEmergency = {}));

$(function () {
    var markerDB = new YEmergency.MarkerDB();
    var map;

    var showPosition = function (position) {
        var MyPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        var mapOptions = {
            center: MyPosition,
            zoom: 13,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

        markerDB.insertMarker("MyPosition", YEmergency.createMarker(map, MyPosition, "You are here"));
    };

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        document.getElementById("map_canvas").textContent = "Geolocation is not supported by this browser.";
    }
});
