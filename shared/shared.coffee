share.capitalizeFirst = (str) ->
    if str? and str.length>0
        str = str[0].toUpperCase() + str.slice(1)
    return str

share.riskFormatter = (obj) ->
    isNumber = (v) -> return v isnt null and not isNaN(v)

    if not obj.riskMid? then return "-"
    txt = obj.riskMid.toString()
    if (isNumber(obj.riskLow) and isNumber(obj.riskHigh))
        txt += " (#{obj.riskLow}–#{obj.riskHigh})"
    if obj.riskEstimated then txt = "[#{txt}]"
    return txt

share.getFlattenedEpiData = (tbl_id) ->

    getResultData = (parent_id, row) ->
        vals = EpiResult.find({parent_id: parent_id}, {sort: {sortIdx: 1}}).fetch()
        rows = []
        # multiple results (cancer sites) per cohort
        for v in vals
            covariates = v.covariates.join(', ')
            row2 = row.slice()  # shallow copy
            row2.push(v._id, v.organSite, v.effectMeasure,
                      v.effectUnits, v.trendTest, covariates,
                      v.covariatesControlledText, v.notes)

            # multiple risk-estimates per cancer site (low-exp group, high-exp group, etc.)
            for re in v.riskEstimates
                row3 = row2.slice()  # shallow copy
                row3.push(re.exposureCategory, re.numberExposed, re.riskEstimated,
                          re.riskMid, re.riskLow, re.riskHigh,
                          re.inTrendTest, share.riskFormatter(re))
                rows.push(row3)
        return rows

    vals = EpiDescriptive.find({tbl_id: tbl_id}, {sort: {sortIdx: 1}}).fetch()
    header = ["Descriptive ID", "Reference", "Study design", "Location", "Enrollment or follow-up dates",
              "Population/eligibility characteristics", "Other population descriptors", "Outcome Data Source",
              "Population size", "Loss to follow-up (%)", "Type of referent group",
              "Population cases", "Response rate cases", "Source cases",
              "Population controls", "Response rate controls", "Source controls"
              "Exposure assessment type", "Quantitative exposure level", "Exposure assessment notes", "Possible co-exposures",
              "Principal strengths", "Principal limitations", "General notes",

              "Result ID", "Organ site", "Effect measure",
              "Effect measure units", "Trend test", "Covariates",
              "Covariates notes", "General notes",

              "Exposure category", "Number exposed", "Risks estimated?",
              "Risk Mid", "Risk 5% CI", "Risk 95% CI",
              "In trend-test", "Risk"]
    data = [header]
    for v in vals
        reference = Reference.findOne({_id: v.referenceID}).name
        coexposures = v.coexposures.join(', ')
        row = [v._id, reference, v.studyDesign, v.location, v.enrollmentDates,
               v.eligibilityCriteria, v.populationDescription, v.outcomeDataSource,
               v.populationSize, v.lossToFollowUp, v.referentGroup,
               v.populationSizeCase, v.responseRateCase, v.sourceCase,
               v.populationSizeControl, v.responseRateControl, v.sourceControl,
               v.exposureAssessmentType, v.exposureLevel, v.exposureAssessmentNotes, coexposures,
               v.strengths, v.limitations, v.notes]
        rows = getResultData(v._id, row)
        data.push.apply(data, rows)
    return data

share.getFlattenedExposureData = (tbl_id) ->
    vals = ExposureEvidence.find({tbl_id: tbl_id}, {sort: {sortIdx: 1}}).fetch()
    header = [
        "Exposure ID",
        "Reference",
        "Exposure scenario",
        "Collection date",
        "Occupation",
        "Occupational information",
        "Country",
        "Location",
        "Agent",
        "Sampling Matrix",
        "Sampling Approach",
        "Number of measurements",
        "Measurement duration",
        "Exposure level",
        "Exposure level description",
        "Exposure level range",
        "Units",
        "Comments"
    ]
    data = [header]
    for v in vals
        reference = Reference.findOne({_id: v.referenceID}).name
        row = [
            v._id,
            reference,
            v.exposureScenario,
            v.collectionDate,
            v.occupation,
            v.occupationInfo,
            v.country,
            v.location,
            v.agent,
            v.samplingMatrix,
            v.samplingApproach,
            v.numberMeasurements,
            v.measurementDuration,
            v.exposureLevel,
            v.exposureLevelDescription,
            v.exposureLevelRange,
            v.units,
            v.comments,
        ]
        data.push(row)

    return data

