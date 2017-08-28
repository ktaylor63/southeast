"use strict";

// Contains setup and events for Leaflet interactive map and layers

pdcApp.leaflet = {};

pdcApp.leaflet.view = {
    latlon: [31, -92],
    zoom: 7
};

pdcApp.leaflet.layers = {};
pdcApp.leaflet.selectedAOI = [];

pdcApp.leaflet.basemaps = [
    { name: "Streets", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}" },
    { name: "Satellite", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" },
    { name: "Topographic", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}" }
];

pdcApp.leaflet.initialBasemap = 0;

pdcApp.map = L.map("map").setView(pdcApp.leaflet.view.latlon, pdcApp.leaflet.view.zoom);

// Add first basemap
pdcApp.leaflet.basemap = L.tileLayer(pdcApp.leaflet.basemaps[pdcApp.leaflet.initialBasemap].url, {
    maxZoom: 18,
    minZoom: 6,
    id: "basemap"
}).addTo(pdcApp.map);

$("#pdcMapHome").on("click", function () {
    pdcApp.map.setView(pdcApp.leaflet.view.latlon, pdcApp.leaflet.view.zoom);
});

pdcApp.leaflet.findLayerGivenAOI = function (aoiID) {
    var aoiLayers = pdcApp.leaflet.layers.aoi._layers;
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

pdcApp.getAOI = function (api) {
    pdcApp.leaflet.removeLayersExceptBasemap();

    $.ajax({
        url: pdcApp.url + "GetAOIGeoJSON?ParishList=" + pdcApp.model.parishes.toString(),
        success: function (json) {
            if (json) {
                pdcApp.aoiJSON = JSON.parse(json);

                pdcApp.leaflet.layers.aoi = L.geoJSON(pdcApp.aoiJSON, {
                    style: function (feature) {
                        return { color: feature.properties.color, fillOpacity: 0.2 };
                    },
                    onEachFeature: pdcApp.leaflet.onEachAOIFeature
                });

                pdcApp.leaflet.layers.aoi.addTo(pdcApp.map);

                // Flag to tell UI to capture and send AOIs to API
                pdcApp.sendBackAOI = true;

                // Wait until we have AOI to show map
                pdcApp.ui.prepareQuestionForm(api);

                // "Redraw" map since it may have been hidden
                pdcApp.map.invalidateSize();

                if (pdcApp.leaflet.layers.parishes) {
                    // Thinner border with no fill color
                    pdcApp.leaflet.layers.parishes.setStyle({
                        weight: 1,
                        fillOpacity: 0
                    });

                    pdcApp.leaflet.layers.parishes.addTo(pdcApp.map);

                    // Fit map extent to that of the selected parishes
                    pdcApp.map.fitBounds(pdcApp.leaflet.layers.parishes.getBounds(), {
                        padding: [20, 20]
                    });

                    pdcApp.leaflet.layers.aoi.bringToFront();
                }
                else {
                    // Fit map extent to that of the AOI layer
                    pdcApp.map.fitBounds(pdcApp.leaflet.layers.aoi.getBounds(), {
                        padding: [50, 50]
                    });
                }

                // Create AOI checkboxes
                pdcApp.aois();

                pdcApp.ui.hideWaiting();
            }
            else {
                // No AOIs were returned, so return a "NO" response to API for this question
                pdcApp.ui.hideWaiting();

                pdcApp.api.getQuestion({
                    question: 7,
                    answer: "N"
                });
            }
        }
    });
};

// Removes all layers except basemap from Leaflet map
pdcApp.leaflet.removeLayersExceptBasemap = function () {
    pdcApp.map.eachLayer(function (layer) {
        if (!layer.options.id || layer.options.id !== "basemap") {
            pdcApp.map.removeLayer(layer);
        }
    });
}

//  Displays basic map for certain species questions.
pdcApp.showMapForSpecies = function (questionID) {
    $("#mapQuestion").addClass("visible");

    pdcApp.leaflet.removeLayersExceptBasemap();

    if (questionID === 700) {
        // Manatee consultation zone
        $.ajax({
            url: pdcApp.url + "GetManateeGeoJSON",
            success: function (json) {
                if (json) {
                    pdcApp.leaflet.layers.manatee = L.geoJSON(JSON.parse(json), {
                        style: function (feature) {
                            return { color: feature.properties.color };
                        }
                    });

                    pdcApp.leaflet.layers.manatee.addTo(pdcApp.map);

                    // "Redraw" map since it may have been hidden
                    pdcApp.map.invalidateSize();

                    // Fit map extent to that of manatee consultation zone
                    pdcApp.map.fitBounds(pdcApp.leaflet.layers.manatee.getBounds(), {
                        padding: [50, 50]
                    });
                }
            }
        });
    }
    else if (questionID === 1302) {
        // Piping plover consultation zone
        $.ajax({
            url: pdcApp.url + "GetPipingPloverGeoJSON",
            success: function (json) {
                if (json) {
                    pdcApp.leaflet.layers.plover = L.geoJSON(JSON.parse(json), {
                        style: function (feature) {
                            return { color: feature.properties.color };
                        }
                    });

                    pdcApp.leaflet.layers.plover.addTo(pdcApp.map);

                    // "Redraw" map since it may have been hidden
                    pdcApp.map.invalidateSize();

                    // Fit map extent to that of piping plover consultation zone
                    pdcApp.map.fitBounds(pdcApp.leaflet.layers.plover.getBounds(), {
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

pdcApp.leaflet.onEachAOIFeature = function (feature, layer) {
    layer.on({
        click: pdcApp.leaflet.toggleAOI
    });
};

$(document).on("change", ".aoi-chk", function () {
    // preview aoi layer to try and change style of checked AOI
    var chkValue = this.id.replace("aoi", "");
    var layer = pdcApp.leaflet.findLayerGivenAOI(chkValue);

    if (layer) {
        var opacity = layer.options.fillOpacity;

        pdcApp.leaflet.toggleLayerOpacity(layer, chkValue, opacity);
        layer.bringToFront();
    }

    if (pdcApp.leaflet.selectedAOI.indexOf(chkValue) !== -1) {
        // remove it
        pdcApp.leaflet.selectedAOI.splice(pdcApp.leaflet.selectedAOI.indexOf(chkValue));
    }
    else {
        // add it
        pdcApp.leaflet.selectedAOI.push(chkValue);
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
        pdcApp.ui.enableNextButton();
    }
    else {
        pdcApp.ui.disableNextButton();
    }
});

$(document).on("change", "#noAOI", function () {
    var chks = document.getElementsByClassName("aoi-chk");
    var aoiLayers = pdcApp.leaflet.layers.aoi;
    var keys = Object.keys(aoiLayers._layers);

    for (var i = 0; i < chks.length; i++) {
        if (chks[i].checked) {
            var id = chks[i].id.replace("aoi", "");

            chks[i].checked = false;

            var layer = pdcApp.leaflet.findLayerGivenAOI(id);

            pdcApp.leaflet.toggleLayerOpacity(layer, id, 0.9);
        }
    }

    if (this.checked) {
        pdcApp.ui.enableNextButton();
    }
    else {
        pdcApp.ui.disableNextButton();
    }
});

pdcApp.leaflet.toggleAOI = function (e) {
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
                pdcApp.ui.enableNextButton();
            }
        }
    }
    console.log(6);

    pdcApp.leaflet.toggleLayerOpacity(layer, id, e.target.options.fillOpacity);

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
        pdcApp.ui.disableNextButton();
    }
};

pdcApp.leaflet.toggleLayerOpacity = function (layer, id, currentOpacity) {
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
};

pdcApp.getParishGeoJSON = function () {
    var theMap;
    var params = pdcApp.model.parishes.toString();

    $.ajax({
        url: pdcApp.url + "GetParishGeoJSON?ParishList=" + params,
        success: function (json) {
            if (json) {
                pdcApp.leaflet.layers.parishes = L.geoJSON(JSON.parse(json), {
                    style: function (feature) {
                        return { color: feature.properties.color };
                    }
                });
            }
        }
    });
};

pdcApp.aois = function () {
    var html = "";
    var aoiLen = pdcApp.aoiJSON.length;

    for (var i = 0; i < aoiLen; i++) {
        var aoi = pdcApp.aoiJSON[i].properties;

        var chk = "<div class='aoi-color' style='border:3px solid " + aoi.color + "'></div><input class='aoi-chk' id='aoi" + aoi.ID + "' type='checkbox' />" +
            "<label for='aoi" + aoi.ID + "'>" + aoi.aoi + "</label>";

        html += "<div class='item'>" + chk + "</div>";
    }

    html += "<div class='item'><label><input id='noAOI' type='checkbox' /> Project does NOT occur within an area of interest</label></div>";

    // Put AOI choices in a DIV very close to Yes/No radio buttons
    document.getElementById("aois").innerHTML = "<div>" + html + "</div>";
};

pdcApp.leaflet.makeBasemaps = function (startIndex) {
    var html = "";

    for (var i = 0; i < pdcApp.leaflet.basemaps.length; i++) {
        var b = pdcApp.leaflet.basemaps[i];
        html += "<div><label><input id='basemap" + i + "' class='basemap-option' type='radio' name='b' " + (i === startIndex ? "checked " : "") + "/> " + b.name + "</label></div>";
    }

    document.getElementById("basemaps").innerHTML = "<div class='title'>Basemaps</div>" + html;
};

// When basemap option is changed
$(document).on("change", ".basemap-option", function () {
    pdcApp.map.removeLayer(pdcApp.leaflet.basemap);

    var basemapIndex = this.id.replace("basemap", "");

    // Add basemap
    pdcApp.leaflet.basemap = L.tileLayer(pdcApp.leaflet.basemaps[basemapIndex].url, {
        maxZoom: 18,
        minZoom: 6,
        id: "basemap"
    }).addTo(pdcApp.map);
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
        var result = pdcApp.coords.convertFromDec(
            document.getElementById("mapDecLat").value,
            document.getElementById("mapDecLon").value
        );

        if (result.success) {
            pdcApp.map.setView([result.lat, result.lon], 14);

            // Save coordinates and use them to populate report
            pdcApp.coords.saveDec(result.lat, result.lon);
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

        var result = pdcApp.coords.convertFromDMS(latDeg, latMin, latSec, latNS, lonDeg, lonMin, lonSec, lonWE);

        if (result.success) {
            pdcApp.map.setView([result.lat, result.lon], 14);

            // Save coordinates and use them to populate report
            pdcApp.coords.saveDMS(latDeg, latMin, latSec, latNS, lonDeg, lonMin, lonSec, lonWE);
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

        var result = pdcApp.coords.convertFromUTM(x, y, zone);

        if (result.success) {
            pdcApp.map.setView([result.lat, result.lon], 14);

            // Save coordinates and use them to populate report
            pdcApp.coords.saveUTM(x, y, zone);
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

        var result = pdcApp.coords.convertFromStatePlane(x, y, zone);

        if (result.success) {
            pdcApp.map.setView([result.lat, result.lon], 14);

            // Save coordinates and use them to populate report
            pdcApp.coords.saveStatePlane(x, y, zone);
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
pdcApp.leaflet.makeBasemaps(pdcApp.leaflet.initialBasemap);
