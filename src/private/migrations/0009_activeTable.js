db.tables.update({},
  {$set : {'activeTable': true}},
  {multi:true})
