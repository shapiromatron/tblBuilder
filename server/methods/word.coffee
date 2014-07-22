DocXTemplater = Meteor.require('docxtemplater')
angular_expressions= Meteor.require('angular-expressions')

angularParser = (tag) ->
    expr = angular_expressions.compile(tag)
    return get: expr

prepareEpiDescriptive = (desc) ->
    desc.reference = Reference.findOne(_id: desc.referenceID)
    desc.coexposuresList = desc.coexposures.join(', ')
    desc.isCaseControl = desc.studyDesign in CaseControlTypes

prepareEpiResult = (res) ->
    res.covariatesList = res.covariates.join(', ')
    for riskEst in res.riskEstimates
        riskEst.riskFormatted = share.riskFormatter(riskEst)

getEpiDataByReference = (tbl_id) ->
    tbl = Tables.findOne(tbl_id)
    vals = EpiDescriptive.find({tbl_id: tbl_id}, {sort: {sortIdx: 1}}).fetch()
    for val in vals
        prepareEpiDescriptive(val)
        val.results = EpiResult.find({parent_id: val._id}, {sort: {sortIdx: 1}}).fetch()
        for res in val.results
            prepareEpiResult(res)

    return {"descriptions": vals, "table": tbl}

getEpiDataByOrganSite = (tbl_id) ->
    organSites = []
    tbl = Tables.findOne(tbl_id)
    vals = EpiResult.find({tbl_id: tbl_id}, {sort: {organSite: 1}}).fetch()
    sites = _.uniq(_.pluck(vals, "organSite"), true)
    for site in sites
        data = []
        results = EpiResult.find({tbl_id: tbl_id, organSite: site}).fetch()
        for res in results
            prepareEpiResult(res)
            res.descriptive = EpiDescriptive.findOne({_id: res.parent_id})
            prepareEpiDescriptive(res.descriptive)
            data.push(res)

        organSites.push({"organSite": site, "results": data})

    return {"organSites": organSites, "table": tbl}

epiWordReport = (tbl_id, filename) ->
    epiSortOrder = ReportTemplate.findOne({filename: filename}).epiSortOrder
    switch epiSortOrder
        when "Reference"
            data = getEpiDataByReference(tbl_id)
        when "Organ-site"
            data = getEpiDataByOrganSite(tbl_id)

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
            child.hasSubheading = child.subheading? and child.subheading isnt ""
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
