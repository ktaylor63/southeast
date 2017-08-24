"use strict";

// Contains methods in app.api for interacting with API to retrieve list of parishes and sequential questions.

app.api = {
    // Queries API for list of parishes. Hides intro DIVs and shows parish DIV along with Continue button.
    getParishes: function () {
        $("#ack").removeClass("visible");
        $("#parishes").toggleClass("visible");
        $("#textQuestion").removeClass("visible");
        $("#startOverButtons").addClass("visible");

        document.getElementById("previous").style.display = "none";

        $.ajax({
            url: app.url + "GetParishes",
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

                        // Check app.model.parishes and populate these with 'checked' status (this is used during a backtrack)
                        var checked = false;
                        for (var j = 0; j < app.model.parishes.length; j++) {
                            if (parishes[i].ParishID === parseInt(app.model.parishes[j])) {
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
                "&ParishList=" + app.model.parishes;

            if (app.model.speciesCurrent) {
                params += "&SpeciesID=" + app.model.speciesCurrent;
            }
        }
        else if (app.model.speciesCurrent) {
            params = "SpeciesID=" + app.model.speciesCurrent;
        }

        // TODO: need to move this logic into question 7 presentation
        if (app.sendBackAOI) {
            var chks = document.getElementsByClassName("aoi-chk");

            var selected = [];
            for (var i = 0; i < chks.length; i++) {
                if (chks[i].checked) {
                    selected.push(chks[i].id.replace("aoi", ""));
                }
            }

            params += "&SelectedAOI=" + selected.toString();

            app.sendBackAOI = false;
        }

        // Call API to get next question, sending it details about the last-answered question so it knows where to route us next.
        // The exception is question 0 which requires no parameters.
        $.ajax({
            url: app.url + "ProcessQuestion?" + params,
            success: function (api) {
                if (api) {
                    if (api.ResponseID) {
                        if (api.ResponseID === 1) {
                            // No effect
                            app.saveSpeciesResponse(api.ResponseID);

                            if (app.model.species.length) {
                                app.popNextSpecies();
                                app.api.getQuestion();
                            }
                            else {
                                app.ui.showBasedOnResponse();
                            }
                        }
                        else if (api.ResponseID === 2) {
                            // Send it in (may affect)
                            app.saveSpeciesResponse(api.ResponseID);

                            if (app.model.species.length) {
                                app.popNextSpecies();
                                app.api.getQuestion();
                            }
                            else {
                                app.ui.showBasedOnResponse();
                            }

                            return;
                        }
                        else if (api.ResponseID === 3) {
                            // NLAA (not likely to adversely affect)
                            app.saveSpeciesResponse(api.ResponseID);

                            if (app.model.species.length) {
                                app.popNextSpecies();
                                app.api.getQuestion();
                            }
                            else {
                                app.ui.showBasedOnResponse();
                            }

                            return;
                        }
                        else if (api.ResponseID === 4) {
                            // NOAA consultation required
                            app.saveSpeciesResponse(api.ResponseID);

                            if (app.model.species.length) {
                                app.popNextSpecies();
                                app.api.getQuestion();
                            }
                            else {
                                app.ui.showBasedOnResponse();
                            }

                            return;
                        }
                        else if (api.ResponseID === 10) {
                            // API should send species IDs now (string of comma-delimited values)
                            if (api.SpeciesIDList) {
                                app.model.species = api.SpeciesIDList.split(",");

                                // Now ask Question 0 with SpeciesID x, where x is the first ID from the species list
                                if (app.model.species.length) {
                                    app.popNextSpecies();

                                    app.api.getQuestion();
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
                            app.ui.startMap(api);

                            app.apiForLaterUse = api;
                        }
                        else {
                            // normal text question only
                            app.ui.prepareQuestionForm(api);
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