let exposureScenarios = [
        'Occupational',
        'Environmental',
        'Integrated/mixed',
    ],
    samplingApproaches = [
        'Personal',
        'Environmental',
        'Biological',
        'Other',
        'Not-specified',
    ],
    exposureLevelDescriptions = [
        'Arithmetic mean',
        'Geometric mean',
        'Median',
        'Other',
        'Not-reported',
    ],
    isOccupational = function(val){
        return val === 'Occupational';
    };

export { exposureScenarios };
export { samplingApproaches };
export { exposureLevelDescriptions };
export { isOccupational };
