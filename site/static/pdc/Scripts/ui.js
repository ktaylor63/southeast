/* eslint-disable */
﻿"use strict";


console.log(app);

// Handles UI events (button clicks)

$("#previous").on("click", function () {
    app.model.previous();
});

$("#next").on("click", function () {
    var answer = "";
    var questionNum = document.getElementById("questionNum").value;

    if (parseInt(questionNum) === 7) {
        // For mapper question, user must have selected either "No AOI" or one of the AOI options to advance
        var projectNotInAOI = document.getElementById("noAOI").checked;

        if (projectNotInAOI) {
            answer = "N";
        }
        else {
            var aoi = document.getElementsByClassName("aoi-chk");
            for (var i = 0; i < aoi.length; i++) {
                if (aoi[i].checked) {
                    answer = "Y";
                    break;
                }
            }
        }
    }
    else {
        // Otherwise check which radio button was clicked
        answer = (document.getElementById("radioYes").checked ? "Y" : (document.getElementById("radioNo").checked ? "N" : ""));
    }

    app.model.saveNode({
        question: questionNum,
        answer: answer,
        questionText: document.getElementById("question").innerHTML,
        additionalText: document.getElementById("additionalText").innerHTML
    });

    app.model.next();
});

$("#ok").on("click", function () {
    // Save selected info
    var answer = "Y";
    var questionNum = document.getElementById("questionNum").value;

    app.model.saveNode({
        question: questionNum,
        answer: answer,
        questionText: document.getElementById("question").innerHTML,
        additionalText: document.getElementById("additionalText").innerHTML
    });

    app.model.next();
});

$("#gotoAck").on("click", function () {
    $("#intro").removeClass("visible");
    $("#ack").toggleClass("visible");
});

$("#gotoParishes").on("click", function () {
    app.model.init();
});

// Saves the selected parishes into the model. Then hides parish list and fires next() on the model to advanced to the first question.
$("#saveParishes").on("click", function () {
    var chks = $(".parish");
    app.model.parishes = [];

    var names = "";
    var j = 0;

    for (var i = 0; i < chks.length; i++) {
        if (chks[i].checked) {
            app.model.parishes.push(chks[i].value);
            names += (names ? ", " : "") + chks[i].nextSibling.data.trim();
            j++;
        }
    }

    var parishLabel = "<b>Selected " + (j === 1 ? "Parish" : "Parishes") + ":</b> ";

    document.getElementById("parishName").innerHTML = parishLabel + names;

    $("#parishes").toggleClass("visible");
    $("#textQuestion").toggleClass("visible");

    // Insert zeroth node to represent the first question (parish list)
    app.model.saveNode({
        question: 0
    });

    // Advance to next question in model
    app.model.next();

    // Get parish GeoJSON to use for later (maybe?)
    app.getParishGeoJSON(app.model.parishes.toString());
});

// Ensure at least one parish is selected before Continue button is enabled
$(document).on("change", "#parishList input", function () {
    var checked = false;
    var parishCheckboxes = $("#parishList input");
    var len = parishCheckboxes.length;
    for (var i = 0; i < len; i++) {
        if (parishCheckboxes[i].checked) {
            checked = true;
            document.getElementById("saveParishes").disabled = false;
            break;
        }
    }
    if (!checked) {
        document.getElementById("saveParishes").disabled = true;
    }
});

$("#yesNo input").on("change", function () {
    app.ui.enableNextButton();
});

$("#gotoNoEffectReport").on("click", function () {
    $("#noEffectMap").removeClass("visible");
    $("#noEffectReport").addClass("visible");
});

