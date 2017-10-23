var results = [];

db.exposureEvidence.find().forEach(function(exp){
    results.push({
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
