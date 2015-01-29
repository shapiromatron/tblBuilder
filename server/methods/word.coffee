DocXTemplater = Meteor.npmRequire('docxtemplater')
angular_expressions= Meteor.npmRequire('angular-expressions')

angularParser = (tag) ->
    expr = angular_expressions.compile(tag)
    return get: expr


# EXPOSURE REPORT -------------------------------------------------------
exposureWordReport = (tbl_id) ->

    tbl = Tables.findOne(tbl_id)
    exposures = ExposureEvidence
        .find({tbl_id: tbl_id},
              {sort: {sortIdx: 1}})
        .fetch()

    for exp in exposures
        exp.reference = Reference.findOne(_id: exp.referenceID)
        share.setExposureWordFields(exp)

    d =
        "monographAgent": tbl.monographAgent
        "volumeNumber": tbl.volumeNumber
        "hasTable": true
        "table": tbl
        "exposures": exposures
        "occupationals": _.filter(exposures, (d) -> return d.exposureScenario is "Occupational")
        "environmentals": _.filter(exposures, (d) -> return d.exposureScenario is "Environmental")
        "mixed": _.filter(exposures, (d) -> return d.exposureScenario is "Integrated/mixed")

    return d


# EPI REPORTS ------------------------------------------------------------------
prepareEpiDescriptive = (desc) ->
    desc.reference = Reference.findOne(_id: desc.referenceID)
    desc.coexposuresList = desc.coexposures.join(', ')
    desc.isCaseControl = desc.studyDesign in CaseControlTypes
    desc.notes = desc.comments or ""

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

epiWordReport = (tbl_id, epiSortOrder) ->
    switch epiSortOrder
        when "Reference"
            return getEpiDataByReference(tbl_id)
        when "Organ-site"
            return getEpiDataByOrganSite(tbl_id)
        else
            console.error("unknown epiSortOrder")

epiWordReportMultiTable = (filename, monographAgent, volumeNumber) ->
    epiSortOrder = ReportTemplate.findOne({filename: filename}).epiSortOrder
    switch epiSortOrder
        when "Reference"
            data = getEpiDataByReferenceMonographAgent(monographAgent, volumeNumber)
        when "Organ-site"
            data = getEpiDataByOrganSiteMonographAgent(monographAgent, volumeNumber)
    return createWordReport(filename, data)

# ANIMAL BIOASSAY REPORT -------------------------------------------------------
animalWordReport = (tbl_id) ->
    tbl = Tables.findOne(tbl_id)
    studies = AnimalEvidence
        .find({tbl_id: tbl_id}, {sort: {sortIdx: 1}})
        .fetch()

    for study in studies
        study.reference = Reference.findOne(_id: study.referenceID)
        share.setAnimalWordFields(study)

    d =
        "monographAgent": tbl.monographAgent
        "volumeNumber": tbl.volumeNumber
        "hasTable": true
        "table": tbl
        "studies": studies

    return d

# MECHANISTIC REPORT -----------------------------------------------------------
mechanisticWordReport = (tbl_id) ->

    formatEvidence = (obj) ->
        refs = Reference.find({_id: {$in: obj.references}}).fetch()
        obj.references = _.pluck(refs, 'name').join(', ')
        if obj.references isnt "" then obj.references = "(#{obj.references})"
        obj.text = obj.text or ""
        obj.subheading = obj.subheading or ""

    getChildren = (parent) ->
        children = MechanisticEvidence.find({parent: parent._id},
                                             {sort: {sortIdx: 1}}).fetch()
        parent.children = children
        for child in children
            formatEvidence(child)
            getChildren(child)

    data = {"sections": [], "table": Tables.findOne({_id: tbl_id})}
    for section in mechanisticEvidenceSections
        children = MechanisticEvidence.find({tbl_id: tbl_id, section: section.section},
                                            {sort: {sortIdx: 1}}).fetch()
        data.sections.push({"description": section.sectionDesc, "children": children})
        for child in children
            child.hasSubheading = child.subheading? and child.subheading isnt ""
            formatEvidence(child)
            getChildren(child)

    return data


# GENOTOXICITY REPORT ----------------------------------------------------------
genotoxWordReport = (tbl_id) ->

    tbl = Tables.findOne(tbl_id)
    d =
        "monographAgent": tbl.monographAgent
        "volumeNumber": tbl.volumeNumber
        "hasTable": true
        "table": tbl

    vals = GenotoxEvidence
        .find({tbl_id: tbl_id}, {sort: {sortIdx: 1}})
        .fetch()

    for val in vals
        val.reference = Reference.findOne(_id: val.referenceID)
        share.setGenotoxWordFields(val)

    d.nonMammalianInVitro = _.filter(vals, (v) -> return v.dataClass == "Non-mammalian")
    d.mammalianInVitro = _.filter(vals, (v) -> return v.dataClass == "Mammalian and human in vitro")
    d.animalInVivo = _.filter(vals, (v) -> return v.dataClass == "Animal in vivo")
    d.humanInVivo = _.filter(vals, (v) -> return v.dataClass == "Human in vivo")
    return d


Meteor.methods
    downloadWordReport: (tbl_id, filename) ->
        tbl = Tables.findOne(tbl_id)
        template = ReportTemplate.findOne({filename: filename})
        switch tbl.tblType
            when "Exposure Evidence"
                data = exposureWordReport(tbl_id)
            when "Epidemiology Evidence"
                data = epiWordReport(tbl_id, template.epiSortOrder)
            when "Animal Bioassay Evidence"
                data = animalWordReport(tbl_id)
            when "Genetic and Related Effects"
                data = genotoxWordReport(tbl_id)
            when "Mechanistic Evidence Summary"
                data = mechanisticWordReport(tbl_id)
            else
                return console.error("unknown table type: " + tbl.tblType)

        path = share.getWordTemplatePath(filename)
        docx = new DocxGen().loadFromFile(path, {async: false, parser: angularParser})
        docx.setTags(data)
        docx.applyTags()
        return docx.output({type: "string"})

    monographAgentEpiReport: (d) ->
        epiWordReportMultiTable(d.templateFN, d.monographagent, d.volumenumber)
