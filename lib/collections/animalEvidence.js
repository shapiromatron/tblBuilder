var instanceMethods = {};
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
    setWordFields: function(d) {
        var e, i, len, ref;
        d.strengths = d.strengths.join(", ") || "None";
        d.limitations = d.limitations.join(", ") || "None";
        d.comments = d.comments || "None";
        d.endpoints = AnimalEndpointEvidence.find({parent_id: d._id}).fetch();
        ref = d.endpoints;
        for (i = 0, len = ref.length; i < len; i++) {
            e = ref[i];
            e.incidents = AnimalEvidence.getIncidents(e.endpointGroups);
            e.multiplicities = AnimalEvidence.getMultiplicities(e.endpointGroups);
            e.total_tumours = AnimalEvidence.getTotalTumours(e.endpointGroups);
            e.incidence_significance = e.incidence_significance || "";
            e.multiplicity_significance = e.multiplicity_significance || "";
            e.total_tumours_significance = e.total_tumours_significance || "";
        }
        e = d.endpoints.length > 0 ? d.endpoints[0] : undefined;
        d.doses = AnimalEvidence.getDoses(e);
        d.nStarts = AnimalEvidence.getNStarts(e);
        return d.nSurvivings = AnimalEvidence.getNSurvivings(e);
    }
});


tblBuilderSchema.attachSchema(AnimalEvidence, _.extend({
    referenceID: {
        label: "Reference",
        type: SimpleSchema.RegEx.Id
    },
    studyDesign: {
        label: "Study design",
        type: String,
        allowedValues: AnimalEvidence.studyDesigns
    },
    species: {
        label: "Species",
        type: String,
        min: 1
    },
    strain: {
        label: "Strain",
        type: String,
        min: 1
    },
    sex: {
        label: "Sex",
        type: String,
        allowedValues: AnimalEvidence.sexes
    },
    agent: {
        label: "Agent",
        type: String,
        min: 1
    },
    purity: {
        label: "Purity",
        type: String,
        min: 1
    },
    dosingRoute: {
        label: "Dosing route",
        type: String,
        min: 1
    },
    vehicle: {
        label: "Vehicle",
        type: String,
        min: 1
    },
    ageAtStart: {
        label: "Age at start",
        type: String,
        min: 1
    },
    duration: {
        label: "Duration",
        type: String,
        min: 1
    },
    dosingRegimen: {
        label: "Dosing regimen",
        type: String,
        min: 1
    },
    strengths: {
        label: "Principal strengths",
        type: [String],
        minCount: 0
    },
    limitations: {
        label: "Principal limitations",
        type: [String],
        minCount: 0
    },
    comments: {
        label: "Other comments",
        type: String,
        optional: true
    }
}, tblBuilderSchema.base, tblBuilderSchema.table));
