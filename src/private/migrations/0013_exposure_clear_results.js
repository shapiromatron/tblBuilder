/*
After migration is complete, remove results from exposure evidence
*/
db.exposureEvidence.find().forEach(function(exp){
    db.exposureEvidence.update(
        { _id: exp._id },
        {
            $unset: {
                agent: '',
                samplingMatrix: '',
                samplingApproach: '',
                numberMeasurements: '',
                measurementDuration: '',
                exposureLevel: '',
                exposureLevelDescription: '',
                exposureLevelRange: '',
                units: '',
            },
        }
    );
});
print('Cleanup complete');
