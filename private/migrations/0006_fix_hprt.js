var res = db.genotoxEvidence.update(
    {endpointTest: 'hprt '},
    {$set: {endpointTest: 'hprt'}},
    {multi: true}
);
print('hprt:', res);


res = db.genotoxEvidence.update(
    {endpointTest: 'DNA adducts '},
    {$set: {endpointTest: 'DNA adducts'}},
    {multi: true}
);
print('DNA adducts:', res);


res = db.genotoxEvidence.update(
    {endpointTest: 'Transgenic animal tests '},
    {$set: {endpointTest: 'Transgenic animal tests'}},
    {multi: true}
);
print('Transgenic animal tests:', res);
