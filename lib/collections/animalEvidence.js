var instanceMethods = {
    setWordFields: function() {
        var endpoints = AnimalEndpointEvidence.find({parent_id: this._id}).fetch(),
            firstE = (endpoints.length > 0) ? endpoints[0] : null;

        endpoints.forEach(function(eps){
            _.extend(eps, {
                wrd_incidents: AnimalEvidence.getIncidents(eps.endpointGroups),
                wrd_multiplicities: AnimalEvidence.getMultiplicities(eps.endpointGroups),
                wrd_total_tumours: AnimalEvidence.getTotalTumours(eps.endpointGroups),
                wrd_incidence_significance: eps.incidence_significance || "",
                wrd_multiplicity_significance: eps.multiplicity_significance || "",
                wrd_total_tumours_significance: eps.total_tumours_significance || "",
            });
        });

        _.extend(this, {
            endpoints: endpoints,
            wrd_strengths: this.strengths.join(", ") || "None",
            wrd_limitations: this.limitations.join(", ") || "None",
            wrd_comments: this.comments || "None",
            wrd_doses: AnimalEvidence.getDoses(firstE),
            wrd_nStarts: AnimalEvidence.getNStarts(firstE),
            wrd_nSurvivings: AnimalEvidence.getNSurvivings(firstE),
        });
    },
    getReference: function(){
        if (_.isEmpty(this.reference)){
            this.reference = Reference.findOne(this.referenceID);
        }
        return this.reference;
    },
};
AnimalEvidence = new Meteor.Collection('animalEvidence', {
    transform: function (doc) {
        return  _.extend(Object.create(instanceMethods), doc);
    }
});


// collection class methods/attributes
_.extend(AnimalEvidence, {
    studyDesigns: [
        "Full carcinogenicity",
        "Initiation-promotion (tested as initiator)",
        "Initiation-promotion (tested as promoter)",
        "Co-carcinogenicity",
        "Carcinogenicity with other modifying factor"
    ],
    sexes: [
        "M",
        "F",
        "M+F (combined)",
        "NR"
    ],
    tabular: function(tbl_id) {
        var data, getEndpointData, header, i, len, limitations, reference, row, rows, strengths, v, vals;
        getEndpointData = function(parent_id, row) {
            var eg, i, j, len, len1, ref, row2, row3, rows, signifs, v, vals;
            vals = AnimalEndpointEvidence.find({parent_id: parent_id}, {sort: {sortIdx: 1}}).fetch();
            rows = [];
            for (i = 0, len = vals.length; i < len; i++) {
                v = vals[i];
                row2 = row.slice();
                row2.push(v._id, v.tumourSite, v.histology, v.units);
                signifs = [v.incidence_significance, v.multiplicity_significance, v.total_tumours_significance];
                ref = v.endpointGroups;
                for (j = 0, len1 = ref.length; j < len1; j++) {
                    eg = ref[j];
                    row3 = row2.slice();
                    row3.push(eg.dose, eg.nStart, eg.nSurviving, eg.incidence, eg.multiplicity, eg.totalTumours);
                    row3.push.apply(row3, signifs);
                    rows.push(row3);
                }
            }
            return rows;
        };
        vals = AnimalEvidence.find({tbl_id: tbl_id}, {sort: {sortIdx: 1}}).fetch();
        header = ["Evidence ID", "Reference", "Study design", "Species", "Strain", "Sex", "Agent", "Purity", "Dosing route", "Vehicle", "Age at start", "Duration", "Dosing Regimen", "Strengths", "Limitations", "Comments", "Endpoint ID", "Tumour site", "Histology", "Units", "Dose", "N at Start", "N Surviving", "Incidence", "Multiplicity", "Total Tumours", "Incidence significance", "Multiplicity significance", "Total tumours significance"];
        data = [header];
        for (i = 0, len = vals.length; i < len; i++) {
            v = vals[i];
            reference = Reference.findOne({_id: v.referenceID}).name;
            strengths = v.strengths.join(', ');
            limitations = v.limitations.join(', ');
            row = [v._id, reference, v.studyDesign, v.species, v.strain, v.sex, v.agent, v.purity, v.dosingRoute, v.vehicle, v.ageAtStart, v.duration, v.dosingRegimen, strengths, limitations, v.comments];
            rows = getEndpointData(v._id, row);
            data.push.apply(data, rows);
        }
        return data;
    },
    getDoses: function(e) {
        if (e) {
            return e.endpointGroups
                    .map(function(v) {return v.dose;})
                    .join(", ") + " " + e.units;
        } else {
            return "NR";
        }
    },
    getNStarts: function(e) {
        if (e) {
            return e.endpointGroups
                    .map(function(v) {return v.nStart;})
                    .join(", ");
        } else {
            return "NR";
        }
    },
    getNSurvivings: function(e) {
        var numeric, survivings;
        if ((e == null) || (e.endpointGroups == null)) return "NR";
        numeric = false;
        survivings = e.endpointGroups
            .map(function(eg) {
                if ((eg.nSurviving != null) && eg.nSurviving !== "") {
                    numeric = true;
                    return eg.nSurviving;
                } else {
                    return "NR";
                }
            });
        if (numeric) {
            return survivings.join(", ");
        } else {
            return "NR";
        }
    },
    getIncidents: function(egs) {
        var val;
        if (_.pluck(egs, "incidence").join("").length > 0) {
            val = egs.map(function(v) {return v.incidence;}).join(", ");
            return "Tumour incidence: " + val;
        } else {
            return "";
        }
    },
    getMultiplicities: function(egs) {
        var val;
        if (_.pluck(egs, "multiplicity").join("").length > 0) {
            val = egs.map(function(v) {return v.multiplicity || "NR";}).join(", ");
            return "Tumour multiplicity: " + val;
        } else {
            return "";
        }
    },
    getTotalTumours: function(egs) {
        var val;
        if (_.pluck(egs, "totalTumours").join("").length > 0) {
            val = egs.map(function(v) {return v.totalTumours || "NR";}).join(", ");
            return "Total tumours: " + val;
        } else {
            return "";
        }
    },
    wordReportFormats: [
        {
          "type": "AnimalHtmlTables",
          "fn": "animal",
          "text": "Download Word"
        }
    ],
    wordContext: function(tbl_id) {
        var tbl = Tables.findOne(tbl_id),
            evidences = AnimalEvidence
                .find({tbl_id: tbl_id}, {sort: {sortIdx: 1}})
                .fetch();

        evidences.forEach(function(el){
            el.reference = Reference.findOne({_id: el.referenceID});
            el.setWordFields();
        });

        return {
            "table": tbl,
            "studies": evidences
        };
    },
    sortFields: [
        "Reference",
    ]
});


