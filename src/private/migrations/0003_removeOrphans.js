var removeOrphans = function(ChildCollection, ParentCollection){
    /*
    Loop through all objects in a collection. Then, find if the parent_id is
    missing. If it's missing, delete the child.
    */
    ChildCollection
        .find()
        .forEach(function(d){

            var matches = ParentCollection
                            .find({_id: d.parent_id})
                            .count();

            if(matches == 0){
                print('missing: ' + d.parent_id);
                ChildCollection.remove({_id: d._id});
            }

        });
};


removeOrphans(
  db.epiResult,
  db.epiDescriptive);

removeOrphans(
  db.animalEndpointEvidence,
  db.animalEvidence);

removeOrphans(
  db.ntpEpiResult,
  db.ntpEpiDescriptive);
