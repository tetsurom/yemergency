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

    function createMarker(map, latLang, text, color, typography, type) {
        var marker = new google.maps.Marker({
            position: latLang,
            map: map,
            title: text,
            icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=' + typography + '|' + color + '|000000'
        });

        google.maps.event.addListener(marker, 'click', function () {
            var infowindow = new google.maps.InfoWindow();
            infowindow.setContent(type + "\n" + text);
            infowindow.open(map, marker);
        });
        return marker;
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

        DataLoader.createMarkersAjaxResponse = function (key, map, markerDB, color, typography, type) {
            return function (res) {
                var geojsons = res.features;
                for (var i = 0; i < geojsons.length; i++) {
                    var lat = new google.maps.LatLng(geojsons[i].geometry.coordinates[1], geojsons[i].geometry.coordinates[0]);
                    var marker = YEmergency.createMarker(map, lat, geojsons[i].properties.NAME, color, typography, type);
                    markerDB.insertMarker(key, marker);
                }
            };
        };
        return DataLoader;
    })();
    YEmergency.DataLoader = DataLoader;
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

        //For first time
        if (this.Checked) {
            OnClick(this.Checked);
        }
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
        var MyPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        var mapOptions = {
            center: MyPosition,
            zoom: 13,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

        markerDB.insertMarker("MyPosition", YEmergency.createMarker(map, MyPosition, "You are here", "FF99FF", "現", "あなたの現在地"));
    };

    showPosition({ coords: { latitude: 35.4739812, longitude: 139.5897151 } });

    //FIXME Enable this finally
    //if (navigator.geolocation) {
    //    navigator.geolocation.getCurrentPosition(showPosition);
    //} else{
    //    document.getElementById("map_canvas").textContent = "Geolocation is not supported by this browser.";
    //}
    // Generate menu.
    var changeMarkers = function (key, color, typography, type, IsChecked) {
        if (IsChecked) {
            YEmergency.DataLoader.load(key, YEmergency.DataLoader.createMarkersAjaxResponse(key, map, markerDB, color, typography, type));
        } else {
            markerDB.deleteMarkers(key);
        }
    };

    var Layers = [
        new MenuItem("震災時の避難場所", true, function (IsChecked) {
            changeMarkers("evacuation_site", "00ff00", "避", "震災時の避難場所", IsChecked);
        }),
        new MenuItem("AED設置場所", false, function (IsChecked) {
            changeMarkers("aed", "FFCCAA", "A", "AED設置場所", IsChecked);
        }),
        new MenuItem("風水害時の避難場所", false, function (IsChecked) {
            changeMarkers("flood", "99FFFF", "避", "風水害時の避難場所", IsChecked);
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
