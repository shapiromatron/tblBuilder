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
    vals = AnimalEvidence.find({tbl_id: tbl_id}, {sort: {sortIdx: 1}}).fetch()
    header = ["Animal Bioassay ID", "Reference"]
    data = [header]
    for v in vals
        reference = Reference.findOne({_id: v.referenceID}).name
        row = [v._id, reference]
    return data


share.getFlattenedGenotoxData = (tbl_id) ->
    vals = GenotoxEvidence.find({tbl_id: tbl_id}, {sort: {sortIdx: 1}}).fetch()
    header = ["Genotoxicity ID", "Reference"]
    data = [header]
    for v in vals
        reference = Reference.findOne({_id: v.referenceID}).name
        row = [v._id, reference]
    return data


share.getFlattenedMechQuantData = (tbl_id) ->
    vals = MechQuantEvidence.find({tbl_id: tbl_id}, {sort: {sortIdx: 1}}).fetch()
    header = ["Mechanistic Quantitative ID", "Reference"]
    data = [header]
    for v in vals
        reference = Reference.findOne({_id: v.referenceID}).name
        row = [v._id, reference]
    return data


share.defaultEpiVisible = [
    "Reference",
    "Study design",
    "Location",
    "Organ site",
    "Effect measure",
    "Exposure category",
    "Risk"
]
