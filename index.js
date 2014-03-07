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
})(YEmergency || (YEmergency = {}));

var MenuItem = (function () {
    function MenuItem(Title, IsChecked, OnClick) {
        var _this = this;
        this.Title = Title;
        this.Checked = IsChecked;
        this.Render();
        this.MenuItemElement.addEventListener("click", function () {
            _this.SetIsChecked(!_this.Checked);
            OnClick(_this.Checked);
        });
    }
    MenuItem.prototype.SetIsChecked = function (Flag) {
        this.Checked = Flag;
        this.IconElement.className = "glyphicon glyphicon-" + (this.Checked ? "check" : "unchecked");
    };

    MenuItem.prototype.Render = function () {
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
    };

    MenuItem.prototype.GetElement = function () {
        return this.MenuItemElement;
    };
    return MenuItem;
})();

var Debug = {};
$(function () {
    var markerDB = new YEmergency.MarkerDB();
    Debug.markerDB = markerDB;
    var map;

    var showPosition = function (position) {
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

    showPosition({ coords: { latitude: 35.4739812, longitude: 139.5897151 } });

    //FIXME Enable this finally
    //if (navigator.geolocation) {
    //    navigator.geolocation.getCurrentPosition(showPosition);
    //} else{
    //    document.getElementById("map_canvas").textContent = "Geolocation is not supported by this browser.";
    //}
    // Generate menu.
    var Layers = [
        new MenuItem("避難場所", true, function (IsChecked) {
            console.log("避難場所" + " is clicked");
        }),
        new MenuItem("AED設置場所", false, function (IsChecked) {
            console.log("AED設置場所" + " is clicked");
        }),
        new MenuItem("ほげほげ", false, function (IsChecked) {
            console.log("ほげほげ" + " is clicked");
        })
    ];

    var menu = $(".layer-list");

    for (var i = 0; i < Layers.length; i++) {
        menu.append(Layers[i].GetElement());
    }

    $(".menu-about").on("click", function () {
        $("#about-modal").modal();
    });

    $(".dropdown-toggle").dropdown();
});
