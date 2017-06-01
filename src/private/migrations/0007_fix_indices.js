/*

The sortIdx values are based on a poor update implementation.

We fix them by sorting by the current sortIdx, and then assigning
a new, unique sortIdx. Now that the sortIdx algorithm for changing has
been fixed, these new, unique sortIdx, should finally be stable.

*/


var fixIndices = function(Cls, tbl_id){
        var i = 0;
        Cls.find({tbl_id: tbl_id}).sort({sortIdx: 1}).forEach(function(d){
            i = i + 1;
            if (d.sortIdx !== i){
                print('Changing', Cls.toString(),
                      ': (tbl_id)', d.tbl_id,
                      ': (_id)', d._id,
                      ': (sortIdx)', d.sortIdx,
                      '->', i);

                Cls.update(
                    {_id: d._id},
                    {$set: {sortIdx: i}},
                    {multi: false}
                );
            }
        });
        print('\n');
    },
    getTables = function(Cls){
        var tbl_ids = Cls.distinct('tbl_id');
        _.each(tbl_ids, function(tbl_id){
            fixIndices(Cls, tbl_id);
        });
    },
    colls = [
        db.exposureEvidence,

        db.epiDescriptive,
        db.epiResult,
        db.ntpEpiDescriptive,
        db.ntpEpiResult,

        db.animalEndpointEvidence,
        db.animalEvidence,
        db.ntpAnimalEndpointEvidence,
        db.ntpAnimalEvidence,

        db.genotoxEvidence,
    ];

_.each(colls, getTables);
