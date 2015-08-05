var epiClsMethods = {
        studyDesignOptions: [
            "Cohort",
            "Nested Case-Control",
            "Case-Control",
            "Ecological"
        ],
        exposureAssessmentTypeOptions: [
            "JEM",
            "questionnaire",
            "company records",
            "food frequency questionnaire",
            "personal monitoring",
            "environmental monitoring",
            "modelling",
            "expert assessment",
            "other (specify in exposure assessment notes)"
        ],
        isCaseControl: function(val){
            var list = ["Case-Control", "Nested Case-Control"];
            return _.contains(list, val);
        }
    },
    epiInstanceMethods = {
        isCaseControl: function(){
            return EpiDescriptive.isCaseControl(this.studyDesign);
        }
    },
    resClsMethods = {},
    resInstanceMethods = {};


EpiDescriptive = new Meteor.Collection('epiDescriptive', {
  transform: function (doc) {
    return  _.extend(Object.create(epiInstanceMethods), doc);
  }
});
_.extend(EpiDescriptive, epiClsMethods);


EpiResult = new Meteor.Collection('epiResult', {
  transform: function (doc) {
    return  _.extend(Object.create(resInstanceMethods), doc);
  }
});
_.extend(EpiResult, resClsMethods);


var requiredCC = function() {
        var isRequired = (EpiDescriptive.isCaseControl(this.field('studyDesign').value)) &&
                (this.value === "");
        if (isRequired) return "required";
    },
    requiredCohort = function() {
        var isRequired = (!EpiDescriptive.isCaseControl(this.field('studyDesign').value)) &&
                (this.value === "");
        if (isRequired) return "required";
    };
tblBuilderSchema.attachSchema(EpiDescriptive, _.extend({
    referenceID: {
        label: "Reference",
        type: SimpleSchema.RegEx.Id
    },
    studyDesign: {
        label: "Study design",
        allowedValues: EpiDescriptive.studyDesignOptions,
        type: String
    },
    location: {
        label: "Location",
        type: String,
        min: 1
    },
    enrollmentDates: {
        label: "Enrollment or follow-up dates",
        type: String,
        min: 1
    },
    eligibilityCriteria: {
        label: "Population/eligibility characteristics",
        type: String,
        optional: true,
        custom: requiredCohort
    },
    populationDescription: {
        label: "Other population descriptors",
        type: String,
        optional: true
    },
    outcomeDataSource: {
        label: "Outcome data source",
        type: String,
        optional: true
    },
    populationSize: {
        label: "Population size",
        type: String,
        optional: true,
        custom: requiredCohort,
        defaultValue: null
    },
    lossToFollowUp: {
        label: "Loss to follow-up (%)",
        type: String,
        optional: true,
        defaultValue: null
    },
    referentGroup: {
        label: "Type of referent group",
        type: String,
        optional: true,
        defaultValue: null
    },
    populationSizeCase: {
        label: "Population size (cases)",
        type: String,
        optional: true,
        custom: requiredCC,
        defaultValue: null
    },
    populationSizeControl: {
        label: "Population size (controls)",
        type: String,
        optional: true,
        custom: requiredCC,
        defaultValue: null
    },
    responseRateCase: {
        label: "Response rate (cases)",
        type: String,
        optional: true,
        defaultValue: null
    },
    responseRateControl: {
        label: "Response rate (controls)",
        type: String,
        optional: true,
        defaultValue: null
    },
    sourceCase: {
        label: "Source of cases",
        type: String,
        optional: true,
        custom: requiredCC,
        defaultValue: null
    },
    sourceControl: {
        label: "Source of controls",
        type: String,
        optional: true,
        custom: requiredCC,
        defaultValue: null
    },
    exposureAssessmentType: {
        label: "Exposure assessment type",
        allowedValues: EpiDescriptive.exposureAssessmentTypeOptions,
        type: String
    },
    exposureLevel: {
        label: "Exposure level",
        type: String,
        optional: true
    },
    exposureAssessmentNotes: {
        label: "Exposure assessment comments",
        type: String,
        optional: true
    },
    coexposures: {
        label: "Possible co-exposures",
        type: [String]
    },
    strengths: {
        label: "Principal strengths",
        type: String,
        min: 1
    },
    limitations: {
        label: "Principal limitations",
        type: String,
        min: 1
    },
    notes: {
        label: "General notes",
        type: String,
        optional: true
    }
}, tblBuilderSchema.base, tblBuilderSchema.table));


var isNumberOrNR = function() {
  if (this.isSet && (this.value === "NR" || isFinite(this.value))) {
    return undefined;
  } else {
    return "numOrNR";
  }
}, extraNTP = {};

if (Meteor.settings["public"].context === "ntp") {
    extraNTP = {
        printCaption: {
            label: "Table caption",
            type: String,
            optional: true
        },
        printOrder: {
            label: "Table print order",
            type: Number,
            decimal: true,
            optional: true
        }
    };
};

tblBuilderSchema.attachSchema(EpiResult, _.extend({
    organSite: {
        label: "Organ site (ICD code)",
        type: String,
        min: 1
    },
    effectMeasure: {
        label: "Measure of effect",
        type: String,
        min: 1
    },
    effectUnits: {
        label: "Units of effect measurement",
        type: String,
        optional: true
    },
    trendTest: {
        label: "p-value for trend",
        type: Number,
        decimal: true,
        optional: true
    },
    "riskEstimates.$.exposureCategory": {
        label: "Exposure category or level",
        type: String,
        min: 1
    },
    "riskEstimates.$.numberExposed": {
        label: "Exposed cases/deaths",
        type: String,
        custom: isNumberOrNR
    },
    "riskEstimates.$.riskMid": {
        label: "Risk estimate",
        type: Number,
        decimal: true,
        optional: true
    },
    "riskEstimates.$.riskLow": {
        label: "95% lower CI",
        type: Number,
        decimal: true,
        optional: true
    },
    "riskEstimates.$.riskHigh": {
        label: "95% upper CI",
        type: Number,
        decimal: true,
        optional: true
    },
    "riskEstimates.$.riskEstimated": {
        label: "Working-group calculation",
        type: Boolean
    },
    "riskEstimates.$.inTrendTest": {
        label: "Estimate in Trend Test",
        type: Boolean
    },
    covariates: {
        label: "Covariates controlled",
        type: [String],
        minCount: 1
    },
    covariatesControlledText: {
        label: "Covariates controlled notes",
        type: String,
        optional: true
    },
    notes: {
        label: "General notes",
        type: String,
        optional: true
    },
    parent_id: {
        type: SimpleSchema.RegEx.Id,
        denyUpdate: true
    }
}, extraNTP, tblBuilderSchema.base, tblBuilderSchema.table));
