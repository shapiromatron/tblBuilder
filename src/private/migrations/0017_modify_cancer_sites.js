/*
Change organSiteCategory "NHL (T-cell)" to "NHL (T-cell lymphoma)".
*/
var res;
res = db.epiResult.updateMany(
    {organSiteCategory: 'NHL (T-cell)'},
    {$set: {organSiteCategory: 'NHL (T-cell lymphoma)'}}
);
print(res.acknowledged, res.matchedCount);

res = db.ntpEpiResult.updateMany(
    {organSiteCategory: 'NHL (T-cell)'},
    {$set: {organSiteCategory: 'NHL (T-cell lymphoma)'}}
);
print(res.acknowledged, res.matchedCount);
