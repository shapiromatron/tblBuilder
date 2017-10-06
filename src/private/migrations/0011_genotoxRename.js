/*
MIGRATE GenotoxEvidence.tblType
  FROM ('Genetic and Related Effects')
  TO ('Genotoxicity-other')
*/
db.tables.updateMany(
    {tblType: 'Genetic and Related Effects'},
    {$set: {tblType: 'Genotoxicity-other'}});
/*
MIGRATE GenotoxHumanExposureEvidence.tblType
  FROM ('Human Exposure')
  TO ('Genotoxicity-exposed Humans')
*/
db.tables.updateMany(
    {tblType: 'Human Exposure'},
    {$set: {tblType: 'Genotoxicity-exposed Humans'}});
