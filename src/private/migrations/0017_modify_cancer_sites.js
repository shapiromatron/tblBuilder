/*
Change organSiteCategory "NHL (T-cell)" to "NHL (T-cell lymphoma)".
*/
db.epiResult.updateMany(
    {organSiteCategory: 'NHL (T-cell)'},
    {$set: {organSiteCategory: 'NHL (T-cell lymphoma)'}}
);
db.ntpEpiResult.updateMany(
    {organSiteCategory: 'NHL (T-cell)'},
    {$set: {organSiteCategory: 'NHL (T-cell lymphoma)'}}
);