share.getFlattenedAnimalData = (tbl_id) ->

    getEndpointData = (parent_id, row) ->
        vals = AnimalEndpointEvidence.find({parent_id: parent_id}, {sort: {sortIdx: 1}}).fetch()
        rows = []
        # multiple results
        for v in vals
            row2 = row.slice()  # shallow copy
            row2.push(
                v._id,
                v.tumourSite,
                v.histology,
                v.units,
                v.significance
            )

            # multiple risk-estimates per cancer site (low-exp group, high-exp group, etc.)
            for eg in v.endpointGroups
                row3 = row2.slice()  # shallow copy
                row3.push(
                    eg.dose,
                    eg.nStart,
                    eg.nSurviving,
                    eg.incidence,
                    eg.multiplicity,
                    eg.totalTumours
                )
                rows.push(row3)
        return rows

    vals = AnimalEvidence.find({tbl_id: tbl_id}, {sort: {sortIdx: 1}}).fetch()
    header = [
        "Evidence ID",
        "Reference",
        "Study design",
        "Species",
        "Strain",
        "Sex",
        "Agent",
        "Purity",
        "Dosing route",
        "Vehicle",
        "Age at start",
        "Duration",
        "Dosing Regimen",
        "Strengths",
        "Limitations",
        "Comments",

        "Endpoint ID",
        "Tumour site",
        "Histology",
        "Units",
        "Significance",

        "Dose",
        "N at Start",
        "N Surviving",
        "Incidence",
        "Multiplicity",
        "Total Tumours"
    ]
    data = [header]
    for v in vals
        reference = Reference.findOne({_id: v.referenceID}).name
        strengths = v.strengths.join(', ')
        limitations = v.limitations.join(', ')
        row = [
            v._id
            reference
            v.studyDesign
            v.species
            v.strain
            v.sex
            v.agent
            v.purity
            v.dosingRoute
            v.vehicle
            v.ageAtStart
            v.duration
            v.dosingRegimen
            strengths
            limitations
            v.comments
        ]
        rows = getEndpointData(v._id, row)
        data.push.apply(data, rows)
    return data

share.getFlattenedGenotoxData = (tbl_id) ->
    vals = GenotoxEvidence.find({tbl_id: tbl_id}, {sort: {sortIdx: 1}}).fetch()
    header = [
        "Genotoxicity ID",
        "Reference"
        "Data class",
        "Agent",
        "Plylogenetic class",
        "Test system",
        "Non-mammalian species",
        "Non-mammalian strain",
        "Mammalian species",
        "Mammalian strain",
        "Tissue/Cell line",
        "Species",
        "Strain",
        "Sex",
        "Tissue, animal",
        "Tissue, human",
        "Cell type",
        "Exposure description",
        "Endpoint",
        "Endpoint test",
        "Dosing route",
        "Dosing duration",
        "Dosing regime",
        "Doses tested",
        "Units",
        "Result",
        "Result, metabolic activation",
        "Result, no metabolic activation",
        "LED/HID",
        "Significance",
        "Comments"
    ]
    data = [header]
    for v in vals
        reference = Reference.findOne({_id: v.referenceID}).name
        row = [
            v._id,
            reference,
            v.dataClass,
            v.agent,
            v.phylogeneticClass,
            v.testSystem,
            v.speciesNonMamm,
            v.strainNonMamm,
            v.testSpeciesMamm,
            v.speciesMamm,
            v.tissueCellLine,
            v.species,
            v.strain,
            v.sex,
            v.tissueAnimal,
            v.tissueHuman,
            v.cellType,
            v.exposureDescription,
            v.endpoint,
            v.endpointTest,
            v.dosingRoute,
            v.dosingDuration,
            v.dosingRegimen,
            v.dosesTested,
            v.units,
            v.result,
            v.led,
            v.resultMetabolic,
            v.resultNoMetabolic,
            v.significance,
            v.comments
        ]
        data.push(row)

    return data

share.setExposureWordFields = (d) ->
    d.location = d.location or "Not-reported"
    d.occupationInfo = d.occupationInfo or ""
    d.comments = d.comments or ""

share.defaultEpiVisible = [
    "Reference",
    "Study design",
    "Location",
    "Organ site",
    "Effect measure",
    "Exposure category",
    "Risk"
]

