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
    ]
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
