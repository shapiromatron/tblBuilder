var instanceMethods = {
    isCaseControl: function(){
        return EpiDescriptive.isCaseControl(this.studyDesign);
    }
};
EpiDescriptive = new Meteor.Collection('epiDescriptive', {
  transform: function (doc) {
    return  _.extend(Object.create(instanceMethods), doc);
  }
});


// collection class methods/attributes
_.extend(EpiDescriptive, {
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
});


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
