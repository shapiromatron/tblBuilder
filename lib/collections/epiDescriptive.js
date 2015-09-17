var instanceMethods = {
    isCaseControl: function(){
        return EpiDescriptive.isCaseControl(this.studyDesign);
    },
    setWordFields: function() {
        _.extend(this, {
            reference: Reference.findOne({_id: this.referenceID}),
            isCaseControl: this.isCaseControl(),
            wrd_coexposuresList: this.coexposures.join(', '),
            wrd_notes: this.notes || "",
            wrd_responseRateCase: utilities.getPercentOrText(this.responseRateCase),
            wrd_responseRateControl: utilities.getPercentOrText(this.responseRateControl),
        });

        if (_.isUndefined(this.reference)){
            console.log("missing reference: {0} ({1})".printf(this._id, this.referenceID));
        }
    },
    getReference: function(){
        if (_.isEmpty(this.reference)){
            this.reference = Reference.findOne(this.referenceID);
        }
        return this.reference;
    },
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
                row2.push(
                    v._id, v.organSite, v.effectMeasure,
                    v.effectUnits, v.trendTest, covariates,
                    v.covariatesControlledText, v.notes);
                ref = v.riskEstimates;
                for (j = 0, len1 = ref.length; j < len1; j++) {
                    re = ref[j];
                    row3 = row2.slice();
                    row3.push(
                        re.exposureCategory, re.numberExposed, re.riskEstimated,
                        re.riskMid, re.riskLow, re.riskHigh,
                        re.inTrendTest, v.riskFormatter(re));
                    rows.push(row3);
                }
            }
            // set undefined to blank text-string
            return _.map(rows, function(row){
                return _.map(row, function(d){return (d===undefined)? "" : d;});
            });
        };
        vals = EpiDescriptive.find({tbl_id: tbl_id}, {sort: {sortIdx: 1}}).fetch();
        header = [
            "Descriptive ID", "Reference", "Study design",
            "Location", "Enrollment or follow-up dates", "Population/eligibility characteristics",
            "Other population descriptors", "Outcome Data Source", "Population size",
            "Loss to follow-up (%)", "Type of referent group", "Population cases",
            "Response rate cases", "Source cases", "Population controls",
            "Response rate controls", "Source controls", "Exposure assessment type",
            "Quantitative exposure level", "Exposure assessment notes", "Possible co-exposures",
            "Principal strengths", "Principal limitations", "General notes",

            "Result ID", "Organ site", "Effect measure",
            "Effect measure units", "Trend test", "Covariates",
            "Covariates notes", "General notes",

            "Exposure category", "Number exposed", "Risks estimated?",
            "Risk Mid", "Risk 5% CI", "Risk 95% CI",
            "In trend-test", "Risk"
        ];
        data = [header];
        for (i = 0, len = vals.length; i < len; i++) {
            v = vals[i];
            reference = Reference.findOne({_id: v.referenceID}).name;
            coexposures = v.coexposures.join(', ');
            row = [
                v._id, reference, v.studyDesign,
                v.location, v.enrollmentDates, v.eligibilityCriteria,
                v.populationDescription, v.outcomeDataSource, v.populationSize,
                v.lossToFollowUp, v.referentGroup, v.populationSizeCase,
                v.responseRateCase, v.sourceCase, v.populationSizeControl,
                v.responseRateControl, v.sourceControl, v.exposureAssessmentType,
                v.exposureLevel, v.exposureAssessmentNotes, coexposures,
                v.strengths, v.limitations, v.notes
            ];
            rows = getResultData(v._id, row);
            data.push.apply(data, rows);
        }
        return data;
    },
    tabularMetaAnalysis: function(rows){
        rows.unshift([
            "Reference", "Study design", "Location", "Enrollment or follow-up dates",

            "Organ site", "Effect measure",

            "Exposure category", "Number exposed",
            "Risk Mid", "Risk 5% CI", "Risk 95% CI",
        ]);
        return rows;
    },
    tablularMetaAnalysisRow: function(d){
        var refName = Reference.findOne(d.desc.referenceID).name;
        return [
            refName, d.desc.studyDesign, d.desc.location, d.desc.enrollmentDates,

            d.res.organSite, d.res.effectMeasure,

            d.exposureCategory, d.numberExposed, d.riskLow, d.riskMid, d.riskHigh
        ];
    },
    defaultAnalysisVisible: [
        "Reference",
        "Study design",
        "Location",
        "Organ site",
        "Effect measure",
        "Exposure category",
        "Risk"
    ],
    wordReportFormats: [
        {
          "type": "EpiDescriptiveTables",
          "fn": "epi-descriptive",
          "text": "Download Word (population description)"
        },
        {
          "type": "EpiResultTables",
          "fn": "epi-results",
          "text": "Download Word (results description)"
        },
        {
          "type": "EpiHtmlTables",
          "fn": "epi",
          "text": "Download Word (HTML re-creation)"
        },
    ],
    wordContextByDescription: function(tbl_ids){
        var tables = Tables.find({_id: {$in: tbl_ids}}).fetch(),
            allDescs = EpiDescriptive
                    .find({tbl_id: {$in: tbl_ids}}, {sort: {sortIdx: 1}})
                    .fetch(),
            allResults = EpiResult
                    .find({tbl_id: {$in: tbl_ids}}, {sort: {sortIdx: 1}})
                    .fetch();

        allDescs.forEach(function(d){
            d.setWordFields();
            d.results = _.where(allResults, {parent_id: d._id});
        });

        allResults.forEach(function(d){
            d.setWordFields();
        });

        return {
            "tables": tables,
            "descriptions": allDescs,
        };
    },
    wordContextByResult: function(tbl_ids){
        var tbls = Tables.find({_id: {$in: tbl_ids}}).fetch(),
            allDescs = EpiDescriptive.find({tbl_id: {$in: tbl_ids}}).fetch(),
            allResults = EpiResult.find({tbl_id: {$in: tbl_ids}}).fetch(),
            sites = _.uniq(_.pluck(allResults, "organSite"), false),
            organSites, data;

        allDescs.forEach(function(d){
            d.setWordFields();
        });

        allResults.forEach(function(d){
            d.setWordFields();
            d.descriptive = _.findWhere(allDescs, {_id: d.parent_id});
        });

        organSites = _.map(sites, function(site){
            return {
                "organSite": site,
                "results": _.chain(allResults).where({organSite: site}).value()
            };
        });

        return {
            "tables": tbls,
            "organSites": organSites,
        };
    },
    sortFields: {
        "Reference":    libShared.sortByReference,
        "Study design": _.partial(libShared.sortByTextField, "studyDesign"),
        "Location":     _.partial(libShared.sortByTextField, "location"),
        "Exposure assessment method": _.partial(libShared.sortByTextField, "exposureAssessmentType"),
    },
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
        label: "Enrollment or follow-up dates",
        type: String,
        min: 1,
        popoverText: "Enrollment for case-control studies, follow-up for cohort studies",
    },
    eligibilityCriteria: {
        label: "Population/eligibility characteristics",
        type: String,
        optional: true,
        custom: requiredCohort,
        textAreaRows: 4,
        popoverText: "Any additional criteria for inclusion/exclusion (e.g., age, sex, race, length of employment). In case-control studies, provide for cases and controls.",
        forceRequiredSymbol: true,
    },
    populationDescription: {
        label: "Other population descriptors (if relevant)",
        type: String,
        optional: true,
        textAreaRows: 4,
        popoverText: "Industry or occupation (e.g., transformer repair workers); cohort name (e.g., Nurses' Health Study); source of population (e.g., participants in the population census, registered voters, source cohort for nested case-control studies)",
    },
    outcomeDataSource: {
        label: "Outcome data source",
        type: String,
        optional: true,
        textAreaRows: 4,
        popoverText: "Method of follow-up or source of outcome data (e.g. linkage to national cancer registry, searches of death certificates, insurance records, etc.)",
    },
    populationSize: {
        label: "Population size",
        type: String,
        optional: true,
        custom: requiredCohort,
        defaultValue: null,
        popoverText: "Number enrolled for cohort studies which were included in the analysis after exclusions",
        forceRequiredSymbol: true,
    },
    lossToFollowUp: {
        label: "Loss to follow-up (%)",
        type: String,
        optional: true,
        defaultValue: null,
        popoverText: "The proportion of enrolled subjects whose status was unknown at the end of follow-up",
    },
    referentGroup: {
        label: "Type of referent group",
        type: String,
        optional: true,
        defaultValue: null,
        popoverText: "i.e., external vs. internal analysis",
        placeholderText: "blank if not-reported",
    },
    populationSizeCase: {
        label: "Population size",
        type: String,
        optional: true,
        custom: requiredCC,
        defaultValue: null,
        popoverText: "Number of cases in case-control study which were included in the analysis after exclusions",
        forceRequiredSymbol: true,
    },
    populationSizeControl: {
        label: "Population size",
        type: String,
        optional: true,
        custom: requiredCC,
        defaultValue: null
    },
    responseRateCase: {
        label: "Response rate (%)",
        type: String,
        optional: true,
        defaultValue: null,
        placeholderText: "blank if not-reported",
        popoverText: "Percent of eligible participants included",
    },
    responseRateControl: {
        label: "Response rate (%)",
        type: String,
        optional: true,
        defaultValue: null,
        placeholderText: "blank if not-reported",
    },
    sourceCase: {
        label: "Description and source of cases and controls",
        type: String,
        optional: true,
        custom: requiredCC,
        defaultValue: null,
        popoverText: "Note disease definition and whether incident for cases. For hospital clinical/registry controls note disease(s) if relevant (e.g., other cancers, non-smoking related disease)",
        forceRequiredSymbol: true,
        textAreaRows: 2,
    },
    sourceControl: {
        label: "Description and source of cases and controls",
        type: String,
        optional: true,
        custom: requiredCC,
        defaultValue: null,
        textAreaRows: 2,
    },
    exposureAssessmentType: {
        label: "Exposure assessment type",
        allowedValues: EpiDescriptive.exposureAssessmentTypeOptions,
        type: String,
        popoverText: "Which method was used to estimate agent-exposure?",
    },
    exposureLevel: {
        label: "Quantitative exposure level (if reported)",
        type: String,
        optional: true,
        popoverText: "Average quantitative exposure-level or range, if reported",
    },
    exposureAssessmentNotes: {
        label: "Exposure assessment notes",
        type: String,
        optional: true,
        popoverText: "Approach used to estimate exposure, if any (quantitative measurement, JEM questionnaire, expert judgment, biomonitoring, other)",
        textAreaRows: 4,
    },
    coexposures: {
        label: "Possible co-exposures",
        type: [String],
        popoverText: "Possible co-exposures which may potentially confound results.",
        typeaheadMethod: "searchCoexposures"
    },
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
    notes: {
        label: "Comments",
        type: String,
        optional: true,
        popoverText: "Any other general comments related to the study",
        textAreaRows: 3,
    }
}, tblBuilderCollections.base, tblBuilderCollections.table));
