db.ntpEpiResult.find().forEach(function(d){
    if (d.additionalResults === null || d.additionalResults === undefined){
        print('updating ' + d._id);
        db.ntpEpiResult.update(
            {_id: d._id},
            {$set: {additionalResults: ''}},
            {multi: false}
        );
    }
});

db.ntpEpiDescriptive.find().forEach(function(d){
    if (d.additionalResults === null || d.additionalResults === undefined){
        print('updating ' + d._id);
        db.ntpEpiDescriptive.update(
            {_id: d._id},
            {$set: {confidenceInEvidence: ''}},
            {multi: false}
        );
    }
});

print('Added additionalResults to ' + db.ntpEpiResult.count() + ' ntpEpiResult');
print('Added confidenceInEvidence to ' + db.ntpEpiDescriptive.count() + ' ntpEpiDescriptives');
