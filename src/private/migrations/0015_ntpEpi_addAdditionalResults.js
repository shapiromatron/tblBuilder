var res;

db.ntpEpiResult.find().forEach(function(d){
    if (d.additionalResults === null || d.additionalResults === undefined){
        res = db.ntpEpiResult.update(
            {_id: d._id},
            {$set: {additionalResults: ''}},
            {multi: false}
        );
        print(res);
    }
});

db.ntpEpiDescriptive.find().forEach(function(d){
    if (d.additionalResults === null || d.additionalResults === undefined){
        res = db.ntpEpiDescriptive.update(
            {_id: d._id},
            {$set: {confidenceInEvidence: ''}},
            {multi: false}
        );
        print(res);
    }
});

print('Added additionalResults to ' + db.ntpEpiResult.count() + ' ntpEpiResult');
print('Added confidenceInEvidence to ' + db.ntpEpiDescriptive.count() + ' ntpEpiDescriptives');
