///<reference path="typings/jquery/jquery.d.ts" />
///<reference path="typings/googlemaps/google.maps.d.ts" />

module YEmergency {
    export function showPosition(position) {
        var mapOptions = {
            center: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
            zoom: 13,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
    }
}

$(()=>{
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(YEmergency.showPosition);
    } else{
        document.getElementById("map_canvas").textContent = "Geolocation is not supported by this browser.";
    }
});
