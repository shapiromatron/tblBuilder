var addStratum = function(Coll){
    /*
    MIGRATE stratum
      FROM (undefined)
      TO (empty string)
    */
    Coll.find().forEach(function(d){
        if (d.stratum === undefined){
            print('updating ' + d._id);
            Coll.update(
                {_id: d._id},
                {$set: {stratum: ''}},
                {multi: false}
            );
        }
    });
};

addStratum(db.epiResult);
