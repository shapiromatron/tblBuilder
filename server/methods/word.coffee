DocXTemplater = Meteor.require('docxtemplater')
angular_expressions= Meteor.require('angular-expressions')

angularParser = (tag) ->
    expr = angular_expressions.compile(tag)
    return get: expr

epiWordReport = (tbl_id, filename) ->
    tbl = Tables.findOne(tbl_id)
    vals = EpiDescriptive.find({tbl_id: tbl_id}, {sort: {sortIdx: 1}}).fetch()
    for val in vals
        val.reference = Reference.findOne(_id: val.referenceID)
        val.coexposuresList = val.coexposures.join(', ')
        val.isCaseControl = val.studyDesign is "Case-Control"
        val.results = EpiResult.find({parent_id: val._id}, {sort: {sortIdx: 1}}).fetch()
        for res in val.results
            res.covariatesList = res.covariates.join(', ')
            for riskEst in res.riskEstimates
                riskEst.riskFormatted = share.riskFormatter(riskEst)

    data = {"descriptions": vals, "table": tbl}

    path = share.getWordTemplatePath(filename)
    docx = new DocxGen().loadFromFile(path, {async: false, parser: angularParser})
    docx.setTags(data)
    docx.applyTags()
    docx.output({type: "string"})

mechanisticWordReport = (tbl_id, filename) ->

    getReferences = (obj) ->
        refs = Reference.find({_id: {$in: obj.references}}).fetch()
        obj.references = _.pluck(refs, 'name').join(', ')
        if obj.references isnt "" then obj.references = "(#{obj.references})"

    getChildren = (parent) ->
        children = MechanisticEvidence.find({parent: parent._id},
                                             {sort: {sortIdx: 1}}).fetch()
        parent.children = children
        for child in children
            getReferences(child)
            getChildren(child)

    data = {"sections": [], "table":Tables.findOne({_id: tbl_id})}
    for section in mechanisticEvidenceSections
        children = MechanisticEvidence.find({tbl_id: tbl_id, section: section.section},
                                            {sort: {sortIdx: 1}}).fetch()
        data.sections.push({"description": section.sectionDesc, "children": children})
        for child in children
            getReferences(child)
            getChildren(child)

    path = share.getWordTemplatePath(filename)
    docx = new DocxGen().loadFromFile(path, {async: false, parser: angularParser})
    docx.setTags(data)
    docx.applyTags()
    docx.output({type: "string"})

Meteor.methods
    downloadWordReport: (tbl_id, filename) ->
        tbl = Tables.findOne(tbl_id)
        switch tbl.tblType
            when "Mechanistic Evidence Summary"
                mechanisticWordReport(tbl_id, filename)
            when "Epidemiology Evidence"
                epiWordReport(tbl_id, filename)
