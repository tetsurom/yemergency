///<reference path="typings/jquery/jquery.d.ts" />
///<reference path="typings/googlemaps/google.maps.d.ts" />

var YEmergency;
(function (YEmergency) {
    function createMarker(map, latLang, text) {
        new google.maps.Marker({
            position: latLang,
            map: map,
            title: text
        });
    }
    YEmergency.createMarker = createMarker;

    function showPosition(position) {
        var MyPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        var mapOptions = {
            center: MyPosition,
            zoom: 13,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
        createMarker(map, MyPosition, "You are here");
    }
    YEmergency.showPosition = showPosition;
})(YEmergency || (YEmergency = {}));

$(function () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(YEmergency.showPosition);
    } else {
        document.getElementById("map_canvas").textContent = "Geolocation is not supported by this browser.";
    }
});
