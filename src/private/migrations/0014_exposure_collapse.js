/*
If all descriptive data are identical, merge rows in exposure table.
*/

var tbl_ids = db.exposureEvidence.distinct('tbl_id'),
    collapseRelatedExposures = function(objs){
        var to_delete = [];
        for (var i=0; i<objs.length; i++) {
            var obj1 = objs[i];
            if (_.contains(to_delete, obj1._id)){
                break;
            }
            for (var j=i+1; j<objs.length; j++) {
                var obj2 = objs[j];
                if (
                        obj1.referenceID === obj2.referenceID &&
                        obj1.exposureScenario === obj2.exposureScenario &&
                        obj1.collectionDate === obj2.collectionDate &&
                        obj1.occupation === obj2.occupation &&
                        obj1.occupationInfo === obj2.occupationInfo &&
                        obj1.country === obj2.country &&
                        obj1.location === obj2.location &&
                        obj1.comments === obj2.comments
                    ){
                    to_delete.push(obj2._id);
                    var  x = db.exposureResult.update(
                        {parent_id: obj2._id},
                        {$set: {parent_id: obj1._id}},
                        {multi: true}
                    );
                    print(x);
                }
            }
        }
        if(to_delete.length>0){
            db.exposureEvidence.remove(
                {_id: {$in: to_delete}},
                {multi: true}
            );
            print('Removing ' + to_delete.length + ' items');
        }
    },
    loopItemsInTable = function(tbl_id){
        var reference_ids = db.exposureEvidence.distinct('referenceID', {tbl_id: tbl_id});
        reference_ids.forEach(function(reference_id){
            var objs = db.exposureEvidence
                         .find({tbl_id: tbl_id, referenceID: reference_id})
                         .toArray();
            if (objs.length>1){
                collapseRelatedExposures(objs);
            }
        });
    };

tbl_ids.forEach(loopItemsInTable);

var results = db.exposureResult.find().toArray(),
    resultsGroups = _.chain(results)
        .groupBy('parent_id')
        .values()
        .filter(function(d){return d.length>1})
        .value(),
    resetSortIndex = function(results){
        for(var i=0; i<results.length; i++){
            if(results[i].sortIdx != i + 1){
                db.exposureResult.update(
                    {_id: results[i]._id},
                    {$set: {sortIdx: i + 1}}
                );
            }
        }
    };

resultsGroups.forEach(resetSortIndex);
