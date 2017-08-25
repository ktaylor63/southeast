"use strict";

// Contains setup and events for Leaflet interactive map and layers

app.leaflet = {};

app.leaflet.view = {
    latlon: [31, -92],
    zoom: 7
};

app.leaflet.layers = {};
app.leaflet.selectedAOI = [];

app.leaflet.basemaps = [
    { name: "Streets", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}" },
    { name: "Satellite", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" },
    { name: "Topographic", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}" }
];

app.leaflet.initialBasemap = 0;

app.map = L.map("map").setView(app.leaflet.view.latlon, app.leaflet.view.zoom);

// Add first basemap
app.leaflet.basemap = L.tileLayer(app.leaflet.basemaps[app.leaflet.initialBasemap].url, {
    maxZoom: 18,
    minZoom: 6,
    id: "basemap"
}).addTo(app.map);

$("#pdcMapHome").on("click", function () {
    app.map.setView(app.leaflet.view.latlon, app.leaflet.view.zoom);
});

app.leaflet.findLayerGivenAOI = function (aoiID) {
    var aoiLayers = app.leaflet.layers.aoi._layers;
    var keys = Object.keys(aoiLayers);

    var keyLen = keys.length;

    for (var i = 0; i < keyLen; i++) {
        var layer = aoiLayers[keys[i]];

        if (layer.feature.properties.ID === aoiID) {
            return layer;
        }
    }

    return null;
};

app.getAOI = function (api) {
    app.leaflet.removeLayersExceptBasemap();

    $.ajax({
        url: app.url + "GetAOIGeoJSON?ParishList=" + app.model.parishes.toString(),
        success: function (json) {
            if (json) {
                app.aoiJSON = JSON.parse(json);

                app.leaflet.layers.aoi = L.geoJSON(app.aoiJSON, {
                    style: function (feature) {
                        return { color: feature.properties.color, fillOpacity: 0.2 };
                    },
                    onEachFeature: onEachAOIFeature
                });

                app.leaflet.layers.aoi.addTo(app.map);

                // Flag to tell UI to capture and send AOIs to API
                app.sendBackAOI = true;

                // Wait until we have AOI to show map
                app.ui.prepareQuestionForm(api);

                // "Redraw" map since it may have been hidden
                app.map.invalidateSize();

                if (app.leaflet.layers.parishes) {
                    // Thinner border with no fill color
                    app.leaflet.layers.parishes.setStyle({
                        weight: 1,
                        fillOpacity: 0
                    });

                    app.leaflet.layers.parishes.addTo(app.map);

                    // Fit map extent to that of the selected parishes
                    app.map.fitBounds(app.leaflet.layers.parishes.getBounds(), {
                        padding: [20, 20]
                    });

                    app.leaflet.layers.aoi.bringToFront();
                }
                else {
                    // Fit map extent to that of the AOI layer
                    app.map.fitBounds(app.leaflet.layers.aoi.getBounds(), {
                        padding: [50, 50]
                    });
                }

                // Create AOI checkboxes
                app.aois();

                app.ui.hideWaiting();
            }
            else {
                // No AOIs were returned, so return a "NO" response to API for this question
                app.ui.hideWaiting();

                app.api.getQuestion({
                    question: 7,
                    answer: "N"
                });
            }
        }
    });
};

// Removes all layers except basemap from Leaflet map
app.leaflet.removeLayersExceptBasemap = function () {
    app.map.eachLayer(function (layer) {
        if (!layer.options.id || layer.options.id !== "basemap") {
            app.map.removeLayer(layer);
        }
    });
}

//  Displays basic map for certain species questions.
app.showMapForSpecies = function (questionID) {
    $("#mapQuestion").addClass("visible");

    app.leaflet.removeLayersExceptBasemap();

    if (questionID === 700) {
        // Manatee consultation zone
        $.ajax({
            url: app.url + "GetManateeGeoJSON",
            success: function (json) {
                if (json) {
                    app.leaflet.layers.manatee = L.geoJSON(JSON.parse(json), {
                        style: function (feature) {
                            return { color: feature.properties.color };
                        }
                    });

                    app.leaflet.layers.manatee.addTo(app.map);

                    // "Redraw" map since it may have been hidden
                    app.map.invalidateSize();

                    // Fit map extent to that of manatee consultation zone
                    app.map.fitBounds(app.leaflet.layers.manatee.getBounds(), {
                        padding: [50, 50]
                    });
                }
            }
        });
    }
    else if (questionID === 1302) {
        // Piping plover consultation zone
        $.ajax({
            url: app.url + "GetPipingPloverGeoJSON",
            success: function (json) {
                if (json) {
                    app.leaflet.layers.plover = L.geoJSON(JSON.parse(json), {
                        style: function (feature) {
                            return { color: feature.properties.color };
                        }
                    });

                    app.leaflet.layers.plover.addTo(app.map);

                    // "Redraw" map since it may have been hidden
                    app.map.invalidateSize();

                    // Fit map extent to that of piping plover consultation zone
                    app.map.fitBounds(app.leaflet.layers.plover.getBounds(), {
                        padding: [50, 50]
                    });
                }
            }
        });
    }
    else {
        console.log("ERROR: unsupported species ID within showMapForSpecies()");
    }
};

function onEachAOIFeature(feature, layer) {
    layer.on({
        click: toggleAOI
    });
}

$(document).on("change", ".aoi-chk", function () {
    // preview aoi layer to try and change style of checked AOI
    var chkValue = this.id.replace("aoi", "");
    var layer = app.leaflet.findLayerGivenAOI(chkValue);

    if (layer) {
        var opacity = layer.options.fillOpacity;

        toggleLayerOpacity(layer, chkValue, opacity);
        layer.bringToFront();
    }

    if (app.leaflet.selectedAOI.indexOf(chkValue) !== -1) {
        // remove it
        app.leaflet.selectedAOI.splice(app.leaflet.selectedAOI.indexOf(chkValue));
    }
    else {
        // add it
        app.leaflet.selectedAOI.push(chkValue);
    }

    // Loop through all AOIs to see which are checked
    var anythingChecked = false;
    var chks = document.getElementsByClassName("aoi-chk");

    for (var i = 0; i < chks.length; i++) {
        if (chks[i].checked) {
            anythingChecked = true;
        }
    }

    if (anythingChecked) {
        document.getElementById("noAOI").checked = false;
        app.ui.enableNextButton();
    }
    else {
        app.ui.disableNextButton();
    }
});

$(document).on("change", "#noAOI", function () {
    var chks = document.getElementsByClassName("aoi-chk");
    var aoiLayers = app.leaflet.layers.aoi;
    var keys = Object.keys(aoiLayers._layers);

    for (var i = 0; i < chks.length; i++) {
        if (chks[i].checked) {
            var id = chks[i].id.replace("aoi", "");

            chks[i].checked = false;

            var layer = app.leaflet.findLayerGivenAOI(id);

            toggleLayerOpacity(layer, id, 0.9);
        }
    }

    if (this.checked) {
        app.ui.enableNextButton();
    }
    else {
        app.ui.disableNextButton();
    }
});

function toggleAOI(e) {
    console.log(e);
    console.log(1);
    var layer = e.target;

    // Toggle checkbox
    var id = e.target.feature.properties.ID;

    if (id) {
        console.log(2);
        var chk = document.getElementById("aoi" + id);
        if (chk) {
            console.log(3);
            if (chk.checked) {
                document.getElementById("aoi" + id).checked = false;
                console.log(4);
            }
            else {
                console.log(5);
                document.getElementById("aoi" + id).checked = true;

                document.getElementById("noAOI").checked = false;
                app.ui.enableNextButton();
            }
        }
    }
    console.log(6);

    //toggleLayerColor(layer, id, e.target.options.color);
    toggleLayerOpacity(layer, id, e.target.options.fillOpacity);

    layer.bringToFront();

    // Loop through all AOIs to see which are checked
    var anythingChecked = false;
    var chks = document.getElementsByClassName("aoi-chk");

    for (var i = 0; i < chks.length; i++) {
        if (chks[i].checked) {
            anythingChecked = true;
        }
    }

    if (!anythingChecked) {
        app.ui.disableNextButton();
    }
}

function toggleLayerOpacity(layer, id, currentOpacity) {
    var selectedOpacity = 0.9;

    // decide how to style polygon
    if (currentOpacity === selectedOpacity) {
        layer.setStyle({
            weight: 2,
            dashArray: "1",
            fillOpacity: 0.2
        });
    }
    else {
        layer.setStyle({
            weight: 2,
            dashArray: "1",
            fillOpacity: 0.9
        });
    }
}

app.getParishGeoJSON = function () {
    var theMap;
    var params = app.model.parishes.toString();

    $.ajax({
        url: app.url + "GetParishGeoJSON?ParishList=" + params,
        success: function (json) {
            if (json) {
                app.leaflet.layers.parishes = L.geoJSON(JSON.parse(json), {
                    style: function (feature) {
                        return { color: feature.properties.color };
                    }
                });
            }
        }
    });
};

app.aois = function () {
    var html = "";
    var aoiLen = app.aoiJSON.length;

    for (var i = 0; i < aoiLen; i++) {
        var aoi = app.aoiJSON[i].properties;

        var chk = "<div class='aoi-color' style='border:3px solid " + aoi.color + "'></div><input class='aoi-chk' id='aoi" + aoi.ID + "' type='checkbox' />" +
            "<label for='aoi" + aoi.ID + "'>" + aoi.aoi + "</label>";

        html += "<div class='item'>" + chk + "</div>";
    }

    html += "<div class='item'><label><input id='noAOI' type='checkbox' /> Project does NOT occur within an area of interest</label></div>";

    // Put AOI choices in a DIV very close to Yes/No radio buttons
    document.getElementById("aois").innerHTML = "<div>" + html + "</div>";
};

app.leaflet.makeBasemaps = function (startIndex) {
    var html = "";

    for (var i = 0; i < app.leaflet.basemaps.length; i++) {
        var b = app.leaflet.basemaps[i];
        html += "<div><label><input id='basemap" + i + "' class='basemap-option' type='radio' name='b' " + (i === startIndex ? "checked " : "") + "/> " + b.name + "</label></div>";
    }

    document.getElementById("basemaps").innerHTML = "<div class='title'>Basemaps</div>" + html;
};

// When basemap option is changed
$(document).on("change", ".basemap-option", function () {
    app.map.removeLayer(app.leaflet.basemap);

    var basemapIndex = this.id.replace("basemap", "");

    // Add basemap
    app.leaflet.basemap = L.tileLayer(app.leaflet.basemaps[basemapIndex].url, {
        maxZoom: 18,
        minZoom: 6,
        id: "basemap"
    }).addTo(app.map);
});

// Zoom into downtown Baton Rouge to display sample coordinates for each system to the user.
$("#example").on("click", function () {
    var ddl = document.getElementById("mapSystem");
    var value = ddl.options[ddl.selectedIndex].value;

    if (value === "mapDec") {
        document.getElementById("mapDecLat").value = 30.44;
        document.getElementById("mapDecLon").value = -91.18;
    }
    else if (value === "mapDms") {
        document.getElementById("mapLatDeg").value = 30;
        document.getElementById("mapLatMin").value = 26;
        document.getElementById("mapLatSec").value = 24;
        document.getElementById("mapLatNS").selectedIndex = 0;
        document.getElementById("mapLonDeg").value = 91;
        document.getElementById("mapLonMin").value = 10;
        document.getElementById("mapLonSec").value = 48;
        document.getElementById("mapLonWE").selectedIndex = 0;
    }
    else if (value === "mapUtm") {
        document.getElementById("mapUtmX").value = 674770;
        document.getElementById("mapUtmY").value = 3368950;
        document.getElementById("mapUtmZ").selectedIndex = 0;
    }
    else if (value === "mapPlane") {
        document.getElementById("mapPlaneX").value = 3329154;
        document.getElementById("mapPlaneY").value = 705542;
        document.getElementById("mapPlaneZone").selectedIndex = 1;
    }
    else {
        console.log("ERROR: invalid coordinate system " + value);
    }

    $("#zoomToPoint").click();
});

$("#zoomToPoint").on("click", function () {
    var ddl = document.getElementById("mapSystem");
    var value = ddl.options[ddl.selectedIndex].value;

    if (value === "mapDec") {
        var result = app.coords.convertFromDec(
            document.getElementById("mapDecLat").value,
            document.getElementById("mapDecLon").value
        );

        if (result.success) {
            app.map.setView([result.lat, result.lon], 14);

            // Save coordinates and use them to populate report
            app.coords.saveDec(result.lat, result.lon);
        }
        else {
            alert(result.message);
            document.getElementById("mapDecLat").focus();
        }
    }
    else if (value === "mapDms") {
        var _latDDL = document.getElementById("mapLatNS");
        var _lonDDL = document.getElementById("mapLonWE");

        var latDeg = document.getElementById("mapLatDeg").value;
        var latMin = document.getElementById("mapLatMin").value;
        var latSec = document.getElementById("mapLatSec").value;
        var latNS = _latDDL.options[_latDDL.selectedIndex].value;
        var lonDeg = document.getElementById("mapLonDeg").value;
        var lonMin = document.getElementById("mapLonMin").value;
        var lonSec = document.getElementById("mapLonSec").value;
        var lonWE = _lonDDL.options[_lonDDL.selectedIndex].value;

        var result = app.coords.convertFromDMS(latDeg, latMin, latSec, latNS, lonDeg, lonMin, lonSec, lonWE);

        if (result.success) {
            app.map.setView([result.lat, result.lon], 14);

            // Save coordinates and use them to populate report
            app.coords.saveDMS(latDeg, latMin, latSec, latNS, lonDeg, lonMin, lonSec, lonWE);
        }
        else {
            alert(result.message);
            document.getElementById("mapLonDeg").focus();
        }
    }
    else if (value === "mapUtm") {
        var _zoneDDL = document.getElementById("mapUtmZ");

        var x = document.getElementById("mapUtmX").value;
        var y = document.getElementById("mapUtmY").value;
        var zone = _zoneDDL.options[_zoneDDL.selectedIndex].value;

        var result = app.coords.convertFromUTM(x, y, zone);

        if (result.success) {
            app.map.setView([result.lat, result.lon], 14);

            // Save coordinates and use them to populate report
            app.coords.saveUTM(x, y, zone);
        }
        else {
            alert(result.message);
        }
    }
    else if (value === "mapPlane") {
        var _ddlZone = document.getElementById("mapPlaneZone");

        var x = document.getElementById("mapPlaneX").value;
        var y = document.getElementById("mapPlaneY").value;
        var zone = _ddlZone.options[_ddlZone.selectedIndex].value;

        var result = app.coords.convertFromStatePlane(x, y, zone);

        if (result.success) {
            app.map.setView([result.lat, result.lon], 14);

            // Save coordinates and use them to populate report
            app.coords.saveStatePlane(x, y, zone);
        }
        else {
            alert(result.message);
        }
    }
    else {
        console.log("ERROR: invalid coordinate system " + value);
    }
});

// Create basemap controller
app.leaflet.makeBasemaps(app.leaflet.initialBasemap);