$(".gotoReport").on("click", function () {
    $("#sendItInReport").removeClass("visible");
    $("#nlaaReport").removeClass("visible");
    $("#noEffectReport").removeClass("visible");
    $("#noaa").removeClass("visible");
    $("#report").addClass("visible");
    document.getElementById("agency").focus();

    // If Other is pre-selected by the browser, display textbox. This corrects a bug when user hits Back button after viewing report.
    var hidFedOrNon = document.getElementById("fedOrNon").value;

    if (hidFedOrNon === "F") {
        showFed();
    }
    else if (hidFedOrNon === "N") {
        showNonFed();
    }
    else {
        document.getElementById("agency").style.display = "none";
        document.getElementById("agencyOther").style.display = "none";
        document.getElementById("labelAgencyOther").style.display = "none";
    }

    // If user entered coordinates, try to prefill form with them
    if (app.coords.system) {
        var coordSys = app.coords.system.system;
        var coordLoc = app.coords.system.location;

        if (coordSys === "dec") {
            document.getElementById("system").selectedIndex = 0;
            document.getElementById("decLat").value = coordLoc.lat;
            document.getElementById("decLon").value = coordLoc.lon;
        }
        else if (coordSys === "dms") {
            document.getElementById("system").selectedIndex = 1;

            document.getElementById("latDeg").value = coordLoc.latDeg;
            document.getElementById("latMin").value = coordLoc.latMin;
            document.getElementById("latSec").value = coordLoc.latSec;

            if (coordLoc.latNS === "N") {
                document.getElementById("latNS").selectedIndex = 0;
            }
            else {
                document.getElementById("latNS").selectedIndex = 1;
            }

            document.getElementById("lonDeg").value = coordLoc.lonDeg;
            document.getElementById("lonMin").value = coordLoc.lonMin;
            document.getElementById("lonSec").value = coordLoc.lonSec;

            if (coordLoc.lonWE === "W") {
                document.getElementById("lonWE").selectedIndex = 0;
            }
            else {
                document.getElementById("lonWE").selectedIndex = 1;
            }
        }
        else if (coordSys === "utm") {
            document.getElementById("system").selectedIndex = 2;
            document.getElementById("utmX").value = coordLoc.utmX;
            document.getElementById("utmY").value = coordLoc.utmY;

            if (coordLoc.utmZ === 15) {
                document.getElementById("utmZ").selectedIndex = 0;
            }
            else {
                document.getElementById("utmZ").selectedIndex = 1;
            }
        }
        else if (coordSys === "plane") {
            document.getElementById("system").selectedIndex = 3;
            document.getElementById("spX").value = coordLoc.spX;
            document.getElementById("spY").value = coordLoc.spY;

            // HACK: refactor to set based on selectedValue??
            if (coordLoc.spZone === "north") { document.getElementById("spZone").selectedIndex = 0; }
            else if (coordLoc.spZone === "south") { document.getElementById("spZone").selectedIndex = 1; }
            else { document.getElementById("spZone").selectedIndex = 2; }
        }

        $("#system").change();
    }
});

// Changes the coordinate system being used
$("#system").on("change", function () {
    var system = this.value;

    $("#dec").removeClass("sysvisible");
    $("#dms").removeClass("sysvisible");
    $("#utm").removeClass("sysvisible");
    $("#plane").removeClass("sysvisible");

    $("#" + system).addClass("sysvisible");

    // Focus on first element of this set
    var coordSystemFocusElements = { "dec": "decLat", "dms": "latDeg", "utm": "utmX", "plane": "spX" };

    document.getElementById(coordSystemFocusElements[system]).focus();
});

$("#mapSystem").on("change", function () {
    var system = this.value;

    $("#mapDec").removeClass("sysvisible");
    $("#mapDms").removeClass("sysvisible");
    $("#mapUtm").removeClass("sysvisible");
    $("#mapPlane").removeClass("sysvisible");

    $("#" + system).addClass("sysvisible");
});

function hideErrorMessages() {
    document.getElementById("errorFedOrNon").innerHTML = "";
    document.getElementById("errorAgency").innerHTML = "";
}

