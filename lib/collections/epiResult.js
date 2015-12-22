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
    setWordFields: function() {
        _.extend(this, {
            wrd_covariatesList: utilities.capitalizeFirst(this.covariates.join(', ')),
            hasTrendTest: this.trendTest != null,
        });
        _.each(this.riskEstimates, function(riskEst){
            riskEst.riskFormatted = this.riskFormatter(riskEst);
            riskEst.exposureCategory = utilities.capitalizeFirst(riskEst.exposureCategory);
        }, this);
    },
};
EpiResult = new Meteor.Collection('epiResult', {
    transform: function (doc) {
        return  _.extend(Object.create(instanceMethods), doc);
    },
});


// collection class methods/attributes
_.extend(EpiResult, {
    preSaveHook: function(tmpl, obj) {
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
    },
    organSiteCategoryOptions: [
        "ALL (Acute lymphoblastic/lymphocytic leukemia)",
        "AML (Acute myeloid leukemia)",
        "Acoustic neuroma",
        "All cancers combined",
        "B-cell lymphoma",
        "Bile duct",
        "Bladder",
        "Bone",
        "Brain",
        "Breast",
        "CLL (Chronic lymphocytic leukemia)",
        "CML (Chronic myeloid leukemia)",
        "CNS (Central nervous system)",
        "Cervix/uterine cervix",
        "Childhood brain cancer",
        "Childhood cancer",
        "Childhood leukemia",
        "Colon",
        "Colon & rectum/colorectum",
        "DLBCL (Diffuse [large] B-cell lymphoma)",
        "Endometrium",
        "Eye",
        "Gallbladder",
        "Glioma",
        "HCL (Hairy cell leukemia)",
        "Head and neck",
        "Hepatoblastoma",
        "Hodgkin's lymphoma",
        "Hypopharynx",
        "Kidney",
        "Larynx",
        "Leukemia",
        "Lip",
        "Liver and bile ducts",
        "Liver/hepatocellular carcinoma",
        "Lung",
        "Lung (Adenocarcinoma)",
        "Lung (Small cell)",
        "Lung (Squamous cell carcinoma)",
        "Lymphatic and hematopoetic",
        "MM (Multiple myeloma)",
        "Malignant melanoma",
        "Mesothelioma",
        "NHL (Non-hodgkin's lymphoma)",
        "Nasal cavity & sinuses",
        "Nasopharynx",
        "Non-melanoma skin cancer",
        "Oesophagus",
        "Oral cavity",
        "Oropharynx",
        "Osteosarcoma",
        "Ovary",
        "Pancreas",
        "Penis",
        "Pharynx",
        "Pleura",
        "Prostate",
        "Rectum",
        "Respiratory tract",
        "SLL/CLL/MCL (Chronic/small-lymphocytic / mantle cell leukemia)",
        "STS (Soft tissue sarcoma)",
        "Salivary glands",
        "Skin",
        "Small intestine",
        "Soft tissue and bone",
        "Stomach/gastric cancer",
        "T-cell lymphoma",
        "Testis",
        "Uterus/uterine corpus",
    ],
    organSiteCategorySynonyms: {
        'renal': 'Kidney',
    },
});


var isNumberOrNR = function() {
    if (this.isSet && (this.value === "NR" || _.isFinite(this.value))) {
        return undefined;
    } else {
        return "numOrNR";
    }
};

tblBuilderCollections.attachSchema(EpiResult, _.extend({
    organSiteCategory: {
        label: "Organ site category",
        type: String,
        popoverText: "Organ site categories. Please select category from list.",
        allowedValues: EpiResult.organSiteCategoryOptions,
        typeaheadMethod: "searchOrganSiteCategories",
    },
    organSite: {
        label: "Site details",
        type: String,
        optional: true,
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
}, tblBuilderCollections.base, tblBuilderCollections.table));
