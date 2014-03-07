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

        static createMarkersAjaxResponse(key: string, map: google.maps.Map, markerDB: YEmergency.MarkerDB): (res: any) => void {
            return (res: any) => {
                var geojsons: GeoJSON[] = res.features;
                for(var i = 0; i < geojsons.length; i++) {
                    var lat = new google.maps.LatLng(geojsons[i].geometry.coordinates[1], geojsons[i].geometry.coordinates[0]);
                    var marker = YEmergency.createMarker(map, lat, geojsons[i].properties.NAME/*FIXME*/);
                    markerDB.insertMarker(key, marker);
                }
            };
        }
    }
}

class MenuItem {
    private Checked: boolean;
    private Title: string;
    private IconElement: HTMLElement;
    private MenuItemElement: HTMLElement;

    constructor(Title: string, IsChecked: boolean, OnClick: (IsChecked: boolean)=>void){
        this.Title = Title;
        this.Checked = IsChecked;
        this.Render();
        this.MenuItemElement.addEventListener("click", ()=>{
            this.SetIsChecked(!this.Checked);
            OnClick(this.Checked);
        });

        //For first time
        if(this.Checked) {
            OnClick(this.Checked);
        }
    }

    private SetIsChecked(Flag: boolean){
        this.Checked = Flag;
        this.IconElement.className = "glyphicon glyphicon-" + (this.Checked ? "check" : "unchecked");
    }

    private Render(): void {
        var spaceChar = "\u00a0";
        var li = document.createElement("li");
        var a = document.createElement("a");
        var span = document.createElement("span");
        var text = document.createTextNode(spaceChar + this.Title);
        a.href = "#";
        a.appendChild(span);
        a.appendChild(text);
        li.appendChild(a);
        this.IconElement = span;
        this.MenuItemElement = li;
        this.SetIsChecked(this.Checked);
    }

    GetElement(){
        return this.MenuItemElement;
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
    };


    showPosition({coords: {latitude: 35.4739812, longitude: 139.5897151}});
    //FIXME Enable this finally
    //if (navigator.geolocation) {
    //    navigator.geolocation.getCurrentPosition(showPosition);
    //} else{
    //    document.getElementById("map_canvas").textContent = "Geolocation is not supported by this browser.";
    //}

    // Generate menu.

    var changeMarkers = (key: string, IsChecked: boolean) => {
        if(IsChecked) {
            YEmergency.DataLoader.load(key, YEmergency.DataLoader.createMarkersAjaxResponse(key, map, markerDB));
        } else {
            markerDB.deleteMarkers(key);
        }
    };

    var Layers = [
        new MenuItem("震災時の避難場所", true, (IsChecked: boolean)=>{
            changeMarkers("evacuation_site", IsChecked);
        }),
        new MenuItem("AED設置場所", false, (IsChecked: boolean)=>{
            changeMarkers("aed", IsChecked);
        }),
        new MenuItem("風水害時の避難場所", false, (IsChecked: boolean)=>{
            changeMarkers("flood", IsChecked);
        })
    ];

    var menu = $(".layer-list");

    for(var i = 0; i < Layers.length; i++){
        menu.append(Layers[i].GetElement());
    }

    $(".menu-about").on("click", ()=>{
        (<any>$("#about-modal")).modal();
    });

    (<any>$(".dropdown-toggle")).dropdown();
});