$("#getReport").on("click", function () {
    var reportModel = {};

    var hidFedOrNon = document.getElementById("fedOrNon").value;

    // Validate - require agency name
    hideErrorMessages();

    if (hidFedOrNon !== "F" && hidFedOrNon !== "N") {
        document.getElementById("errorFedOrNon").innerHTML = "Please select your agency type.";
        return false;
    }
    else if (!document.getElementById("agencyOther").value && !document.getElementById("agency").selectedIndex) {
        document.getElementById("errorAgency").innerHTML = "Please specify your agency.";
        return false;
    }

    // For POST, we only need to send the agency name and type
    reportModel.generalInfo = {
        agencyType: (hidFedOrNon === "F" ? "F" : "N"), // Federal or Non-Federal
        agency: (hidFedOrNon === "F" ? document.getElementById("agency").value : document.getElementById("agencyOther").value.trim())
    };

    // ...the rest of the PII need not be sent until the GetReport request
    var allOfGeneralInfo = {

        agencyType: reportModel.generalInfo.agencyType,
        agency: reportModel.generalInfo.agency,
        poc: document.getElementById("poc").value.trim(),
        address: document.getElementById("address").value.trim(),
        city: document.getElementById("city").value.trim(),
        state: document.getElementById("state").value,
        zip: document.getElementById("zip").value.trim(),
        phone1: document.getElementById("phone1").value.trim(),
        phone2: document.getElementById("phone2").value.trim(),
        email: document.getElementById("email").value.trim()
    };

    var system = document.getElementById("system").value;

    reportModel.projectInfo = {
        location: {
            system: system
        },
        description: document.getElementById("description").value.trim()
    };

    if (system === "dec") {
        reportModel.projectInfo.location.lat = document.getElementById("decLat").value.trim();
        reportModel.projectInfo.location.lon = document.getElementById("decLon").value.trim();
    }
    else if (system === "dms") {
        reportModel.projectInfo.location.latDeg = document.getElementById("latDeg").value.trim();
        reportModel.projectInfo.location.latMin = document.getElementById("latMin").value.trim();
        reportModel.projectInfo.location.latSec = document.getElementById("latSec").value.trim();
        reportModel.projectInfo.location.latNS = document.getElementById("latNS").value;
        reportModel.projectInfo.location.lonDeg = document.getElementById("lonDeg").value.trim();
        reportModel.projectInfo.location.lonMin = document.getElementById("lonMin").value.trim();
        reportModel.projectInfo.location.lonSec = document.getElementById("lonSec").value.trim();
        reportModel.projectInfo.location.lonWE = document.getElementById("lonWE").value;
    }
    else if (system === "utm") {
        reportModel.projectInfo.location.utmX = document.getElementById("utmX").value.trim();
        reportModel.projectInfo.location.utmY = document.getElementById("utmY").value.trim();
        reportModel.projectInfo.location.utmZ = document.getElementById("utmZ").value;
    }
    else if (system === "plane") {
        reportModel.projectInfo.location.spX = document.getElementById("spX").value.trim();
        reportModel.projectInfo.location.spY = document.getElementById("spY").value.trim();
        reportModel.projectInfo.location.spZone = document.getElementById("spZone").value;
    }

    reportModel.parishes = app.model.parishes;

    // Send over question and answer (not parent)
    reportModel.questions = [];
    for (var i = 0; i < app.model.nodes.length; i++) {
        var q = app.model.nodes[i];

        // Don't send question 0 to report-generator
        if (q.question) {
            reportModel.questions.push({
                question: q.question,
                answer: q.answer
            });
        }
    }

    reportModel.species = app.model.speciesDone;

    $.ajax({
        type: "POST",
        url: app.url + "PostReportObject",
        data: JSON.stringify(reportModel),
        contentType: "application/json; charset=utf-8",
        success: function (reportID) {
            if (reportID) {
                var info = allOfGeneralInfo;

                // Build parameters to pass PII to get report
                var params = "";
                if (info) {
                    params =
                        (info.agency ? "&agency=" + info.agency : "") +
                        (info.poc ? "&poc=" + info.poc : "") +
                        (info.address ? "&address=" + info.address : "") +
                        (info.city ? "&city=" + info.city : "") +
                        (info.state ? "&state=" + info.state : "") +
                        (info.zip ? "&zip=" + info.zip : "") +
                        (info.phone1 ? "&phone1=" + info.phone1 : "") +
                        (info.phone2 ? "&phone2=" + info.phone2 : "") +
                        (info.email ? "&email=" + info.email : "");
                }

                window.location = app.url + "GetReport?reportID=" + reportID + params;

            }
            else {
                console.log("ERROR: report ID was not returned");
            }
        }
    });
});

function showFed() {
    $("#agencyFed").removeClass("agency-selected");
    $("#agencyNonFed").removeClass("agency-selected");
    $("#agencyFed").addClass("agency-selected");

    document.getElementById("agency").style.display = "block";
    document.getElementById("agencyOther").style.display = "none";
    document.getElementById("labelAgencyOther").style.display = "none";

    document.getElementById("fedOrNon").value = "F";

    document.getElementById("agency").focus();
}
function showNonFed() {
    $("#agencyFed").removeClass("agency-selected");
    $("#agencyNonFed").removeClass("agency-selected");
    $("#agencyNonFed").addClass("agency-selected");

    document.getElementById("agency").style.display = "none";
    document.getElementById("agencyOther").style.display = "block";
    document.getElementById("labelAgencyOther").style.display = "block";

    document.getElementById("fedOrNon").value = "N";

    document.getElementById("agencyOther").focus();
}

$("#agencyFed").on("click", function () {
    showFed();
});
$("#agencyNonFed").on("click", function () {
    showNonFed();
});

