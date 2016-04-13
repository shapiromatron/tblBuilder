import {Meteor} from 'meteor/meteor';

import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import _ from 'underscore';


var instanceMethods = {
    getReference: function(){
        if (_.isEmpty(this.reference)){
            this.reference = Reference.findOne(this.referenceID);
        }
        return this.reference;
    },
    isCaseControl: function(){
        return EpiDescriptive.isCaseControl(this.studyDesign);
    },
};
NtpEpiDescriptive = new Meteor.Collection('ntpEpiDescriptive', {
    transform: function (doc) {
        return  _.extend(Object.create(instanceMethods), doc);
    },
});


// collection class methods/attributes
_.extend(NtpEpiDescriptive, {
    studyDesignOptions: [
        'Cohort',
        'Case-Control',
        'Nested Case-Control',
        'Ecological',
    ],
    exposureAssessmentTypeOptions: [
        'JEM',
        'questionnaire',
        'job title',
        'company records',
        'employment in the industry',
        'food frequency questionnaire',
        'personal monitoring',
        'environmental monitoring',
        'modelling',
        'expert assessment',
        'other (specify in exposure assessment notes)',
        'none',
    ],
    ratings: [
        '0',
        '+',
        '++',
        '+++',
    ],
    sortFields: {
        'Reference':    'sortReference',
    },
    sortReference:  libShared.sortByReference,
});


var requiredCohort = function() {
        if ((this.field('studyDesign').value == 'Cohort') &&
            (this.value === '')) return 'required';
    },
    requiredIsntCohort = function() {
        if ((this.field('studyDesign').value !== 'Cohort') &&
            (this.value === '')) return 'required';
    },
    requiredIsntCaseControl = function() {
        if ((this.field('studyDesign').value !== 'Case-Control') &&
            (this.value === '')) return 'required';
    };
