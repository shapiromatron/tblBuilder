import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import {
    studyDesignOptions,
    exposureAssessmentTypeOptions,
    isCaseControl,
    hasCohort,
} from './constants';


var requiredCC = function() {
        var isRequired = (isCaseControl(this.field('studyDesign').value)) &&
                (this.value === '');
        if (isRequired) return 'required';
    },
    requiredCohort = function() {
        var isRequired = (!isCaseControl(this.field('studyDesign').value)) &&
                (this.value === '');
        if (isRequired) return 'required';
    },
    requiredContainsCohort = function() {
        var isRequired = (hasCohort(this.field('studyDesign').value)) &&
                (this.value === '');
        if (isRequired) return 'required';
    };

export default {
    referenceID: {
        label: 'Reference',
        type: SimpleSchema.RegEx.Id,
    },
    studyDesign: {
        label: 'Study design',
        allowedValues: studyDesignOptions,
        type: String,
        forceRequiredSymbol: true,
        popoverText: 'Study-design used for evaluation (Cohort, Case-Control, Nested-Case Control, etc.)',
    },
    location: {
        label: 'Location',
        type: String,
        min: 1,
        popoverText: 'Country; other information (e.g., region, state, province, city) if important',
    },
    enrollmentDates: {
        label: 'Enrollment and follow-up dates',
        type: String,
        min: 1,
        popoverText: 'For case-control studies, enter only enrollment date',
    },
    eligibilityCriteria: {
        label: 'Population/eligibility characteristics',
        type: String,
        optional: true,
        custom: requiredContainsCohort,
        textAreaRows: 4,
        popoverText: 'Any additional criteria for inclusion/exclusion (e.g., age, sex, race, length of employment). For nested case-control studies, specify the cohort.',
        forceRequiredSymbol: true,
    },
    populationDescription: {
        label: 'Other population descriptors (if relevant)',
        type: String,
        optional: true,
        textAreaRows: 4,
        popoverText: 'Industry or occupation (e.g., transformer repair workers); cohort name (e.g., Nurses\' Health Study); source of population (e.g., participants in the population census, registered voters, source cohort for nested case-control studies)',
    },
    outcomeDataSource: {
        label: 'Outcome data source',
        type: String,
        optional: true,
        textAreaRows: 4,
        popoverText: 'Method of follow-up or source of outcome data (e.g. linkage to national cancer registry, searches of death certificates, insurance records, etc.)',
    },
    populationSize: {
        label: 'Population size',
        type: String,
        optional: true,
        custom: requiredCohort,
        defaultValue: null,
        popoverText: 'Number enrolled for cohort studies which were included in the analysis after exclusions',
        forceRequiredSymbol: true,
    },
    lossToFollowUp: {
        label: 'Loss to follow-up (%)',
        type: String,
        optional: true,
        defaultValue: null,
        popoverText: 'The proportion of enrolled subjects whose status was unknown at the end of follow-up',
    },
    referentGroup: {
        label: 'Type of referent group',
        type: String,
        optional: true,
        defaultValue: null,
        popoverText: 'i.e., external vs. internal analysis',
        placeholderText: 'blank if not-reported',
    },
    populationSizeCase: {
        label: 'Population size',
        type: String,
        optional: true,
        custom: requiredCC,
        defaultValue: null,
        popoverText: 'Number of cases in case-control study which were included in the analysis after exclusions',
        forceRequiredSymbol: true,
    },
    populationSizeControl: {
        label: 'Population size',
        type: String,
        optional: true,
        custom: requiredCC,
        defaultValue: null,
    },
    responseRateCase: {
        label: 'Response rate (%)',
        type: String,
        optional: true,
        defaultValue: null,
        placeholderText: 'blank if not-reported',
        popoverText: 'Percent of eligible participants included',
    },
    responseRateControl: {
        label: 'Response rate (%)',
        type: String,
        optional: true,
        defaultValue: null,
        placeholderText: 'blank if not-reported',
    },
    sourceCase: {
        label: 'Description and source of cases and controls',
        type: String,
        optional: true,
        custom: requiredCC,
        defaultValue: null,
        popoverText: 'Note disease definition and whether incident for cases. For hospital clinical/registry controls note disease(s) if relevant (e.g., other cancers, non-smoking related disease)',
        forceRequiredSymbol: true,
        textAreaRows: 2,
    },
    sourceControl: {
        label: 'Description and source of cases and controls',
        type: String,
        optional: true,
        custom: requiredCC,
        defaultValue: null,
        textAreaRows: 2,
    },
    exposureAssessmentType: {
        label: 'Exposure assessment type',
        allowedValues: exposureAssessmentTypeOptions,
        type: String,
        forceRequiredSymbol: true,
        popoverText: 'Which method was used to estimate agent-exposure?',
    },
    exposureAssessmentNotes: {
        label: 'Exposure assessment notes',
        type: String,
        optional: true,
        popoverText: 'Approach used to estimate exposure, if any (quantitative measurement, JEM questionnaire, expert judgment, biomonitoring, other)',
        textAreaRows: 4,
    },
    strengths: {
        label: 'Principal strengths',
        type: String,
        min: 1,
        popoverText: 'Any study-strengths should be described here.',
        textAreaRows: 3,
    },
    limitations: {
        label: 'Principal limitations',
        type: String,
        min: 1,
        popoverText: 'Limitations to consider include the extent to which chance, bias, and confounding could explain the results.',
        textAreaRows: 3,
    },
    notes: {
        label: 'Comments',
        type: String,
        optional: true,
        popoverText: 'Any other general comments related to the study',
        textAreaRows: 3,
    },
};
