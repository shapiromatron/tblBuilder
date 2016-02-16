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
            printOrganSite: this.printOrganSite(),
        });
        _.each(this.riskEstimates, function(riskEst){
            riskEst.riskFormatted = this.riskFormatter(riskEst);
            riskEst.exposureCategory = utilities.capitalizeFirst(riskEst.exposureCategory);
        }, this);
    },
    printOrganSite: function(){
        if (this.organSite)
            return `${this.organSiteCategory}: ${this.organSite}`;
        return this.organSiteCategory;
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
        'All cancers combined',
        'Bile duct/cholangiocarcinoma',
        'Bile duct/Gallbladder',
        'Bone',
        'Brain',
        'Brain (Acoustic neuroma)',
        'Brain (Astrocytoma)',
        'Brain (Childhood cancer)',
        'Brain (Glioma)',
        'Breast',
        'Breast (Post-Menopausal)',
        'Breast (Pre-Menopausal)',
        'Cervix/uterine cervix',
        'Childhood cancer',
        'CNS (Central nervous system)',
        'Colon',
        'Colon & rectum',
        'Endometrium',
        'Eye',
        'Upper aerodigestive tract',
        'Hepatoblastoma',
        'HL (Hodgkin\'s lymphoma)',
        'Kidney',
        'Kidney (renal cell carcinoma)',
        'Kidney (urinary pelvis/UUT)',
        'Larynx',
        'Leukemia',
        'Leukemia (ALL (Acute lymphoblastic/lymphocytic leukemia))',
        'Leukemia (AML (Acute myeloid leukemia))',
        'Leukemia (Childhood cancer)',
        'Leukemia (CML (Chronic myeloid leukemia))',
        'Leukemia (Lymphoid)',
        'Leukemia (Myeloid)',
        'Lip',
        'Liver and bile ducts',
        'Liver/hepatocellular carcinoma',
        'Lung',
        'Lung (Adenocarcinoma)',
        'Lung (Small cell/Oat cell)',
        'Lung (Squamous cell carcinoma)',
        'Lymphatic and hematopoetic',
        'Malignant melanoma',
        'Mesothelioma',
        'Mesothelioma (peritoneal)',
        'Mesothelioma (pleural)',
        'MM (Multiple myeloma)',
        'Nasal cavity & sinuses',
        'NHL (B-cell lymphoma)',
        'NHL (CLL (chronic lymphocytic leukemia))',
        'NHL (DLBCL (Diffuse large B-cell lymphoma))',
        'NHL (Follicular)',
        'NHL (HCL (Hairy cell leukemia))',
        'NHL (Mantle Cell)',
        'NHL (Non-hodgkin\'s lymphoma)',
        'NHL (SLL/CLL)',
        'NHL (T-cell)',
        'Non-melanoma skin cancer',
        'Oesophagus',
        'Oesophagus (Adenocarcinoma)',
        'Oesophagus (Squamous cell carcinoma)',
        'Oral cavity',
        'Oral/Pharyngeal combined',
        'Osteosarcoma',
        'Other (specify)',
        'Ovary',
        'Ovary (mucinous)',
        'Ovary (others)',
        'Ovary (serous)',
        'Pancreas',
        'Penis',
        'Pharynx',
        'Pharynx (Hypopharynx)',
        'Pharynx (Nasopharynx)',
        'Pharynx (Oropharynx)',
        'Pleura',
        'Prostate',
        'Prostate (Aggressive/Advanced)',
        'Rectum',
        'Respiratory tract',
        'Salivary glands',
        'Skin (basal cell carcinoma)',
        'Skin (non melanoma)',
        'Skin (squamous cell carcinoma)',
        'Small intestine',
        'Soft tissue and bone',
        'Stomach/gastric cancer',
        'STS (Soft tissue sarcoma)',
        'Testis',
        'Testis (non-seminomas)',
        'Testis (seminomas)',
        'Urinary bladder',
        'Uterus/uterine corpus',
    ],
    organSiteCategorySynonyms: {
        'renal': [
            'Kidney',
            'Kidney (renal cell carcinoma)',
            'Kidney (urinary pelvis/UUT)',
        ],
        'large intestine': [
            'Colon',
            'Colon & rectum',
        ],
        'colorect': [
            'Colon & rectum',
        ],
        'Head and neck': [
            'upper aerodigestive tract',
        ],
        'upper digestive tract': [
            'Head and neck',
        ],
        'leukaemia': [
            'Leukemia',
            'Leukemia (ALL (Acute lymphoblastic/lymphocytic leukemia))',
            'Leukemia (AML (Acute myeloid leukemia))',
            'Leukemia (Childhood cancer)',
            'Leukemia (CML (Chronic myeloid leukemia))',
            'Leukemia (Lymphoid)',
            'Leukemia (Myeloid)',
        ],
        'esophagus': [
            'Oesophagus',
            'Oesophagus (Adenocarcinoma)',
            'Oesophagus (Squamous cell carcinoma)',
        ],
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
        label: "Organ site",
        type: String,
        popoverText: "Organ site (controlled vocabulary - select one from list)",
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