// Creates dynamic HTML with species info and picture and displays it in Highslide panel
$(document).on("click", ".species-img-small", function () {
    hs.align = "center";

    var speciesID = this.id.replace("img", "");
    var info = app.speciesInfo[speciesID];
    var html = "";

    if (info) {
        if (info.image) {
            html += "<img src='" + app.path + "Images/" + info.image + "' alt='" + info.name + "' class='species-img-large' />";
        }
        if (info.desc) {
            html += "<div class='species-desc' style='margin:10px'><p>" + info.desc + "</p></div>";
        }

        html += "<div><button type='button' onclick='return hs.close(this);'>Close</button></div>";
    }

    // Need to assign a unique id each time for this to behave dynamically
    var rand = Math.round(Math.random() * 10000);

    $("body").append(
        "<div class='highslide-html-content' id='speciesInfo" + rand + "'>" +
        "<div class='highslide-header'>&nbsp;<ul>" +
        "<li class='highslide-move'><a href='#' onclick='return false;'></a></li>" +
        //"<li class='highslide-close'><a href='#' onclick='return hs.close(this);'></a></li>" +
        "</ul></div>" +
        "<div class='highslide-body'>" + html + "</div>" +
        "<div class='highslide-footer'><div><span class='highslide-resize' title='Resize'><span></span></span></div></div>" +
        "</div>"
    );

    hs.htmlExpand(this, {
        contentId: "speciesInfo" + rand,
        width: 705,
        height: 450
    });
});