share.mechanisticTestCrosswalk =
    "Non-mammalian in vitro":
        "Acellular systems":
            "Genotox":
                "DNA damage": ["DNA adducts", "DNA strand breaks", "DNA cross-links", "Intercalation", "Other"],

        "Prokaryote (bacteria)":
            "Genotox":
                "DNA damage": ["DNA strand breaks", "DNA cross-links", "Other"]
                "Mutation": ["Reverse mutation", "Forward mutation", "Other"]
                "DNA repair": ["Other"]

        "Lower eukaryote (yeast, mold)":
            "Genotox":
                "DNA damage": ["DNA strand breaks", "DNA cross-links", "Other"]
                "Mutation": ["Reverse mutation", "Forward mutation", "Gene conversion", "Other"]
                "Chromosomal damage": ["Chromosomal aberrations", "Aneuploidy", "Other"]

        "Insect":
            "Genotox":
                "Mutation": ["Somatic mutation and recombination test (SMART)", "Sex-linked recessive lethal mutations", "Heritable translocation test", "Dominant lethal test", "Other"]
                "Chromosomal damage": ["Aneuploidy", "Other"]
                "DNA repair": ["Other"]

        "Plant systems":
            "Genotox":
                "DNA damage": ["Unscheduled DNA synthesis", "Other"]
                "Chromosomal damage": ["Chromosomal aberrations", "Micronuclei", "Sister Chromatid Exchange", "Aneuploidy", "Other"]
                "Mutation": ["Reverse mutation", "Forward mutation", "Gene conversion", "Other"]

        "Other (fish, worm, bird, etc)":
            "Genotox":
                "Mutation": ["Forward mutation", "Reverse mutation", "Other"]

    "Mammalian and human in vitro":
        "Human":
            "Genotox":
                "DNA damage": ["DNA adducts", "DNA strand breaks", "DNA cross-links", "DNA oxidation", "Unscheduled DNA synthesis", "Other"]
                "Mutation": ["Oncogene", "Tumour suppressor", "Other"]
                "Chromosomal damage": ["Chromosomal aberrations", "Micronuclei", "Sister Chromatid Exchange", "Aneuploidy", "Other"]
                "DNA repair": ["Other"]
                "Cell transformation": ["Other"]

        "Non-human mammalian":
            "Genotox":
                "DNA damage": ["DNA adducts ", "DNA strand breaks", "DNA cross-links", "DNA oxidation", "Unscheduled DNA synthesis", "Other"]
                "Mutation": ["tk", "hprt ", "ouabain resistance", "Other gene", "Chromosomal damage", "Chromosomal aberrations", "Micronuclei", "Sister Chromatid Exchange", "Aneuploidy", "Other"]
                "Chromosomal damage": ["Chromosomal aberrations", "Micronuclei", "Sister Chromatid Exchange", "Aneuploidy", "Other"]
                "DNA repair": ["Other"]
                "Cell transformation": ["Other"]

    "Animal in vivo":
        "Genotox":
            "DNA damage": ["DNA adducts", "DNA strand breaks", "DNA cross-links", "DNA oxidation", "Unscheduled DNA synthesis", "Other"]
            "Mutation": ["Mouse spot test", "Mouse specific locus test", "Dominant lethal test", "Transgenic animal tests ", "Other"]
            "Chromosomal damage": ["Chromosomal aberrations", "Micronuclei", "Sister Chromatid Exchange", "Aneuploidy", "Other"]
            "DNA repair": ["Other"]

    "Human in vivo":
        "Genotox":
            "DNA damage": ["DNA adducts", "DNA strand breaks", "DNA cross-links", "DNA oxidation", "Unscheduled DNA synthesis", "Other"]
            "Mutation": ["Oncogene", "Tumour suppressor", "Other"]
            "Chromosomal damage": ["Chromosomal aberrations", "Micronuclei", "Sister Chromatid Exchange", "Aneuploidy", "Other"]
            "DNA repair": ["Other"]

share.hasGenotoxDualResult = (dataClass, phylogeneticClass) ->
    dcls = "Non-mammalian in vitro"
    duals = [
        "Acellular systems",
        "Prokaryote (bacteria)",
        "Lower eukaryote (yeast, mold)"
    ]
    return ((dataClass is dcls) and (phylogeneticClass in duals))

share.isGenotoxAcellular = (dataClass, phylogeneticClass) ->
    dcls = "Non-mammalian in vitro"
    acell = "Acellular systems"
    return ((dataClass is dcls) and (phylogeneticClass is acell))

