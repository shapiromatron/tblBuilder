db.epiDescriptive.find().forEach(function(d){
    db.epiDescriptive.update(
        {_id: d._id},
        {$set: {
            extractExposureDetails: false,
            exposureAssessmentPopulationDetails: '',
            exposureAssessmentStrengths: '',
            exposureAssessmentLimitations: '',
            exposureAssessmentComments: '',
        }},
        {multi: false}
    );
});

print('Added exposure fields to ' + db.epiDescriptive.count() + ' epiDescriptive');
