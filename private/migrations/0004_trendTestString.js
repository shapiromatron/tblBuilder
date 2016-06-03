var trendTestString = function(Coll){
    /*
    MIGRATE trendTest
      FROM (null/undefined)
      TO (empty string)
    */
    Coll.find().forEach(function(d){
        if (d.trendTest === null || d.trendTest === undefined){
            print('updating ' + d._id);
            Coll.update({_id: d._id}, {$set: {trendTest: ''}}, {multi: false});
        }
    });
};

trendTestString(db.epiResult);
trendTestString(db.ntpEpiResult);