tblBuilderCollections.attachSchema(NtpEpiDescriptive, _.extend({
    // #1: General
    referenceID: {
        label: 'Reference',
        type: SimpleSchema.RegEx.Id,
    },
    additionalReferences: {
        label: 'References',
        type: [SimpleSchema.RegEx.Id],
        minCount: 0,
        popoverText: 'References of earlier updates or related publications, such as publications on exposure assessment or other relevant findings from the study population',
    },
    studyDesign: {
        label: 'Study design',
        allowedValues: NtpEpiDescriptive.studyDesignOptions,
        type: String,
        popoverText: 'Study-design used for evaluation (Cohort, Case-Control, Nested-Case Control, etc.)',
    },
    location: {
        label: 'Location',
        type: String,
        min: 1,
        popoverText: 'Country; other information (e.g., region, state, province, city) if important',
    },
    enrollmentDates: {
        label: 'Enrollment dates',
        type: String,
        popoverText: 'Enrollment date for cohort or case-controls',
    },
    // #2: Population
    populationEligibility: {
        label: 'Eligibility criteria',
        type: String,
        textAreaRows: 3,
        popoverText: 'Describe the inclusion/exclusion criteria  (e.g., age, sex, length of employment) for selecting the cohort. Provide information on the subcohort (exposed) as well as the total cohort',
        optional: true,
        custom: requiredIsntCaseControl,
        forceRequiredSymbol: true,
    },
    cohortPopulationSize: {
        label: 'Population size',
        type: String,
        popoverText: 'Number enrolled for cohort studies which were included in the analysis after exclusions',
        optional: true,
        custom: requiredIsntCaseControl,
        forceRequiredSymbol: true,
    },
    referentGroup: {
        label: 'Referent group type',
        type: String,
        popoverText: 'i.e., external vs. internal analysis (or NR if not reported)',
        optional: true,
        custom: requiredIsntCaseControl,
        forceRequiredSymbol: true,
    },
    lossToFollowUp: {
        label: 'Loss to follow up',
        type: String,
        popoverText: 'The proportion of enrolled subjects whose status was unknown at the end of follow-up',
        optional: true,
        custom: requiredIsntCaseControl,
        forceRequiredSymbol: true,
    },
    smrAllCauses: {
        label: 'SMR/SIR all causes/cases',
        type: String,
        popoverText: '<ADD>',
        optional: true,
        custom: requiredCohort,
        forceRequiredSymbol: true,
    },
    otherPopulationDescriptors: {
        label: 'Other population descriptors',
        type: String,
        min: 1,
        textAreaRows: 5,
        popoverText: 'Provide a short definition to describe the cohort or case-control study - Nurses heath study, type of workers/geographical location',
    },
    selectionBiasRating: {
        label: 'Selection bias rating',
        type: String,
        allowedValues: NtpEpiDescriptive.ratings,
        popoverText: 'See RoC handbook/protocol for candidate substance',
    },
    selectionBiasRationale: {
        label: 'Selection bias rationale',
        type: String,
        min: 1,
        textAreaRows: 2,
        popoverText: 'See RoC handbook/protocol for candidate substance',
    },
    selectionDescriptionCases: {
        label: 'Selection description',
        type: String,
        popoverText: 'Describe the inclusion/exclusion criteria for selecting the cases/referent (such as age, dates sex) and the source population (such as geographical location, cancer registry)',
        optional: true,
        custom: requiredIsntCohort,
        forceRequiredSymbol: true,
    },
    selectionDescriptionControls: {
        label: 'Selection description',
        type: String,
        popoverText: 'Describe the inclusion/exclusion criteria for selecting the cases/referent (such as age, dates sex) and the source population (such as geographical location, cancer registry)',
        optional: true,
        custom: requiredIsntCohort,
        forceRequiredSymbol: true,
    },
    populationSizeCases: {
        label: 'Population size',
        type: String,
        popoverText: 'Number of cases/controls in case-control study which were included in the analysis after exclusions',
        optional: true,
        custom: requiredIsntCohort,
        forceRequiredSymbol: true,
    },
    populationSizeControls: {
        label: 'Population size',
        type: String,
        popoverText: 'Number of cases/controls in case-control study which were included in the analysis after exclusions',
        optional: true,
        custom: requiredIsntCohort,
        forceRequiredSymbol: true,
    },
    responseRateCases: {
        label: 'Response rate',
        type: String,
        popoverText: 'Percent of eligible participants included, NR if not-reported',
        optional: true,
        custom: requiredIsntCohort,
        forceRequiredSymbol: true,
    },
    responseRateControls: {
        label: 'Response rate',
        type: String,
        popoverText: 'Percent of eligible participants included, NR if not-reported',
        optional: true,
        custom: requiredIsntCohort,
        forceRequiredSymbol: true,
    },
    // #3: Exposure/outcome
    exposureAssessmentType: {
        label: 'Exposure assessment type',
        type: String,
        allowedValues: NtpEpiDescriptive.exposureAssessmentTypeOptions,
        popoverText: 'Which method was used to estimate agent-exposure?',
    },
    exposureAssessmentNotes: {
        label: 'Exposure assessment notes',
        type: String,
        min: 1,
        textAreaRows: 8,
        popoverText: 'Approach used to estimate exposure, if any (quantitative measurement, JEM questionnaire, expert judgment, biomonitoring, other)',
    },
    exposureAssessmentRating: {
        label: 'Exposure assessment rating',
        type: String,
        allowedValues: NtpEpiDescriptive.ratings,
        popoverText: 'See RoC handbook/protocol for candidate substance',
    },
    exposureAssessmentRationale: {
        label: 'Exposure assessment rationale',
        type: String,
        min: 1,
        textAreaRows: 5,
        popoverText: 'See RoC handbook/protocol for candidate substance',
    },
    exposureMissingData: {
        label: 'Exposure missing data',
        type: String,
        min: 1,
        textAreaRows: 5,
        popoverText: 'Note any missing exposure data for exposure to the candidate substance exposure (includes number of workers sampled if personal sampling used).',
    },
    outcomeDataSource: {
        label: 'Outcome source & methods',
        type: String,
        min: 1,
        textAreaRows: 6,
        popoverText: 'Method of follow-up or source of outcome data (e.g. linkage to national cancer registry, searches of death certificates, insurance records, etc.). Also note methods used to diagnosis disease and classification systems for disease endpoints (such as ICD code version).',
    },
    outcomeMissingData: {
        label: 'Outcome missing data',
        type: String,
        min: 1,
        textAreaRows: 6,
        popoverText: 'Note any missing data on disease.',
    },
    outcomeAssessmentRating: {
        label: 'Outcome assessment rating',
        type: String,
        allowedValues: NtpEpiDescriptive.ratings,
        popoverText: 'See RoC handbook/protocol for candidate substance',
    },
    outcomeAssessmentRationale: {
        label: 'Outcome assessment rationale',
        type: String,
        min: 1,
        textAreaRows: 3,
        popoverText: 'See RoC handbook/protocol for candidate substance',
    },
    // #4: Analysis/reporting
    analyticalMethods: {
        label: 'Analytical methods',
        type: String,
        min: 1,
        textAreaRows: 7,
        popoverText: 'Summarizes the statistical methods used and analyses conducted including information such as the models used, internal/external analyses, exposure-response relationships and statistics to calculate trends',
    },
    analysisRating: {
        label: 'Analysis rating',
        type: String,
        allowedValues: NtpEpiDescriptive.ratings,
        popoverText: 'See RoC handbook/protocol for candidate substance',
    },
    analysisRationale: {
        label: 'Analysis rationale',
        type: String,
        min: 1,
        textAreaRows: 4,
        popoverText: 'See RoC handbook/protocol for candidate substance',
    },
    selectiveReportingRating: {
        label: 'Selective reporting rating',
        type: String,
        allowedValues: NtpEpiDescriptive.ratings,
        popoverText: 'See RoC handbook/protocol for candidate substance',
    },
    selectiveReportingRationale: {
        label: 'Selective reporting rationale',
        type: String,
        min: 1,
        textAreaRows: 4,
        popoverText: 'See RoC handbook/protocol for candidate substance',
    },
    // #5: Sensitivity
    exposureLevel: {
        label: 'Exposure level(s)',
        type: String,
        min: 1,
        popoverText: 'Includes any measurements of levels (area versus population) or biomonitoring data (including time period) of exposure   Also include information on exposure duration, range, etc.',
    },
    exposedCasesOrPower: {
        label: 'Exposed cases or power',
        type: String,
        min: 1,
        textAreaRows: 4,
        popoverText: 'Include information related to statistical power such as exposed cases, prevalence of exposure, etc.',
    },
    followUp: {
        label: 'Follow-up',
        type: String,
        popoverText: 'Include calendar time period, average or range of follow up (years or person years) if available.',
        optional: true,
        custom: requiredCohort,
        forceRequiredSymbol: true,
    },
    sensitivityOther: {
        label: 'Other sensitivity notes',
        type: String,
        min: 1,
        textAreaRows: 4,
        popoverText: 'Include any other types of information (such as analyses) that may effect the sensitivity of the study to detect a true effect.  See RoC handbook/protocol for candidate substances.',
    },
    sensitivityRating: {
        label: 'Sensitivity rating',
        type: String,
        allowedValues: NtpEpiDescriptive.ratings,
        popoverText: 'See RoC handbook/protocol for candidate substance ',
    },
    sensitivityRatingRationale: {
        label: 'Sensitivity rating rationale',
        type: String,
        min: 1,
        textAreaRows: 4,
        popoverText: 'See RoC handbook/protocol for candidate substance ',
    },
    // #6: Study judgment
    strengths: {
        label: 'Principal strengths',
        type: String,
        min: 1,
        popoverText: 'See RoC handbook/protocol for candidate substance; note major strengths.',
        textAreaRows: 4,
    },
    limitations: {
        label: 'Principal limitations',
        type: String,
        min: 1,
        popoverText: 'See RoC handbook/protocol for candidate substance; note major limitations.',
        textAreaRows: 4,
    },
    overallUtility: {
        label: 'Overall utility',
        type: String,
        allowedValues: NtpEpiDescriptive.ratings,
        popoverText: 'See RoC handbook/protocol for candidate substance.',
    },
    // Confounding info
    caseControlMatching: {
        label: 'Matching criteria',
        type: [String],
        minCount: 0,
        popoverText: 'List the factors that the controls were matched on',
        typeaheadMethod: 'searchNtpEpiCaseControlMatching',
    },
    caseControlDiffers: {
        label: 'Differs criteria',
        type: [String],
        minCount: 0,
        popoverText: 'List variables that differ between cases and control such as demographics (i.e. age, sex) or lifestyle (i.e., smoking)',
        typeaheadMethod: 'searchNtpEpiCaseControlDiffers',
    },
    coexposures: {
        label: 'Coexposures',
        type: [String],
        minCount: 0,
        popoverText: 'Possible co-exposures which may potentially confound results.',
        typeaheadMethod: 'searchNtpCoexposures',
    },
    riskFactors: {
        label: 'Risk factors',
        type: [String],
        minCount: 0,
        popoverText: 'Identify risk factors for endpoint with sufficient or limited evidence in humans ',
        typeaheadMethod: 'searchNtpEpiRiskFactors',
    },
    confoundingRating: {
        label: 'Confounding rating',
        type: String,
        allowedValues: NtpEpiDescriptive.ratings,
        popoverText: 'See RoC handbook/protocol for candidate substance ',
    },
    confoundingRatingRationale: {
        label: 'Confounding rating rationale',
        type: String,
        min: 1,
        textAreaRows: 4,
        popoverText: 'See RoC handbook/protocol for candidate substance ',
    },
}, tblBuilderCollections.base, tblBuilderCollections.table));