tblBuilderCollections.attachSchema(AnimalEvidence, _.extend({
    referenceID: {
        label: "Reference",
        type: SimpleSchema.RegEx.Id
    },
    studyDesign: {
        label: "Data class",
        type: String,
        allowedValues: AnimalEvidence.studyDesigns,
        popoverText: "As reported"
    },
    species: {
        label: "Species",
        type: String,
        min: 1,
        popoverText: "As reported",
        typeaheadMethod: "searchAnimalSpecies",
        placeholderText: "Mouse, Rat, Hamster",
    },
    strain: {
        label: "Strain",
        type: String,
        min: 1,
        popoverText: "As reported",
        typeaheadMethod: "searchAnimalStrain",
        placeholderText: "B6C3F1, F344",
    },
    sex: {
        label: "Sex",
        type: String,
        allowedValues: AnimalEvidence.sexes,
        popoverText: "As reported",
    },
    agent: {
        label: "Agent",
        type: String,
        min: 1,
        popoverText: "As reported",
        typeaheadMethod: "searchAnimalAgent",
        placeholderText: "Trichloroethylene, Asbestos",
    },
    purity: {
        label: "Purity",
        type: String,
        min: 1,
        popoverText: "As reported",
        typeaheadMethod: "searchAnimalPurity",
        placeholderText: ">99.9%, technical grade",
    },
    dosingRoute: {
        label: "Dosing route",
        type: String,
        min: 1,
        popoverText: "As reported",
        typeaheadMethod: "searchAnimalDosingRoute",
        placeholderText: "Gavage, feed, i.p.",
    },
    vehicle: {
        label: "Vehicle",
        type: String,
        min: 1,
        popoverText: "As reported",
        typeaheadMethod: "searchAnimalVehicle",
        placeholderText: "distilled water, PBS, saline, air",
    },
    ageAtStart: {
        label: "Age at start",
        type: String,
        min: 1,
        popoverText: "Age at start of exposure",
        placeholderText: "6-8 wk old, 2 mo old, newborn",
    },
    duration: {
        label: "Duration",
        type: String,
        min: 1,
        popoverText: "Exposure duration including additional observation time (if any)",
        placeholderText: "110 wk, 24 mo, lifetime",
    },
    dosingRegimen: {
        label: "Dosing regimen",
        type: String,
        min: 1,
        popoverText: "Dosing regimen of the agent tested, and (if any) information on any co-exposure or modifying factors (e.g., NDEA, TPA, Aflatoxin B1, UV) including route, concentration and dosing regimen",
        placeholderText: "2x/d for 103 wk; 2x/wk for 20 mo",
    },
    strengths: {
        label: "Principal strengths",
        type: [String],
        minCount: 0,
        popoverText: "e.g., GLP study, multiple doses tested, high number of animals per group",
        typeaheadMethod: "searchAnimalStrengths",
    },
    limitations: {
        label: "Principal limitations",
        type: [String],
        minCount: 0,
        popoverText: "e.g., inadequate duration, no controls, small number of animals per group, inadequate reporting of exposure or results, high mortality, MTD not reached",
        typeaheadMethod: "searchAnimalLimitations",
    },
    comments: {
        label: "Other comments",
        type: String,
        optional: true,
        popoverText: "Other relevant information or Working Group comments",
        textAreaRows: 3,
    }
}, tblBuilderCollections.base, tblBuilderCollections.table));
