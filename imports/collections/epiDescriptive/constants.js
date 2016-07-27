import _ from 'underscore';

let studyDesignOptions = [
        'Cohort',
        'Nested Case-Control',
        'Case-Control',
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
        return _.contains(
            ['Case-Control', 'Nested Case-Control'],
            val
        );
    };

export { studyDesignOptions };
export { exposureAssessmentTypeOptions };
export { isCaseControl };
