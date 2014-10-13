DocXTemplater = Meteor.npmRequire('docxtemplater')
angular_expressions= Meteor.npmRequire('angular-expressions')

angularParser = (tag) ->
    expr = angular_expressions.compile(tag)
    return get: expr

prepareEpiDescriptive = (desc) ->
    desc.reference = Reference.findOne(_id: desc.referenceID)
    desc.coexposuresList = desc.coexposures.join(', ')
    desc.isCaseControl = desc.studyDesign in CaseControlTypes

prepareEpiResult = (res) ->
    res.covariatesList = share.capitalizeFirst(res.covariates.join(', '))
    res.hasTrendTest = res.trendTest?
    for riskEst in res.riskEstimates
        riskEst.riskFormatted = share.riskFormatter(riskEst)
        riskEst.exposureCategory = share.capitalizeFirst(riskEst.exposureCategory)


# EPI REPORT BY REFERENCE ------------------------------------------------------
getEpiDataByReference = (tbl_id) ->
    tbl = Tables.findOne(tbl_id)
    descriptions = getDescriptionObjects([tbl_id])
    data =
        "descriptions": descriptions
        "monographAgent": tbl.monographAgent
        "volumeNumber": tbl.volumeNumber
        "hasTable": true
        "table": tbl
    return data

getEpiDataByReferenceMonographAgent = (monographAgent, volumeNumber) ->
    tbls = Tables.find({volumeNumber: volumeNumber, monographAgent: monographAgent}).fetch()
    tbl_ids = _.pluck(tbls, "_id")
    descriptions = getDescriptionObjects(tbl_ids)
    data =
        "descriptions": descriptions
        "monographAgent": monographAgent
        "volumeNumber": volumeNumber
        "hasTable": false
    return data

getDescriptionObjects = (tbl_ids) ->
    vals = EpiDescriptive.find({tbl_id: {$in: tbl_ids}}, {sort: {sortIdx: 1}}).fetch()
    for val in vals
        prepareEpiDescriptive(val)
        val.results = EpiResult.find({parent_id: val._id}, {sort: {sortIdx: 1}}).fetch()
        for res in val.results
            prepareEpiResult(res)
    return vals

# EPI REPORT BY ORGAN-SITE -----------------------------------------------------
getEpiDataByOrganSite = (tbl_id) ->
    tbl = Tables.findOne(tbl_id)
    organSites = getOrganSitesObject([tbl_id])
    data =
        "organSites": organSites
        "monographAgent": tbl.monographAgent
        "volumeNumber": tbl.volumeNumber
        "hasTable": true
        "table": tbl
    return data

getEpiDataByOrganSiteMonographAgent = (monographAgent, volumeNumber) ->
    tbls = Tables.find({volumeNumber: volumeNumber, monographAgent: monographAgent}).fetch()
    tbl_ids = _.pluck(tbls, "_id")
    organSites = getOrganSitesObject(tbl_ids)
    data =
        "organSites": organSites
        "monographAgent": monographAgent
        "volumeNumber": volumeNumber
        "hasTable": false
    return data

getOrganSitesObject = (tbl_ids) ->
    # get unique sites
    organSites = []
    epiResults = EpiResult.find({tbl_id: {$in: tbl_ids}}).fetch()
    sites = _.uniq(_.pluck(epiResults, "organSite"), false)

    # loop through unique sites
    for site in sites
        data = []
        results = EpiResult.find({tbl_id: {$in: tbl_ids}, organSite: site}).fetch()
        for res in results
            prepareEpiResult(res)
            res.descriptive = EpiDescriptive.findOne({_id: res.parent_id})
            prepareEpiDescriptive(res.descriptive)
            data.push(res)

        organSites.push({"organSite": site, "results": data})

    return organSites

# EPI REPORT BY REFERENCE ------------------------------------------------------
createWordReport = (templateFilename, data) ->
    path = share.getWordTemplatePath(templateFilename)
    docx = new DocxGen().loadFromFile(path, {async: false, parser: angularParser})
    docx.setTags(data)
    docx.applyTags()
    return docx.output({type: "string"})

epiWordReport = (tbl_id, filename) ->
    epiSortOrder = ReportTemplate.findOne({filename: filename}).epiSortOrder
    switch epiSortOrder
        when "Reference"
            data = getEpiDataByReference(tbl_id)
        when "Organ-site"
            data = getEpiDataByOrganSite(tbl_id)
    return createWordReport(filename, data)

epiWordReportMultiTable = (filename, monographAgent, volumeNumber) ->
    epiSortOrder = ReportTemplate.findOne({filename: filename}).epiSortOrder
    switch epiSortOrder
        when "Reference"
            data = getEpiDataByReferenceMonographAgent(monographAgent, volumeNumber)
        when "Organ-site"
            data = getEpiDataByOrganSiteMonographAgent(monographAgent, volumeNumber)
    return createWordReport(filename, data)

# MECHANISTIC REPORT -----------------------------------------------------------
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

    monographAgentEpiReport: (d) ->
        epiWordReportMultiTable(d.templateFN, d.monographagent, d.volumenumber)
