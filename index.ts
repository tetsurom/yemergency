///<reference path="typings/jquery/jquery.d.ts" />
///<reference path="typings/googlemaps/google.maps.d.ts" />

interface Geometry {
    type: string;
    coordinates: any[]/*FIXME*/;
}

interface GeoJSON {
    type: string;
    properties: any/*FIXME*/;
    geometry: Geometry;
}

module YEmergency {

    export class PolygonDB {
        db: {[index: string]: google.maps.Polygon[]};

        constructor() {
            this.db = {};
        }

        insert(key: string, polygon: google.maps.Polygon): void {
            if(!this.db[key]) {
                this.db[key] = [];
            }
            this.db[key].push(polygon);
        }

        deletePolygons(key: string): void {
            var polygons = this.db[key];
            if(polygons) {
                for(var i = 0; i < polygons.length; i++) {
                    polygons[i].setMap(null);
                }
            }
            this.db[key] = [];
        }
    }

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

    export function createIconURLFromChartAPI(color, typography): string {
        return 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld='+typography+'|'+color+'|000000';
    }

    export function createPolygon(map, latLangs, strokeColor, fillColor): google.maps.Polygon {
        var polygon =  new google.maps.Polygon({
            paths: latLangs,
            map: map,
            strokeColor: strokeColor,
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: fillColor,
            fillOpacity: 0.35
        });
        return polygon;
    }

    export function convertCoords2Path(coords: number[][]): google.maps.LatLng[] {
        var lngs = [];
        for(var i = 0; i< coords.length; i++) {
            lngs.push(new google.maps.LatLng(coords[i][1], coords[i][0]));
        }
        return lngs;
    }

    export function createMarker(map, latLang, text, url, type): google.maps.Marker {
        var marker =  new google.maps.Marker({
            position: latLang,
            map: map,
            title: text,
            icon: url, 
        });

        google.maps.event.addListener( marker, 'click', function() {
                var infowindow = new google.maps.InfoWindow();
                if(text != "") {
                    var div = document.createElement('div');
                    var span1 = document.createElement('span');
                    span1.textContent = type;
                    var span2 = document.createElement('span');
                    span2.textContent = text;
                    var br = document.createElement('br');
                    div.appendChild(span1);
                    div.appendChild(br);
                    div.appendChild(span2);
                    infowindow.setContent(div);
                } else {
                    infowindow.setContent(type);
                }
                infowindow.open(map, marker);
        });
        return marker;
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

        static createMarkersAjaxResponse(key: string, map: google.maps.Map, markerDB: YEmergency.MarkerDB, url: string, type: string): (res: any) => void {
            return (res: any) => {
                var geojsons: GeoJSON[] = res.features;
                for(var i = 0; i < geojsons.length; i++) {
                    var lat = new google.maps.LatLng(geojsons[i].geometry.coordinates[1], geojsons[i].geometry.coordinates[0]);
                    var marker = YEmergency.createMarker(map, lat, geojsons[i].properties.NAME/*FIXME*/, url, type);
                    markerDB.insertMarker(key, marker);
                }
            };
        }

        static createPolygonsAjaxResponse(key: string, map: google.maps.Map, polygonDB: YEmergency.PolygonDB): (res: any) => void {
            return (res: any) => {
                var geojsons: GeoJSON[] = res.features;
                for(var i = 0; i < geojsons.length; i++) {
                    var lats = YEmergency.convertCoords2Path(geojsons[i].geometry.coordinates[0]);
                    var polygon = YEmergency.createPolygon(map, lats, "00ffff", "00ffff");
                    polygonDB.insert(key, polygon);
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
    var polygonDB = new YEmergency.PolygonDB();
    var map: google.maps.Map;

    Debug.markerDB = markerDB;
    Debug.polygonDB = polygonDB;

    var showPosition = (position) => {
        var MyPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        var mapOptions = {
            center: MyPosition,
            zoom: 14,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

        var url = YEmergency.createIconURLFromChartAPI("FF99FF", "現");
        markerDB.insertMarker("MyPosition", YEmergency.createMarker(map, MyPosition, "", url, "あなたの現在地"));

    };


    showPosition({coords: {latitude: 35.2107028, longitude: 139.6853169}});
    //showPosition({coords: {latitude: 35.4739812, longitude: 139.5897151}});
    //FIXME Enable this finally
    //if (navigator.geolocation) {
    //    navigator.geolocation.getCurrentPosition(showPosition);
    //} else{
    //    document.getElementById("map_canvas").textContent = "Geolocation is not supported by this browser.";
    //}

    // Generate menu.

    var changeMarkers = (key: string, url: string, type: string, IsChecked: boolean) => {
        if(IsChecked) {
            YEmergency.DataLoader.load(key, YEmergency.DataLoader.createMarkersAjaxResponse(key, map, markerDB, url, type));
        } else {
            markerDB.deleteMarkers(key);
        }
    };

    var Layers = [
        new MenuItem("震災時の避難場所", true, (IsChecked: boolean)=>{
            var url = YEmergency.createIconURLFromChartAPI("00ff00", "避");
            changeMarkers("evacuation_site",  url, "震災時の避難場所",IsChecked);
        }),
        new MenuItem("風水害時の避難場所", false, (IsChecked: boolean)=>{
            var url = YEmergency.createIconURLFromChartAPI("99FFFF", "避");
            changeMarkers("flood", url, "風水害時の避難場所", IsChecked);
        }),
        new MenuItem("津波ハザードマップ", false, (IsChecked: boolean)=>{
            var tsunami = ["a1r3", "a2r2", "a3r2"];
            if(IsChecked) {
                for(var i = 0; i < tsunami.length; i++) {
                    YEmergency.DataLoader.load(tsunami[i], YEmergency.DataLoader.createPolygonsAjaxResponse(tsunami[i], map, polygonDB));
                }
            } else {
                for(var i = 0; i < tsunami.length; i++) {
                    polygonDB.deletePolygons(tsunami[i]);
                }
            }
        }),
        new MenuItem("AED設置場所", false, (IsChecked: boolean)=>{
            var url = "image/AED.png";//YEmergency.createIconURLFromChartAPI("FFCCAA", "A");
            changeMarkers("aed", url, "AED設置場所", IsChecked);
        }),
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
