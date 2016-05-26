let studyDesignOptions = [
        'Cohort',
        'Case-Control',
        'Nested Case-Control',
        'Ecological',
    ],
    exposureAssessmentTypeOptions = [
        '<add>',
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
        '<add>',
        '0',
        '+',
        '++',
        '+++',
    ],
    biasDirection = [
        '<add>',
        '⬆',
        '⬇',
        '⬌',
    ],
    biasDirectionPopoverText = 'Direction of bias effect (⬆ = away from null, ⬇ = towards null, ⬌ no change/unknown)',
    ratingRationalePopoverText = 'See RoC handbook/protocol for candidate substance';


export { studyDesignOptions };
export { exposureAssessmentTypeOptions };
export { ratings };
export { biasDirection };
export { biasDirectionPopoverText };
export { ratingRationalePopoverText };
