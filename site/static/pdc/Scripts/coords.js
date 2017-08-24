"use strict";
// Handles conversion and storage of coordinates for maps and reports
app.coords = {
    WGS84: "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs",
    UTM15: "+proj=utm +zone=15 +ellps=GRS80 +datum=NAD83 +units=m +no_defs",
    UTM16: "+proj=utm +zone=16 +ellps=WGS84 +datum=WGS84 +units=m +no_defs",
    NORTH: "+proj=lcc +lat_1=32.66666666666666 +lat_2=31.16666666666667 +lat_0=30.5 +lon_0=-92.5 +x_0=999999.9999898402 +y_0=0 +ellps=GRS80 +datum=NAD83 +to_meter=0.3048006096012192 +no_defs",
    SOUTH: "+proj=lcc +lat_1=30.7 +lat_2=29.3 +lat_0=28.5 +lon_0=-91.33333333333333 +x_0=999999.9999898402 +y_0=0 +ellps=GRS80 +datum=NAD83 +to_meter=0.3048006096012192 +no_defs",
    OFFSHORE: "+proj=lcc +lat_1=27.83333333333333 +lat_2=26.16666666666667 +lat_0=25.5 +lon_0=-91.33333333333333 +x_0=999999.9999898402 +y_0=0 +ellps=GRS80 +datum=NAD83 +to_meter=0.3048006096012192 +no_defs",
    system: {},

    // Validates given lat/lon and returns object containing them on success
    convertFromDec: function (lat, lon) {
        if ((lat && parseFloat(lat) && parseFloat(lat) > -90 && parseFloat(lat) < 90)) {
            if (lon && parseFloat(lon) && parseFloat(lon) > -180 && parseFloat(lon) < 180) {
                return { success: true, lat: lat, lon: lon };
            }
            else {
                return { success: false, message: "Invalid longitude" };
            }
        }
        else {
            return { success: false, message: "Invalid latitude" };
        }
    },

    // Converts given degree/minute/second values for lat and lon to decimal. Returns object containing lat/lon on success.
    convertFromDMS: function (latDeg, latMin, latSec, latNS, lonDeg, lonMin, lonSec, lonWE) {
        if (latDeg || latMin || latSec) {
            var lat = 0;
            var parseDeg = parseFloat(latDeg);

            if (parseDeg && parseDeg < 90) {
                lat += parseDeg;
            }
            var parseMin = parseFloat(latMin);
            if (parseMin) {
                lat += (parseMin / 60.0);
            }

            var parseSec = parseFloat(latSec);
            if (parseSec) {
                lat += (parseSec / 60.0 / 60.0);
            }

            if (latNS === "S") {
                lat *= -1;
            }

            if (lonDeg || lonMin || lonSec) {
                var lon = 0;
                var parseDeg = parseFloat(lonDeg);

                if (parseDeg && parseDeg < 180) {
                    lon += parseDeg;
                }

                var parseMin = parseFloat(lonMin);
                if (parseMin) {
                    lon += (parseMin / 60.0);
                }

                var parseSec = parseFloat(lonSec);
                if (parseSec) {
                    lon += (parseSec / 60.0 / 60.0);
                }

                if (lonWE === "W") {
                    lon *= -1;
                }

                return { success: true, lat: lat, lon: lon };
            }
            else {
                return { success: false, message: "Invalid longitude" };
            }
        }
        else {
            return { success: false, message: "Invalid latitude" };
        }
    },

    // Converts given x (Easting), y (Northing), and zone from UTM to lat/lon using proj4js. Returns lat/lon if successful.
    convertFromUTM: function (x, y, z) {
        if (z && (parseInt(z) === 15 || parseInt(z) === 16)) {

            var projection = this.UTM15;

            if (parseInt(z) === 16) {
                projection = this.UTM16;
            }

            var latlon = proj4(projection, this.WGS84, { x: x, y: y });

            return { success: true, lat: latlon.y, lon: latlon.x };
        }
        else {
            return { success: false, message: "Invalid zone" };
        }
    },

    // Converts given x (Easting), y (Northing), and zone from State Plane to lat/lon using proj4js. Returns lat/lon if successful.
    convertFromStatePlane: function (x, y, z) {
        if (x && parseFloat(x) && y && parseFloat(y)) {

            var projection = this.NORTH;
            if (z === "south") {
                projection = this.SOUTH;
            }
            else if (z === "offshore") {
                projection = this.OFFSHORE;
            }

            var latlon = proj4(projection, this.WGS84, { x: x, y: y });

            return { success: true, lat: latlon.y, lon: latlon.x };
        }
        else {
            return { success: false, message: "Invalid x or y" };
        }
    },

    // Saves decimal lat/lon values in app.coords.system
    saveDec: function (lat, lon) {
        this.system = {
            system: "dec",
            location: {
                lat: lat,
                lon: lon
            }
        };
    },

    // Saves lat/lon degrees/minutes/seconds in app.coords.system
    saveDMS: function (latDeg, latMin, latSec, latNS, lonDeg, lonMin, lonSec, lonWE) {
        this.system = {
            system: "dms",
            location: {
                latDeg: latDeg,
                latMin: latMin,
                latSec: latSec,
                latNS: latNS,
                lonDeg: lonDeg,
                lonMin: lonMin,
                lonSec: lonSec,
                lonWE: lonWE
            }
        };
    },

    // Saves UTM Easting, Northing, and Zone in app.coords.system
    saveUTM: function (x, y, zone) {
        this.system = {
            system: "utm",
            location: {
                utmX: x,
                utmY: y,
                utmZ: zone
            }
        };
    },

    // Saves State Plane Easting, Northing, and Zone in app.coords.system
    saveStatePlane: function (x, y, zone) {
        this.system = {
            system: "plane",
            location: {
                spX: x,
                spY: y,
                spZone: zone
            }
        }
    }
};