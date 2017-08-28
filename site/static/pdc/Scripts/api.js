"use strict";

// Contains methods in pdcApp.api for interacting with API to retrieve list of parishes and sequential questions.

pdcApp.api = {
    // Queries API for list of parishes. Hides intro DIVs and shows parish DIV along with Continue button.
    getParishes: function () {
        $("#ack").removeClass("visible");
        $("#parishes").toggleClass("visible");
        $("#textQuestion").removeClass("visible");
        $("#startOverButtons").addClass("visible");

        document.getElementById("previous").style.display = "none";

        $.ajax({
            url: pdcApp.url + "GetParishes",
            success: function (parishes) {
                if (parishes) {

                    $("#parishList").html("");
                    var len = parishes.length;
                    var html = "";
                    var rows = 16;

                    for (var i = 0; i < len; i++) {
                        if (i % rows === 0) {
                            html += "<div class='parishColumn'>";
                        }

                        // Check pdcApp.model.parishes and populate these with 'checked' status (this is used during a backtrack)
                        var checked = false;
                        for (var j = 0; j < pdcApp.model.parishes.length; j++) {
                            if (parishes[i].ParishID === parseInt(pdcApp.model.parishes[j])) {
                                checked = true;
                                break;
                            }
                        }

                        if (checked) {
                            html += "<div><label><input class='parish' type='checkbox' value='" + parishes[i].ParishID + "' checked='checked' /> " + parishes[i].ParishName + "</label></div>";
                        }
                        else {
                            html += "<div><label><input class='parish' type='checkbox' value='" + parishes[i].ParishID + "' /> " + parishes[i].ParishName + "</label></div>";
                        }

                        if (i % rows === rows - 1) {
                            html += "</div>";
                        }
                    }

                    html += "<div style='clear:both'></div>";
                    document.getElementById("parishList").innerHTML = html;
                }
                else {
                    console.log("ERROR: parishes not found");
                }
            }
        });
    },
    // Builds parameters based on question/answer argument (if any) and queries API to get the next question or a final response.
    getQuestion: function (qa) {
        document.getElementById("previous").style.display = "inline";

        // Build parameters to send back to API. These include:
        //  (1) The question number just answered
        //  (2) The answer given (Y or N)
        var params = "QuestionID=0"; // optional. If no question Id is passed, assume 0.

        if (qa) {
            params =
                "QuestionID=" + qa.question +
                "&Answer=" + qa.answer +
                "&ParishList=" + pdcApp.model.parishes;

            if (pdcApp.model.speciesCurrent) {
                params += "&SpeciesID=" + pdcApp.model.speciesCurrent;
            }
        }
        else if (pdcApp.model.speciesCurrent) {
            params = "SpeciesID=" + pdcApp.model.speciesCurrent;
        }

        // TODO: need to move this logic into question 7 presentation
        if (pdcApp.sendBackAOI) {
            var chks = document.getElementsByClassName("aoi-chk");

            var selected = [];
            for (var i = 0; i < chks.length; i++) {
                if (chks[i].checked) {
                    selected.push(chks[i].id.replace("aoi", ""));
                }
            }

            params += "&SelectedAOI=" + selected.toString();

            pdcApp.sendBackAOI = false;
        }

        // Call API to get next question, sending it details about the last-answered question so it knows where to route us next.
        // The exception is question 0 which requires no parameters.
        $.ajax({
            url: pdcApp.url + "ProcessQuestion?" + params,
            success: function (api) {
                if (api) {
                    if (api.ResponseID) {
                        if (api.ResponseID === 1) {
                            // No effect
                            pdcApp.saveSpeciesResponse(api.ResponseID);

                            if (pdcApp.model.species.length) {
                                pdcApp.popNextSpecies();
                                pdcApp.api.getQuestion();
                            }
                            else {
                                pdcApp.ui.showBasedOnResponse();
                            }
                        }
                        else if (api.ResponseID === 2) {
                            // Send it in (may affect)
                            pdcApp.saveSpeciesResponse(api.ResponseID);

                            if (pdcApp.model.species.length) {
                                pdcApp.popNextSpecies();
                                pdcApp.api.getQuestion();
                            }
                            else {
                                pdcApp.ui.showBasedOnResponse();
                            }

                            return;
                        }
                        else if (api.ResponseID === 3) {
                            // NLAA (not likely to adversely affect)
                            pdcApp.saveSpeciesResponse(api.ResponseID);

                            if (pdcApp.model.species.length) {
                                pdcApp.popNextSpecies();
                                pdcApp.api.getQuestion();
                            }
                            else {
                                pdcApp.ui.showBasedOnResponse();
                            }

                            return;
                        }
                        else if (api.ResponseID === 4) {
                            // NOAA consultation required
                            pdcApp.saveSpeciesResponse(api.ResponseID);

                            if (pdcApp.model.species.length) {
                                pdcApp.popNextSpecies();
                                pdcApp.api.getQuestion();
                            }
                            else {
                                pdcApp.ui.showBasedOnResponse();
                            }

                            return;
                        }
                        else if (api.ResponseID === 10) {
                            // API should send species IDs now (string of comma-delimited values)
                            if (api.SpeciesIDList) {
                                pdcApp.model.species = api.SpeciesIDList.split(",");

                                // Now ask Question 0 with SpeciesID x, where x is the first ID from the species list
                                if (pdcApp.model.species.length) {
                                    pdcApp.popNextSpecies();

                                    pdcApp.api.getQuestion();
                                }
                            }
                            else {
                                console.log("ERROR: API did not send back species when expected");
                            }
                        }
                        else {
                            console.log("ERROR: new unhandled response was returned: " + api.ResponseID);
                            return;
                        }
                    }
                    else {
                        if (api.SpecialProcessing && api.SpecialProcessing === "AOI") {
                            pdcApp.ui.startMap(api);

                            pdcApp.apiForLaterUse = api;
                        }
                        else {
                            // normal text question only
                            pdcApp.ui.prepareQuestionForm(api);
                        }
                    }
                }
                else {
                    console.log("ERROR: no question received");
                }
            }
        });
    }
};