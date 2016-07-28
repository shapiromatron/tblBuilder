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
        'JEM',
        'biomarker',
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