app.ui = {
    // Prepares UI based on the incoming question: whether it's a yes/no or OK question, whether it requires the map or additional text, etc.
    prepareQuestionForm: function (question) {
        if (!question) {
            console.log("ERROR: should have gotten back question");
        }
        else {
            // Convert values from API to standard naming
            var specialProcessing = question.SpecialProcessing;
            var nextQuestionID =    question.question       || question.NextQuestionID;
            var nextQuestionText =  question.questionText   || question.NextQuestionText;
            var answer =            question.answer         || question.Answer;
            var addText =           question.additionalText || question.AdditionalText;
            var type =              question.questionType   || question.QuestionType;

            if (specialProcessing && specialProcessing === "AOI") {
                // Show map interface
                $("#mapQuestion").addClass("visible");
                document.getElementById("map-instructions").style.display = "block";
            }
            else {
                // Hide components that are only used for AOI map view
                document.getElementById("aois").innerHTML = "";
                document.getElementById("map-instructions").style.display = "none";

                // HACK: show map for two particular questions
                if (question.NextQuestionID === 700) {
                    // Manatee consultation zone map
                    app.showMapForSpecies(question.NextQuestionID);
                }
                else if (question.NextQuestionID === 1302) {
                    // Piping plover critical habitat
                    app.showMapForSpecies(question.NextQuestionID);
                }
                else {
                    $("#mapQuestion").removeClass("visible");
                }

                if (question.NextQuestionID === 400) {
                    // Inject links to saline prairie photos

                    nextQuestionText = nextQuestionText.replace(
                        "fill material, etc.) on saline prairies (photo link)?",
                        "fill material, etc.) on saline prairies " +
                        "(<a href='" + app.path + "Images/SalinePrairie1.jpg' title='Click to view a saline prairie photo' onclick='return hs.expand(this);'>photo 1</a>, " +
                        "<a href='" + app.path + "Images/SalinePrairie2.jpg' title='Click to view a saline prairie photo' onclick='return hs.expand(this);'>photo 2</a>)?");
                }
            }

            document.getElementById("question").innerHTML = nextQuestionText;
            document.getElementById("questionNum").value = nextQuestionID;

            // Clear Yes/No radio buttons
            document.getElementById("radioYes").checked = false;
            document.getElementById("radioNo").checked = false;
            this.disableNextButton();

            document.getElementById("species").innerHTML = "";

            // Show species info
            if (question.speciesID) {
                var q = question.speciesID;

                // If current species !- question.species, push current back onto stack
                if (q.toString() !== app.model.speciesCurrent) {
                    app.model.species.push(app.model.speciesCurrent);
                }

                app.model.speciesCurrent = q;

                // If current species is in speciesDone, need to delete it
                for (var d = 0; d < app.model.speciesDone.length; d++) {
                    var done = app.model.speciesDone[d];

                    if (done.speciesID === q.toString()) {
                        app.model.speciesDone.splice(d); // Remove this item
                    }
                }
            }

            var currentSpeciesID = app.model.speciesCurrent;
            if (currentSpeciesID) {

                if (currentSpeciesID.toString() === "11") {
                    // show both "11" and "12" (rabbitsfoot and pink mucket mussels)

                    var arr = [11, 12];
                    var html = "";

                    for (var i = 0; i < arr.length; i++) {
                        var info = app.speciesInfo[arr[i]];

                        if (info) {
                            html += "<div>";

                            if (info.image) {
                                html += "<img id='img" + info.id + "' src='" + app.path + "Images/" + info.image + "' alt='" + info.name + "' class='species-img-small' />";
                            }

                            html += "<h4>" + info.name + "</h4></div><div>(Click image for more details)</div><div style='clear:both'></div><hr />";
                        }
                    }
                }
                else if (currentSpeciesID.toString() === "20") {
                    // show both "20" and "21" (sea turtles img and desc.)

                    var arr = [20, 21];
                    var html = "";

                    for (var i = 0; i < arr.length; i++) {
                        var info = app.speciesInfo[arr[i]];

                        if (info) {
                            html += "<div>";

                            if (info.image) {
                                html += "<img id='img" + info.id + "' src='" + app.path + "Images/" + info.image + "' alt='" + info.name + "' class='species-img-small' />";
                            }

                            html += "<h4>" + info.name + "</h4></div><div>(Click image for more details)</div><div style='clear:both'></div><hr />";
                        }
                    }
                }
                else {
                    var info = app.speciesInfo[currentSpeciesID];
                    if (info) {
                        var html = "<div>";

                        if (info.image) {
                            html += "<img id='img" + info.id + "' src='" + app.path + "Images/" + info.image + "' alt='" + info.name + "' class='species-img-small' />";
                        }

                        html += "<h4>" + info.name + "</h4></div><div>(Click image for more details)</div><div style='clear:both'></div><hr />";
                    }
                }

                document.getElementById("species").innerHTML = html;
            }
            else {
                document.getElementById("species").innerHTML = "";
            }

            // Show optional additional text (for some of the habitat questions)
            if (addText) {
                document.getElementById("additionalText").innerHTML = addText;
            }
            else {
                document.getElementById("additionalText").innerHTML = "";
            }

            if (type === "OK") {
                document.getElementById("yesNo").style.display = "none";
                document.getElementById("next").style.display = "none";
                document.getElementById("ok").style.display = "block";
            }
            else {
                document.getElementById("yesNo").style.display = "block";
                document.getElementById("next").style.display = "block";
                document.getElementById("ok").style.display = "none";

                // If an answer was previously chosen, populate the correct radio button
                if (answer) {
                    if (answer === "Y") {
                        document.getElementById("radioYes").checked = true;
                        document.getElementById("radioNo").checked = false;
                        this.enableNextButton();
                    }
                    else if (answer === "N") {
                        document.getElementById("radioYes").checked = false;
                        document.getElementById("radioNo").checked = true;
                        this.enableNextButton();
                    }
                }
            }

            if (specialProcessing && specialProcessing === "AOI") {
                document.getElementById("yesNo").style.display = "none";
                app.ui.disableNextButton();
            }
        }
    },

    disableNextButton: function () {
        document.getElementById("next").disabled = true;
    },

    enableNextButton: function () {
        document.getElementById("next").disabled = false;
    },

    showWaiting: function () {
        document.getElementById("waiting").style.visibility = "visible";
    },

    hideWaiting: function () {
        document.getElementById("waiting").style.visibility = "hidden";
    },

    startMap: function (api) {
        app.ui.showWaiting();
        app.getAOI(api);
    },

    showBasedOnResponse: function () {
        var responses = app.getResponse();

        // If a species had a NOAA response, show it in addition to the "worst" response below
        if (responses.includeNOAA) {
            app.ui.showNOAA();
        }

        switch (responses.worst) {
            case 1:
                app.ui.showNoEffect();
                break;
            case 2:
                app.ui.showSendItIn();
                break;
            case 3:
                app.ui.showNLAA();
                break;
            default:
                app.ui.showSendItIn();
                break;
        }
    },

    showNoEffect: function () {
        $("#textQuestion").removeClass("visible");
        $("#mapQuestion").removeClass("visible");
        $("#noEffectMap").addClass("visible");
        document.getElementById("previous").style.display = "none";
    },

    showSendItIn: function () {
        $("#textQuestion").removeClass("visible");
        $("#mapQuestion").removeClass("visible");
        $("#sendItInReport").addClass("visible");
        document.getElementById("previous").style.display = "none";
    },

    showNLAA: function () {
        $("#textQuestion").removeClass("visible");
        $("#mapQuestion").removeClass("visible");
        $("#nlaaReport").addClass("visible");
        document.getElementById("previous").style.display = "none";
    },

    showNOAA: function () {
        $("#textQuestion").removeClass("visible");
        $("#mapQuestion").removeClass("visible");
        $("#noaa").addClass("visible");
        document.getElementById("previous").style.display = "none";
    }
};
