let studyDesignOptions = [
        'Cohort',
        'Case-Control',
        'Nested Case-Control',
        'Ecological',
    ],
    exposureAssessmentTypeOptions = [
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
    ratings = [
        '0',
        '+',
        '++',
        '+++',
    ],
    biasDirection = [
        '⬆',
        '⬇',
        '⬌',
    ],
    biasDirectionPopoverText = 'Direction of bias effect (⬆ = away from null, ⬇ = towards null, ⬌ no change)';


export { studyDesignOptions };
export { exposureAssessmentTypeOptions };
export { ratings };
export { biasDirection };
export { biasDirectionPopoverText };