share.getGenotoxTestSystemDesc = (d) ->
    switch d.dataClass
        when "Non-mammalian in vitro"
            if share.isGenotoxAcellular(d.dataClass, d.phylogeneticClass)
                txt = "#{ d.phylogeneticClass }<br>#{ d.testSystem}"
            else
                txt = "#{ d.phylogeneticClass }<br>#{ d.speciesNonMamm}&nbsp;#{ d.strainNonMamm}"
        when "Mammalian and human in vitro"
            txt = "#{d.speciesMamm}<br>#{d.tissueCellLine}"
        when "Animal in vivo"
            txt = "#{d.species}&nbsp;#{d.strain}&nbsp;#{d.sex}<br>#{d.tissueAnimal}"
            txt += "<br>#{d.dosingRoute};&nbsp;#{d.dosingDuration};&nbsp;#{d.dosingRegimen}"
        when "Human in vivo"
            txt = "#{d.tissueHuman}, #{d.cellType}<br>#{d.exposureDescription}"
        else
            console.log("unknown data-type")
    return txt

share.setGenotoxColumns = (d) ->
    # set HTML attributes for online tabular display
    # data class
    d.col1 = d.dataClass

    # test-system
    d.col2 = share.getGenotoxTestSystemDesc(d)

    # endpoint
    d.col3 = d.endpoint + "/<br>" + d.endpointTest

    # result, result with metabolic activation
    if share.hasGenotoxDualResult(d.dataClass, d.phylogeneticClass)
        d.col4 = d.resultNoMetabolic
        d.col5 = d.resultMetabolic
    else
        d.col4 = d.result
        d.col5 = "NA"

    if d.dataClass is "Human in vivo" and d.significance
        d.col4 +=  "&nbsp;" + d.significance

    # agent, critical dose, and doses units
    d.col6 = d.agent + ",<br>"
    if d.led
        d.col6 += d.led + "&nbsp"
    d.col6 += d.units

    if d.dataClass is "Animal in vivo"
        d.col6 += "<br>[#{d.dosesTested}&nbsp;#{d.units}]"

    # comments
    d.col7 = d.comments

share.setGenotoxWordFields = (d) ->
    # set additional attributes for generating a Word-report
    d.comments = d.comments or ""
    d.led = d.led or ""
    d.significance = d.significance or ""

    switch d.dataClass
        when "Non-mammalian in vitro"
            if share.isGenotoxAcellular(d.dataClass, d.phylogeneticClass)
                d._testSystem = d.testSystem
            else
                d._testSystem = "#{ d.speciesNonMamm} #{ d.strainNonMamm}"

            if share.hasGenotoxDualResult(d.dataClass, d.phylogeneticClass)
                d.resultA = d.resultNoMetabolic
                d.resultB = d.resultMetabolic
            else
                d.resultA = d.result
                d.resultB = "NA"

share.getAnimalDoses = (e) ->
    if e then e.endpointGroups.map((v) -> v.dose).join(", ") + " " + e.units else "NR"

share.getAnimalNStarts = (e) ->
    if e then e.endpointGroups.map((v) -> v.nStart).join(", ") else "NR"

share.getAnimalNSurvivings = (e) ->
    if e then  e.endpointGroups.map((v) -> v.nSurviving).join(", ") else "NR"

share.getAnimalEndpointIncidents = (egs) ->
    return egs.map((v) -> v.incidence).join(", ")

share.getAnimalEndpointMultiplicities = (egs) ->
    return egs.map((v) -> v.multiplicity or "NR").join(", ")

share.setAnimalWordFields = (d) ->
    # set additional attributes for generating a Word-report
    d.strengths = d.strengths.join(", ") or "None"
    d.limitations = d.limitations.join(", ") or "None"
    d.comments = d.comments or "None"
    d.endpoints = AnimalEndpointEvidence.find({parent_id: d._id}).fetch()

    for e in d.endpoints
        e.incidents = share.getAnimalEndpointIncidents(e.endpointGroups)
        e.multiplicities = share.getAnimalEndpointMultiplicities(e.endpointGroups)
        e.significance = e.significance + "\n\n\n\n\n"  # estimation/depends on spacing

    e = if (d.endpoints.length > 0) then d.endpoints[0] else undefined
    d.doses = share.getAnimalDoses(e)
    d.nStarts = share.getAnimalNStarts(e)
    d.nSurvivings = share.getAnimalNSurvivings(e)
