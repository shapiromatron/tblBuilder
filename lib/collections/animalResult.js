var instanceMethods = {};
AnimalEndpointEvidence = new Meteor.Collection('animalEndpointEvidence', {
    transform: function (doc) {
        return  _.extend(Object.create(instanceMethods), doc);
    }
});


// collection class methods/attributes
_.extend(AnimalEndpointEvidence, {
    preSaveHook: function(tmpl, obj) {
        delete obj.dose;
        delete obj.nStart;
        delete obj.nSurviving;
        delete obj.incidence;
        delete obj.multiplicity;
        delete obj.totalTumours;
        var trs = tmpl.findAll('.endpointGroupTbody tr');
        obj.endpointGroups = _.map(trs, function(row){
            return clientShared.newValues(row);
        });
    }
});


tblBuilderCollections.attachSchema(AnimalEndpointEvidence, _.extend({
    parent_id: {
        type: SimpleSchema.RegEx.Id,
        denyUpdate: true
    },
    tumourSite: {
        label: "Tumour site",
        type: String,
        min: 1,
        popoverText: "e.g., Skin, Lung, Bronchiolo alveolar, Thymus, Lymphoid tissue, Soft tissue, Harderian gland, Pleural tissue",
        typeaheadMethod: "searchAnimalTumourSite",
        placeholderText: "Skin, lung, bronchio alveolar",
    },
    histology: {
        label: "Histology",
        type: String,
        min: 1,
        popoverText: "e.g., squamous cell carcinoma, papilloma, adenoma, lymphoma, fibrosarcoma, mesothelioma, haemangiosarcoma",
        typeaheadMethod: "searchAnimalHistology",
        placeholderText: "squamous cell carcinoma, adenoma",
    },
    units: {
        label: "Dosing units",
        type: String,
        min: 1,
        popoverText: "e.g., mg/mL, mg/kg, mg/kg bw, µg/m³",
        typeaheadMethod: "searchAnimalUnits",
        placeholderText: "mg/kg bw",
    },
    "endpointGroups.$.dose": {
        label: "Dose",
        type: String,
        min: 1,
        popoverText: "As reported",
    },
    "endpointGroups.$.nStart": {
        label: "N at start",
        type: Number,
        decimal: false,
        popoverText: "As reported",
    },
    "endpointGroups.$.nSurviving": {
        label: "N surviving",
        type: String,
        optional: true,
        popoverText: "As reported (if available)",
    },
    "endpointGroups.$.incidence": {
        label: "Tumour incidence",
        type: String,
        optional: true,
        popoverText: "N of tumour-bearing animals/N of animals at risk [use N at start if N at risk is unknown]. Add asterisk(s) to identify a significant incidence (e.g.: 4/11*, 6/37, 6/50**)",
    },
    "endpointGroups.$.multiplicity": {
        label: "Tumour multiplicity",
        type: String,
        optional: true,
        popoverText: "Mean number of tumours/tumour-bearing animal. Add asterisk(s) to identify a significant multiplicity (e.g.: 1.0, 1.23, 3.87*)",
    },
    "endpointGroups.$.totalTumours": {
        label: "Total tumours",
        type: String,
        optional: true,
        popoverText: "Total number of tumours per group. Add asterisk(s) to identify a significant number (e.g.: 0, 13*, 225**)",
    },
    incidence_significance: {
        label: "Incidence significance notes",
        type: String,
        optional: true,
        popoverText: "Indicate p-value, statistical test used, and reference group (in square brackets if Working Group calculation). e.g. *p=0.024, 1-tail Cochran-Armitage, trend; **[p<0.05, 1-tail Fisher exact, vs. pooled controls]",
        textAreaRows: 3,
    },
    multiplicity_significance: {
        label: "Multiplicity significance notes",
        type: String,
        optional: true,
        popoverText: "Indicate p-value, statistical test used, and reference group (in square brackets if Working Group calculation). e.g. *p<0.05, Student t-test, vs controls; **[p<0.01, Wilcoxon test, vs. untreated controls]",
        textAreaRows: 3,
    },
    total_tumours_significance: {
        label: "Total tumours significance notes",
        type: String,
        optional: true,
        popoverText: "Indicate significance level, statistical test used, and reference group.",
        textAreaRows: 3,
    },
    trendTestReport: {
        type: String,
        optional: true,
    }
}, tblBuilderCollections.base, tblBuilderCollections.table));
