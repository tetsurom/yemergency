///<reference path="typings/jquery/jquery.d.ts" />
///<reference path="typings/googlemaps/google.maps.d.ts" />

module YEmergency {

    export function createMarker(map, latLang, text) {
        new google.maps.Marker({
            position: latLang,
            map: map,
            title: text
        });
    }

    export function showPosition(position) {
        var MyPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        var mapOptions = {
            center: MyPosition,
            zoom: 13,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
        createMarker(map, MyPosition, "You are here");
    }
}

$(()=>{
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(YEmergency.showPosition);
    } else{
        document.getElementById("map_canvas").textContent = "Geolocation is not supported by this browser.";
    }
});
