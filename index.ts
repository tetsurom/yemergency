///<reference path="typings/jquery/jquery.d.ts" />
///<reference path="typings/googlemaps/google.maps.d.ts" />

interface Geometry {
    type: string;
    coordinates: number[];
}

interface GeoJSON {
    type: string;
    properties: any/*FIXME*/;
    geometry: Geometry;
}

module YEmergency {

    export class MarkerDB {
        db: {[index: string]: google.maps.Marker[]};

        constructor() {
            this.db = {};
        }

        insertMarker(key: string, marker: google.maps.Marker): void {
            if(!this.db[key]) {
                this.db[key] = [];
            }
            this.db[key].push(marker);
        }

        getMarkers(key: string): google.maps.Marker[] {
            return this.db[key];
        }

        deleteMarkers(key: string): void {
            var markers = this.db[key];
            if(markers) {
                for(var i = 0; i < markers.length; i++) {
                    markers[i].setMap(null);
                }
            }
            this.db[key] = [];
        }
    }

    export function createMarker(map, latLang, text): google.maps.Marker {
        return new google.maps.Marker({
            position: latLang,
            map: map,
            title: text
        });
    }

    export class DataLoader {
        constructor() {
        }

        static load(key: string, callback: (result: any) => void): void {
            $.ajax({
                type: "GET",
                url: "data/" + key +".geojson",
                dataType: "json",
                success: (response: any) => {
                callback(response);
            },
            error: (req: XMLHttpRequest, status: string, errorThrown: any) => {
                       console.log("========== Ajax Error ==========");
                       console.log(status);
                       console.log(req);
                       console.log(errorThrown);
                       console.log("================================");
                   }
            });
        }

        static createMarkersFrom(map: google.maps.Map): (res: any) => void {
            return (res: any) => {
                var geojsons: GeoJSON[] = res.features;
                for(var i = 0; i < geojsons.length; i++) {
                    var lat = new google.maps.LatLng(geojsons[i].geometry.coordinates[1], geojsons[i].geometry.coordinates[0]);
                    console.log(lat);
                    YEmergency.createMarker(map, lat, geojsons[i].properties.ITEM003);
                }
            };
        }
    }
}

var Debug: any = {};
$(() => {
    var markerDB = new YEmergency.MarkerDB();
    Debug.markerDB = markerDB;
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
        YEmergency.DataLoader.load("evacuation_site", YEmergency.DataLoader.createMarkersFrom(map));
    };


    showPosition({coords: {latitude: 35.4739812, longitude: 139.5897151}});
    //FIXME Enable this finally
    //if (navigator.geolocation) {
    //    navigator.geolocation.getCurrentPosition(showPosition);
    //} else{
    //    document.getElementById("map_canvas").textContent = "Geolocation is not supported by this browser.";
    //}
});
