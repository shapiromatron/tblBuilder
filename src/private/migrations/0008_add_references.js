var addReferences = function(Coll){
        print('Adding references to: ' + Coll);
        print('Reviewing: ' + Coll.count() + ' objects');
        Coll.find().forEach(function(d){
            if (d.additionalReferences === undefined){
                print('updating ' + d._id);
                Coll.update(
                    {_id: d._id},
                    {$set: {additionalReferences: []}},
                    {multi: false}
                );
            }
        });
    },
    updateReferenceName = function(){
        var oldName = 'M3: Indium trioxide',
            newName = 'M3: Indium tin oxide';

        var x = db.reference.update(
            {monographAgent: oldName},
            {$addToSet: {monographAgent: newName}},
            {multi: true}
        );
        print('Renaming: "' + oldName + '" -> "' + newName + '"');
        print(x);

    },
    colls = [
        db.exposureEvidence,
        db.ntpAnimalEvidence,
        db.animalEvidence,
        db.ntpEpiDescriptive,
        db.epiDescriptive,
        db.genotoxEvidence,
    ];

_.each(colls, addReferences);
updateReferenceName();
