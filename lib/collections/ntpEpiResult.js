var instanceMethods = {
    riskFormatter: function(obj) {
        if (obj.riskMid == null) return "-";
        var txt = obj.riskMid.toString();
        if (_.isFinite(obj.riskLow) && _.isFinite(obj.riskHigh)) {
            txt += ` (${obj.riskLow}–${obj.riskHigh})`;
        }
        if (obj.riskEstimated) txt = `[${txt}]`;
        return txt;
    },
    getDescription: function(){
        if (_.isEmpty(this.description)){
            this.description = NtpEpiDescriptive.findOne(this.parent_id);
        }
        return this.description;
    },

};
NtpEpiResult = new Meteor.Collection('ntpEpiResult', {
    transform: function (doc) {
        return  _.extend(Object.create(instanceMethods), doc);
    },
});

// collection class methods/attributes
_.extend(NtpEpiResult, {
    preSaveHook: function(tmpl, obj) {
        // save epi-results
        delete obj.exposureCategory;
        delete obj.numberExposed;
        delete obj.riskMid;
        delete obj.riskLow;
        delete obj.riskHigh;
        delete obj.riskEstimated;
        delete obj.inTrendTest;
        var trs = tmpl.findAll('.riskEstimateTbody tr');
        obj.riskEstimates = _.map(trs, function(row){
            return clientShared.newValues(row);
        });

        // save variables of concern
        delete obj.vocName;
        delete obj.vocAddressedInStats;
        delete obj.vocSimilarAcrossGroups;
        delete obj.vocCoexposuresAssociated;
        delete obj.vocOtherInformation;
        delete obj.vocStrengthOfAssociation;
        delete obj.vocRuleOutConfounding;
        trs = tmpl.findAll('#variablesOfConcern > tbody > tr');
        obj.variablesOfConcern = _.map(trs, function(row){
            return clientShared.newValues(row);
        });
    },
    variableOfConcernSchema: new SimpleSchema({
        vocName: {
            type: String,
            label: "Variable",
            popoverText: "Based on review of information, identify variables that may be a potential confounder/endpoint specific.",
            typeaheadMethod: "searchNtpEpiVariablesOfConcern",
        },
        vocAddressedInStats: {
            type: String,
            label: "Addressed in stats?",
            popoverText: "<add>",
        },
        vocSimilarAcrossGroups: {
            type: String,
            label: "Similar across groups?",
            popoverText: "<add>",
        },
        vocCoexposuresAssociated: {
            type: String,
            label: "Coexposures associated?",
            popoverText: "<add>",
        },
        vocOtherInformation: {
            type: String,
            label: "Other information",
            popoverText: "<add>",
        },
        vocStrengthOfAssociation: {
            type: String,
            label: "Strength of association",
            popoverText: "<add>",
        },
        vocRuleOutConfounding: {
            type: String,
            label: "Rule out confounding?",
            popoverText: "<add>",
        },
    }),
});

var isNumberOrNR = function() {
    if (this.isSet && (this.value === "NR" || _.isFinite(this.value))) {
        return undefined;
    } else {
        return "numOrNR";
    }
};


tblBuilderCollections.attachSchema(NtpEpiResult, _.extend({
    organSite: {
        label: "Organ site",
        type: String,
        min: 1,
        popoverText: "Specify ICD code where needed for clarity (e.g., for lymphomas)",
        typeaheadMethod: "searchOrganSite",
    },
    effectMeasure: {
        label: "Measure of effect",
        type: String,
        min: 1,
        popoverText: "Risk metric used to display results (SMR, RR, etc.)",
        typeaheadMethod: "searchEffectMeasure",
    },
    effectUnits: {
        label: "Units of effect measurement",
        type: String,
        optional: true,
        popoverText: "Units, if relevant (e.g., risk per 10 μg/m3)",
        typeaheadMethod: "searchEffectUnits",
    },
    trendTest: {
        label: "p-value for trend",
        type: Number,
        decimal: true,
        optional: true,
        popoverText: "Provide p-value for trend-test when reported",
    },
    "riskEstimates.$.exposureCategory": {
        label: "Exposure category or level",
        type: String,
        min: 1,
        popoverText: "E.g., all exposed workers, second quartile of exposure, quantitative exposure level (always provide quantitative information when available)",
    },
    "riskEstimates.$.numberExposed": {
        label: "Exposed cases/deaths",
        type: String,
        custom: isNumberOrNR,
        popoverText: "Deaths/cases for cohort studies; Cases for case-control studies. If unknown, enter \"NR\"",
    },
    "riskEstimates.$.riskMid": {
        label: "Risk estimate",
        type: Number,
        decimal: true,
        optional: true,
        popoverText: "Central risk reported for risk estimate",
    },
    "riskEstimates.$.riskLow": {
        label: "95% lower CI",
        type: Number,
        decimal: true,
        optional: true,
        popoverText: "95% lower confidence interval risk estimate",
    },
    "riskEstimates.$.riskHigh": {
        label: "95% upper CI",
        type: Number,
        decimal: true,
        optional: true,
        popoverText: "95% upper confidence interval risk estimate",
    },
    "riskEstimates.$.riskEstimated": {
        label: "WG calculation?",
        type: Boolean,
        popoverText: "Calculations by the working-group (WG), not study-authors",
    },
    "riskEstimates.$.inTrendTest": {
        label: "Estimate in trend-test",
        type: Boolean,
        popoverText: "Risk estimate included in trend-test",
    },
    covariates: {
        label: "Covariates controlled",
        type: [String],
        minCount: 1,
        popoverText: "List all covariates which were controlled by matching or adjustment in the analysis reported. Enter each covariate individually, and then press <enter> to add it to the list. If no covariates were specified, add \"not-specified\"",
        typeaheadMethod: "searchCovariates",
    },
    covariatesControlledText: {
        label: "Covariates controlled notes",
        type: String,
        optional: true,
        popoverText: "Further describe how covariates were controlled, if needed, such as details on matching methodology or adjustments made",
        textAreaRows: 4,
    },
    notes: {
        label: "General notes",
        type: String,
        optional: true,
        popoverText: "Note issues related to appropriateness of comparison groups, potential for uncontrolled confounding, etc. (e.g. matching criteria for case-control studies)",
        textAreaRows: 4,
    },
    parent_id: {
        type: SimpleSchema.RegEx.Id,
        denyUpdate: true,
    },
    "variablesOfConcern": {
        type: [NtpEpiResult.variableOfConcernSchema],
        minCount: 0,
    },
}, tblBuilderCollections.base, tblBuilderCollections.table));
