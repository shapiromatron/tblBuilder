var addAdditionalResults = function(Coll){
    /*
    MIGRATE additionalResults
      FROM (null/undefined)
      TO (empty string)
    */
    Coll.find().forEach(function(d){
        if (d.additionalResults === null || d.additionalResults === undefined){
            print('updating ' + d._id);
            Coll.update(
                {_id: d._id},
                {$set: {additionalResults: ''}},
                {multi: false}
            );
        }
    });
};


_.each(db.ntpEpiResult, addAdditionalResults);
