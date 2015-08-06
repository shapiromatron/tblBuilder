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
    },
    tabular: function(tbl_id) {
        var coexposures, data, getResultData, header, i, len, reference, row, rows, v, vals;
        getResultData = function(parent_id, row) {
            var covariates, i, j, len, len1, re, ref, row2, row3, rows, v, vals;
            vals = EpiResult.find({parent_id: parent_id}, {sort: {sortIdx: 1}}).fetch();
            rows = [];
            for (i = 0, len = vals.length; i < len; i++) {
                v = vals[i];
                covariates = v.covariates.join(', ');
                row2 = row.slice();
                row2.push(v._id, v.organSite, v.effectMeasure, v.effectUnits, v.trendTest, covariates, v.covariatesControlledText, v.notes);
                ref = v.riskEstimates;
                for (j = 0, len1 = ref.length; j < len1; j++) {
                    re = ref[j];
                    row3 = row2.slice();
                    row3.push(re.exposureCategory, re.numberExposed, re.riskEstimated, re.riskMid, re.riskLow, re.riskHigh, re.inTrendTest, v.riskFormatter(re));
                    rows.push(row3);
                }
            }
            // set undefined to blank text-string
            return _.map(rows, function(row){
                return _.map(row, function(d){return (d===undefined)? "" : d;});
            });
        };
        vals = EpiDescriptive.find({tbl_id: tbl_id}, {sort: {sortIdx: 1}}).fetch();
        header = ["Descriptive ID", "Reference", "Study design", "Location", "Enrollment or follow-up dates", "Population/eligibility characteristics", "Other population descriptors", "Outcome Data Source", "Population size", "Loss to follow-up (%)", "Type of referent group", "Population cases", "Response rate cases", "Source cases", "Population controls", "Response rate controls", "Source controls", "Exposure assessment type", "Quantitative exposure level", "Exposure assessment notes", "Possible co-exposures", "Principal strengths", "Principal limitations", "General notes", "Result ID", "Organ site", "Effect measure", "Effect measure units", "Trend test", "Covariates", "Covariates notes", "General notes", "Exposure category", "Number exposed", "Risks estimated?", "Risk Mid", "Risk 5% CI", "Risk 95% CI", "In trend-test", "Risk"];
        data = [header];
        for (i = 0, len = vals.length; i < len; i++) {
            v = vals[i];
            reference = Reference.findOne({_id: v.referenceID}).name;
            coexposures = v.coexposures.join(', ');
            row = [v._id, reference, v.studyDesign, v.location, v.enrollmentDates, v.eligibilityCriteria, v.populationDescription, v.outcomeDataSource, v.populationSize, v.lossToFollowUp, v.referentGroup, v.populationSizeCase, v.responseRateCase, v.sourceCase, v.populationSizeControl, v.responseRateControl, v.sourceControl, v.exposureAssessmentType, v.exposureLevel, v.exposureAssessmentNotes, coexposures, v.strengths, v.limitations, v.notes];
            rows = getResultData(v._id, row);
            data.push.apply(data, rows);
        }
        return data;
    },
    defaultAnalysisVisible: [
        "Reference",
        "Study design",
        "Location",
        "Organ site",
        "Effect measure",
        "Exposure category",
        "Risk"
    ]
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
tblBuilderCollections.attachSchema(EpiDescriptive, _.extend({
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
}, tblBuilderCollections.base, tblBuilderCollections.table));
