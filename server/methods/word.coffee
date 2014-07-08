DocXTemplater = Meteor.require('docxtemplater')
angular_expressions= Meteor.require('angular-expressions')

angularParser = (tag) ->
    expr = angular_expressions.compile(tag)
    return get: expr


Meteor.methods
    epiWordReport: (tbl_id) ->
        vals = EpiDescriptive.find({tbl_id: tbl_id}, {sort: {sortIdx: 1}}).fetch()
        for val in vals
            val.reference = Reference.findOne(_id: val.referenceID)
            val.results = EpiResult.find({parent_id: val._id}, {sort: {sortIdx: 1}}).fetch()
        path = "#{process.env.PWD}/private/docx-templates/epi-v1.docx"
        docx = new DocxGen().loadFromFile(path, {async: false, parser: angularParser})
        docx.setTags({descriptions: vals})
        docx.applyTags()
        docx.output({type: "string"})
