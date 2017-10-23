/*
Move the result data from exposureEvidence collection
to exposureResult collection.
*/

var results = [];

db.exposureEvidence.find().forEach(function(exp){

    // set the _id equal to other ID since if we let the db do it, it doesn't
    // use a string-based ID, and we know that the ids being generated are
    // unique for this collection since they were unique for the other collection.

    results.push({
        _id: exp._id,

        parent_id: exp._id,
        tbl_id: exp.tbl_id,
        sortIdx: 1,

        user_id: exp.user_id,
        created: exp.created,
        lastUpdated: exp.lastUpdated,

        agent: exp.agent,
        samplingMatrix: exp.samplingMatrix,
        samplingApproach: exp.samplingApproach,
        numberMeasurements: exp.numberMeasurements,
        measurementDuration: exp.measurementDuration,

        exposureLevel: exp.exposureLevel,
        exposureLevelDescription: exp.exposureLevelDescription,
        exposureLevelRange: exp.exposureLevelRange,
        units: exp.units,

        isHidden: exp.isHidden,

        isQA: exp.isQA,
        timestampQA: exp.timestampQA,
        user_id_QA: exp.user_id_QA,
    });
});

db.exposureResult.drop();
db.exposureResult.insert(results);
print('Created ' + results.length + ' exposure results');

