///<reference path="typings/jquery/jquery.d.ts" />
///<reference path="typings/googlemaps/google.maps.d.ts" />

interface Geometry {
    type: string;
    coordinates: number[];
}

interface GeoJSON {
    type: string;
    property: any/*FIXME*/;
    geometry: Geometry;
}

module YEmergency {

    export class MarkerDB {
        db: {[index: string]: google.maps.Marker[]};

        constructor() {
            this.db = {};
        }

        insertMarker(key: string, marker: google.maps.Marker): void {
            if(this.db[key]) {
                this.db[key] = [];
            }
            this.db[key].push(marker);
        }

        getMarkers(key: string): google.maps.Marker[] {
            return this.db[key];
        }

        deleteMarkers(key: string): void {
            //TODO
        }
    }

    export function createMarker(map, latLang, text): google.maps.Marker {
        return new google.maps.Marker({
            position: latLang,
            map: map,
            title: text
        });
    }
}

$(()=>{
    var markerDB = new YEmergency.MarkerDB();
    var map: google.maps.Map;

    var showPosition = (position) => {
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
    } else{
        document.getElementById("map_canvas").textContent = "Geolocation is not supported by this browser.";
    }
});
