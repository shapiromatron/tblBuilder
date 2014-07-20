
share.riskFormatter = (obj) ->
    if not obj.riskMid? then return "-"
    txt = obj.riskMid.toString()
    if (obj.riskLow and obj.riskHigh)
        txt += " (#{obj.riskLow}-#{obj.riskHigh})"
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
                          re.riskMid, re.riskLow, re.riskHigh, share.riskFormatter(re))
                rows.push(row3)
        return rows

    vals = EpiDescriptive.find({tbl_id: tbl_id}, {sort: {sortIdx: 1}}).fetch()
    header = ["Descriptive ID", "Reference", "Study Design", "Location", "Enrollment Dates",
              "Population Description", "Eligibility Criteria", "Outcome Data Source",
              "Population Size", "Loss to follow-up", "Referent Group",
              "Population Cases", "Response Rate Cases", "Source Cases",
              "Population Controls", "Response Rate Controls", "Source Controls"
              "Exposure Assessment Method", "Exposure Assessment Type", "Exposure Level", "Coexposures",
              "Strengths", "Limitations", "Notes",

              "Result ID", "Organ Site", "Effect Measure",
              "Effect Units", "Trend Test", "Covariates",
              "Covariates Text", "Notes",

              "Exposure Category", "Number Exposed", "Risks estimated?",
              "Risk Mid", "Risk 5% CI", "Risk 95% CI", "Risk"]
    data = [header]
    for v in vals
        reference = Reference.findOne({_id: v.referenceID}).name
        coexposures = v.coexposures.join(', ')
        row = [v._id, reference, v.studyDesign, v.location, v.enrollmentDates,
               v.populationDescription, v.eligibilityCriteria, v.outcomeDataSource,
               v.populationSize, v.lossToFollowUp, v.referentGroup,
               v.populationSizeCase, v.responseRateCase, v.sourceCase,
               v.populationSizeControl, v.responseRateControl, v.sourceControl,
               v.exposureAssessmentMethod, v.exposureAssessmentType, v.exposureLevel, coexposures,
               v.strengths, v.limitations, v.notes]
        rows = getResultData(v._id, row)
        data.push.apply(data, rows)
    return data

share.defaultEpiVisible = ["Reference", "Study Design", "Location",
                           "Organ Site", "Effect Measure",
                           "Exposure Category", "Risk"]
