var instanceMethods = {};
NtpEpiDescriptive = new Meteor.Collection('ntpEpiDescriptive', {
  transform: function (doc) {
    return  _.extend(Object.create(instanceMethods), doc);
  }
});


// collection class methods/attributes
_.extend(NtpEpiDescriptive, {
    studyDesignOptions: [
        "Cohort",
        "Case-Control",
        "Nested Case-Control",
        "Ecological",
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
    ratings: [
        "++",
        "+",
        "-",
        "--",
    ]
});


var requiredCohort = function() {
        if ((this.field('studyDesign').value == "Cohort") &&
            (this.value === "")) return "required";
    },
    requiredIsntCohort = function() {
        if ((this.field('studyDesign').value !== "Cohort") &&
            (this.value === "")) return "required";
    },
    requiredIsntCaseControl = function() {
        if ((this.field('studyDesign').value !== "Case-Control") &&
            (this.value === "")) return "required";
    };
tblBuilderCollections.attachSchema(NtpEpiDescriptive, _.extend({
    // #1: General
    referenceID: {
        label: "Reference",
        type: SimpleSchema.RegEx.Id
    },
    additionalReferences: {
        label: "References",
        type: [SimpleSchema.RegEx.Id],
        minCount: 0,
        popoverText: "Add here",
    },
    studyDesign: {
        label: "Study design",
        allowedValues: NtpEpiDescriptive.studyDesignOptions,
        type: String,
        popoverText: "Study-design used for evaluation (Cohort, Case-Control, Nested-Case Control, etc.)",
    },
    location: {
        label: "Location",
        type: String,
        min: 1,
        popoverText: "Country; other information (e.g., region, state, province, city) if important",
    },
    enrollmentDates: {
        label: "Enrollment dates",
        type: String,
        popoverText: "<ADD>",
        optional: true,
        custom: requiredIsntCohort,
        forceRequiredSymbol: true,
    },
    // #2: Population
    populationEligibility: {
        label: "Population/ eligibility",
        type: String,
        textAreaRows: 3,
        popoverText: "<ADD>",
        optional: true,
        custom: requiredIsntCaseControl,
        forceRequiredSymbol: true,
    },
    cohortPopulationSize: {
        label: "Population size",
        type: String,
        popoverText: "<ADD>",
        optional: true,
        custom: requiredIsntCaseControl,
        forceRequiredSymbol: true,
    },
    referentGroup: {
        label: "Referent group type",
        type: String,
        popoverText: "<ADD>",
        optional: true,
        custom: requiredIsntCaseControl,
        forceRequiredSymbol: true,
    },
    lossToFollowUp: {
        label: "Loss to follow up",
        type: String,
        popoverText: "<ADD>",
        optional: true,
        custom: requiredIsntCaseControl,
        forceRequiredSymbol: true,
    },
    smrAllCauses: {
        label: "SMR/SIR all causes/cases",
        type: String,
        popoverText: "<ADD>",
        optional: true,
        custom: requiredCohort,
        forceRequiredSymbol: true,
    },
    otherPopulationDescriptors: {
        label: "Other population descriptors",
        type: String,
        min: 1,
        textAreaRows: 3,
        popoverText: "<ADD>",
    },
    selectionBiasRating: {
        label: "Selection bias rating",
        type: String,
        allowedValues: NtpEpiDescriptive.ratings,
        popoverText: "<ADD>",
    },
    selectionBiasRationale: {
        label: "Selection bias rationale",
        type: String,
        min: 1,
        textAreaRows: 2,
        popoverText: "<ADD>",
    },
    selectionDescriptionCases: {
        label: "Selection description",
        type: String,
        popoverText: "<ADD>",
        optional: true,
        custom: requiredIsntCohort,
        forceRequiredSymbol: true,
    },
    selectionDescriptionControls: {
        label: "Selection description",
        type: String,
        popoverText: "<ADD>",
        optional: true,
        custom: requiredIsntCohort,
        forceRequiredSymbol: true,
    },
    populationSizeCases: {
        label: "Population size",
        type: String,
        popoverText: "<ADD>",
        optional: true,
        custom: requiredIsntCohort,
        forceRequiredSymbol: true,
    },
    populationSizeControls: {
        label: "Population size",
        type: String,
        popoverText: "<ADD>",
        optional: true,
        custom: requiredIsntCohort,
        forceRequiredSymbol: true,
    },
    responseRateCases: {
        label: "Response rate",
        type: String,
        popoverText: "<ADD>",
        optional: true,
        custom: requiredIsntCohort,
        forceRequiredSymbol: true,
    },
    responseRateControls: {
        label: "Response rate",
        type: String,
        popoverText: "<ADD>",
        optional: true,
        custom: requiredIsntCohort,
        forceRequiredSymbol: true,
    },
    // #3: Exposure/outcome
    exposureAssessmentType: {
        label: "Exposure assessment type",
        type: String,
        allowedValues: NtpEpiDescriptive.exposureAssessmentTypeOptions,
        popoverText: "<ADD>",
    },
    exposureAssessmentDetails: {
        label: "Exposure assessment details",
        type: String,
        min: 1,
        textAreaRows: 2,
        popoverText: "<ADD>",
    },
    exposureAssessmentRating: {
        label: "Exposure assessment",
        type: String,
        allowedValues: NtpEpiDescriptive.ratings,
        popoverText: "<ADD>",
    },
    exposureAssessmentRationale: {
        label: "Exposure assessment rationale",
        type: String,
        min: 1,
        textAreaRows: 2,
        popoverText: "<ADD>",
    },
    outcomeDataSource: {
        label: "Outcome data source",
        type: String,
        min: 1,
        textAreaRows: 5 ,
        popoverText: "<ADD>",
    },
    outcomeAssessmentRating: {
        label: "Outcome assessment rating",
        type: String,
        allowedValues: NtpEpiDescriptive.ratings,
        popoverText: "<ADD>",
    },
    outcomeAssessmentRationale: {
        label: "Outcome assessment rationale",
        type: String,
        min: 1,
        textAreaRows: 2,
        popoverText: "<ADD>",
    },
    // #4: Analysis/reporting
    analysisRating: {
        label: "Analysis rating",
        type: String,
        allowedValues: NtpEpiDescriptive.ratings,
        popoverText: "<ADD>",
    },
    analysisRationale: {
        label: "Analysis rationale",
        type: String,
        min: 1,
        textAreaRows: 2,
        popoverText: "<ADD>",
    },
    selectiveReportingRating: {
        label: "Selective reporting rating",
        type: String,
        allowedValues: NtpEpiDescriptive.ratings,
        popoverText: "<ADD>",
    },
    selectiveReportingRationale: {
        label: "Selective reporting rationale",
        type: String,
        min: 1,
        textAreaRows: 2,
        popoverText: "<ADD>",
    },
    // #5: Sensitivity
    exposedCasesOrPower: {
        label: "Exposed cases or power",
        type: String,
        min: 1,
        popoverText: "<ADD>",
    },
    exposureLevel: {
        label: "Exposure level(s)",
        type: String,
        min: 1,
        popoverText: "<ADD>",
    },
    followUpDates: {
        label: "Follow-up dates",
        type: String,
        popoverText: "<ADD>",
        optional: true,
        custom: requiredCohort,
        forceRequiredSymbol: true,
    },
    sensitivityRating: {
        label: "Sensitivity rating",
        type: String,
        allowedValues: NtpEpiDescriptive.ratings,
        popoverText: "<ADD>",
    },
    sensitivityRatingRationale: {
        label: "Sensitivity rating rationale",
        type: String,
        min: 1,
        textAreaRows: 2,
        popoverText: "<ADD>",
    },
    // #6: Study judgment
    strengths: {
        label: "Principal strengths",
        type: String,
        min: 1,
        popoverText: "Any study-strengths should be described here.",
        textAreaRows: 3,
    },
    limitations: {
        label: "Principal limitations",
        type: String,
        min: 1,
        popoverText: "Limitations to consider include the extent to which chance, bias, and confounding could explain the results.",
        textAreaRows: 3,
    },
    overallUtility: {
        label: "Overall utility",
        type: String,
        allowedValues: NtpEpiDescriptive.ratings,
        popoverText: "<ADD>",
    }
}, tblBuilderCollections.base, tblBuilderCollections.table));
