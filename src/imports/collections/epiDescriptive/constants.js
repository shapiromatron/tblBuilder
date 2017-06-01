import _ from 'underscore';

let ncc = 'Nested Case-Control',
    cc = 'Case-Control',

    studyDesignOptions = [
        'Cohort',
        ncc,
        cc,
        'Ecological',
    ],
    exposureAssessmentTypeOptions = [
        'Questionnaire',
        'Records',
        'Expert judgement',
        'Quantitative measurements',
        'Other (please specify)',
        'None',
    ],
    isCaseControl = function(val){
        return _.contains([ncc, cc], val);
    },
    hasCohort = function(val){
        // any study designs except case-control
        return val != cc;
    };

export { studyDesignOptions };
export { exposureAssessmentTypeOptions };
export { isCaseControl };
export { hasCohort };
