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
        console.log(position.coords.latitude);
        console.log(position.coords.longitude);
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

    var Layers = [
        new MenuItem("避難場所", true, (IsChecked: boolean)=>{
            console.log("避難場所" + " is clicked");
        }),
        new MenuItem("AED設置場所", false, (IsChecked: boolean)=>{
            console.log("AED設置場所" + " is clicked");
        }),
        new MenuItem("ほげほげ", false, (IsChecked: boolean)=>{
            console.log("ほげほげ" + " is clicked");
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
