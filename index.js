///<reference path="typings/jquery/jquery.d.ts" />
///<reference path="typings/googlemaps/google.maps.d.ts" />

var YEmergency;
(function (YEmergency) {
    var MarkerDB = (function () {
        function MarkerDB() {
            this.db = {};
        }
        MarkerDB.prototype.insertMarker = function (key, marker) {
            if (!this.db[key]) {
                this.db[key] = [];
            }
            this.db[key].push(marker);
        };

        MarkerDB.prototype.getMarkers = function (key) {
            return this.db[key];
        };

        MarkerDB.prototype.deleteMarkers = function (key) {
            var markers = this.db[key];
            if (markers) {
                for (var i = 0; i < markers.length; i++) {
                    markers[i].setMap(null);
                }
            }
            this.db[key] = [];
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

    var DataLoader = (function () {
        function DataLoader() {
        }
        DataLoader.load = function (key, callback) {
            $.ajax({
                type: "GET",
                url: "data/" + key + ".geojson",
                dataType: "json",
                success: function (response) {
                    callback(response);
                },
                error: function (req, status, errorThrown) {
                    console.log("========== Ajax Error ==========");
                    console.log(status);
                    console.log(req);
                    console.log(errorThrown);
                    console.log("================================");
                }
            });
        };

        DataLoader.createMarkersFrom = function (map) {
            return function (res) {
                var geojsons = res.features;
                for (var i = 0; i < geojsons.length; i++) {
                    var lat = new google.maps.LatLng(geojsons[i].geometry.coordinates[1], geojsons[i].geometry.coordinates[0]);
                    console.log(lat);
                    YEmergency.createMarker(map, lat, geojsons[i].properties.ITEM003);
                }
            };
        };
        return DataLoader;
    })();
    YEmergency.DataLoader = DataLoader;
})(YEmergency || (YEmergency = {}));

var Debug = {};
$(function () {
    var markerDB = new YEmergency.MarkerDB();
    Debug.markerDB = markerDB;
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
        YEmergency.DataLoader.load("evacuation_site", YEmergency.DataLoader.createMarkersFrom(map));
    };

    showPosition({ coords: { latitude: 35.4739812, longitude: 139.5897151 } });
    //FIXME Enable this finally
    //if (navigator.geolocation) {
    //    navigator.geolocation.getCurrentPosition(showPosition);
    //} else{
    //    document.getElementById("map_canvas").textContent = "Geolocation is not supported by this browser.";
    //}
});
