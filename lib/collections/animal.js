var aniClsMethods = {
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
        ]
    },
    aniInstanceMethods = {},
    endpointClsMethods = {},
    endpointInstanceMethods = {};


AnimalEvidence = new Meteor.Collection('animalEvidence', {
  transform: function (doc) {
    return  _.extend(Object.create(aniInstanceMethods), doc);
  }
});
_.extend(AnimalEvidence, aniClsMethods);


AnimalEndpointEvidence = new Meteor.Collection('animalEndpointEvidence', {
  transform: function (doc) {
    return  _.extend(Object.create(endpointInstanceMethods), doc);
  }
});
_.extend(AnimalEndpointEvidence, endpointClsMethods);


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


tblBuilderSchema.attachSchema(AnimalEndpointEvidence, _.extend({
    parent_id: {
        type: SimpleSchema.RegEx.Id,
        denyUpdate: true
    },
    tumourSite: {
        label: "Tumour site",
        type: String,
        min: 1
    },
    histology: {
        label: "Histology",
        type: String,
        min: 1
    },
    units: {
        label: "Dosing units",
        type: String,
        min: 1
    },
    "endpointGroups.$.dose": {
        label: "Dose",
        type: String
    },
    "endpointGroups.$.nStart": {
        label: "N at start",
        type: Number,
        decimal: false
    },
    "endpointGroups.$.nSurviving": {
        label: "N surviving",
        type: String,
        optional: true
    },
    "endpointGroups.$.incidence": {
        label: "Tumour incidence",
        type: String,
        optional: true
    },
    "endpointGroups.$.multiplicity": {
        label: "Tumour multiplicity",
        type: String,
        optional: true
    },
    "endpointGroups.$.totalTumours": {
        label: "Total tumours",
        type: String,
        optional: true
    },
    incidence_significance: {
        label: "Incidence significance notes",
        type: String,
        optional: true
    },
    multiplicity_significance: {
        label: "Multiplicity significance notes",
        type: String,
        optional: true
    },
    total_tumours_significance: {
        label: "Total tumours significance notes",
        type: String,
        optional: true
    }
}, tblBuilderSchema.base, tblBuilderSchema.table));
