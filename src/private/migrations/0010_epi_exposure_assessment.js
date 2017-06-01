/*
IARC changed exposure assessment type categories. This script converts
values from the old field values to the new field values.
*/

var crosswalks = [
        ['JEM', 'Expert judgement'],
        ['biomarker', 'Quantitative measurements'],
        ['questionnaire', 'Questionnaire'],
        ['job title', 'Questionnaire'],
        ['company records', 'Records'],
        ['employment in the industry', 'Records'],
        ['food frequency questionnaire', 'Questionnaire'],
        ['personal monitoring', 'Quantitative measurements'],
        ['environmental monitoring', 'Quantitative measurements'],
        ['modelling', 'Quantitative measurements'],
        ['expert assessment', 'Expert judgement'],
        ['other (specify in exposure assessment notes)', 'Other (please specify)'],
        ['none', 'None'],
    ],
    res;

crosswalks.forEach(function(cw){

    res = db.epiDescriptive.update(
        {exposureAssessmentType: cw[0]},
        {$set: {exposureAssessmentType: cw[1]}},
        {multi: true}
    );

    print(cw[0] + ' to ' + cw[1] + ': ' + res);

});
