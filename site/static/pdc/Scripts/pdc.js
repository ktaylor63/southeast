"use strict";
pdcApp.speciesInfo = speciesInfo;

// Removes next species from list and points to it as the current species.
pdcApp.popNextSpecies = function () {
    pdcApp.model.speciesCurrent = pdcApp.model.species.pop();
};

// Saves response code and links it to current species. If no species is being examined, species ID is set to 0 (zero).
pdcApp.saveSpeciesResponse = function (responseID) {
    pdcApp.model.speciesDone.push({
        speciesID: pdcApp.model.speciesCurrent || "0",
        response: responseID
    });
};

// Returns object with the response to handle plus whether optional NOAA response should be shown.
// The inelegant solution is because responses are not ordered numerically according to "severity".
pdcApp.getResponse = function () {
    var worst = 1;

    var noEffect = false;
    var sendItIn = false;
    var nlaa = false;
    var noaa = false;

    if (pdcApp.model.speciesDone && pdcApp.model.speciesDone.length) {
        var len = pdcApp.model.speciesDone.length;

        // Loop through all responses gathered for each species and note which ones are encountered
        for (var i = 0; i < len; i++) {
            var response = pdcApp.model.speciesDone[i].response;

            if (response === 1) {
                noEffect = true;
            }
            else if (response === 2) {
                sendItIn = true;
            }
            else if (response === 3) {
                nlaa = true;
            }
            else if (response === 4) {
                noaa = true;
            }
        }
    }

    // Check most severe responses first. Possibility of NOAA response must be included along with 
    // any other response.
    //
    // Most severe:     sendItIn (2)
    //
    // Intermediate:    nlaa     (3)
    //
    // Least severe:    noEffect (1)
    //
    if (sendItIn) {
        return { worst: 2, includeNOAA: noaa };
    }
    else if (nlaa) {
        return { worst: 3, includeNOAA: noaa };
    }
    else if (noEffect) {
        return { worst: 1, includeNOAA: noaa };
    }
    else {
        return { worst: 2, includeNOAA: noaa };
    }
};

pdcApp.model = {
    species: [],
    speciesDone: [],
    parishes: [],
    pointer: null,
    nodes: [],

    init: function() {
        this.pointer = 0;
        this.evaluateNEXT();
    },

    next: function () {
        this.pointer++;
        this.evaluateNEXT();
    },

    previous: function () {
        if (this.pointer > 0) {
            this.pointer--;

            var node = this.nodes[this.pointer];

            if (node) {
                // Destroy the last node after pulling up its question. Clicking Next will then re-create it via querying the API
                var p = this.nodes.pop();

                if (parseInt(p.question) <= 7) {
                    pdcApp.model.speciesCurrent = null;
                    pdcApp.model.species = [];
                    pdcApp.model.speciesDone = [];
                }

                // Change the view
                if (parseInt(node.question) === 0) {
                    pdcApp.api.getParishes();
                }
                else {
                    if (parseInt(node.question) === 7) {

                        // Hide these elements while AOIs are being queried again
                        document.getElementById("yesNo").style.display = "none";
                        pdcApp.ui.disableNextButton();
                        
                        // For now, query for AOIs and build map from scratch as usual. Refactor later to cache data if time allows.
                        pdcApp.ui.startMap(pdcApp.apiForLaterUse);
                    }
                    else {
                        pdcApp.ui.prepareQuestionForm(node);
                    }
                }
            }
        }
    },

    // HACK: force NEXT click to query API all the time
    evaluateNEXT: function () {
        var node = this.nodes[this.pointer];

        if (node) {
            pdcApp.api.getQuestion({
                question: node.question,
                answer: node.answer
            });
        }
        else {
            // Special cases
            if (this.pointer === 0) {
                // First question - get list of parishes
                pdcApp.api.getParishes();
            }
            else {
                var previous = this.nodes[this.pointer - 1];

                if (previous) {
                    pdcApp.api.getQuestion({
                        question: previous.question,
                        answer: previous.answer
                    });
                }
                else {
                    console.log("ERROR: could not get previous node at " + this.pointer - 1);
                }
            }
        }
    },

    saveNode: function (nodeInfo) {
        var n = this.nodes[this.pointer];

        if (n) {
            this.nodes[this.pointer].question = nodeInfo.question;
            this.nodes[this.pointer].answer = nodeInfo.answer;
            this.nodes[this.pointer].questionText = nodeInfo.questionText;
            this.nodes[this.pointer].additionalText = nodeInfo.additionalText;

            // Associate current species ID with the question just answered (for backtracking purposes)
            if (pdcApp.model.speciesCurrent) {
                this.nodes[this.pointer].speciesID = pdcApp.model.speciesCurrent;
            }
        }
        else {

            // Associate current species ID with the question just answered (for backtracking purposes)
            if (pdcApp.model.speciesCurrent) {
                nodeInfo.speciesID = pdcApp.model.speciesCurrent;
            }

            this.nodes.push(nodeInfo);
        }
    }
};