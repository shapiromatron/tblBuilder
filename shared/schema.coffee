Meteor.startup ->

    share.TableSchema = new SimpleSchema

        monographAgent:
            label: "Monograph Agent Name"
            type: String

        volumeNumber:
            label: "Volume Number"
            type: Number
            decimal: false

        name:
            label: "Table Name"
            type: String

        tblType:
            label: "Table Type"
            type: String
            allowedValues: tblTypeOptions
            denyUpdate: true

        "user_roles.$.user_id":
            type: SimpleSchema.RegEx.Id

        "user_roles.$.role":
            type: String
            allowedValues: tblRoleOptions

        timestamp:
            type: Date
            optional: true
            denyUpdate: true

        user_id:
            type: SimpleSchema.RegEx.Id
            denyUpdate: true
            optional: true


    share.ReferenceSchema = new SimpleSchema

        name:
            label: "Reference Short Name"
            type: String

        referenceType:
            label: "Reference Type"
            type: String
            allowedValues: referenceTypeOptions
            denyUpdate: true

        otherURL:
            label: "Other URL"
            type: SimpleSchema.RegEx.Url
            optional: true

        pubmedID:
            label: "PubMed ID"
            type: Number
            optional: true
            custom: () ->
                needsPMID = (this.field('referenceType').value is "PubMed")
                if needsPMID and this.value<=0 then return "required"
            denyUpdate: true

        fullCitation:
            label: "Full Citation Text"
            type: String

        monographAgent:
            type: [String]
            minCount: 1

        timestamp:
            type: Date
            optional: true
            denyUpdate: true

        user_id:
            type: SimpleSchema.RegEx.Id
            denyUpdate: true
            optional: true


    share.MechanisticEvidenceSchema = new SimpleSchema

        subheading:
            label: "Subheading"
            type: String
            optional: true

        references:
            label: "References"
            type: [SimpleSchema.RegEx.Id]

        text:
            label: "Supporting evidence"
            type: String
            optional: true
            custom: () ->
                isRequired = ((not @field('subheading').isSet) and (@value is ""))
                if isRequired then return "required"

        animalInVitro:
            label: "Animal in vitro"
            type: Boolean

        animalInVivo:
            label: "Animal in vivo"
            type: Boolean

        humanInVitro:
            label: "Human in vitro"
            type: Boolean

        humanInVivo:
            label: "Human in vivo"
            type: Boolean

        section:
            type: String
            optional: true

        parent:
            type: SimpleSchema.RegEx.Id
            optional: true

        tbl_id:
            type: SimpleSchema.RegEx.Id
            denyUpdate: true

        sortIdx:
            type: Number
            decimal: true
            optional: true

        timestamp:
            type: Date
            denyUpdate: true
            optional: true

        user_id:
            type: SimpleSchema.RegEx.Id
            denyUpdate: true
            optional: true


    share.epiResultSchema = new SimpleSchema

        organSite:
            label: "Organ site (ICD code)"
            type: String

        effectMeasure:
            label: "Measure of effect"
            type: String

        effectUnits:
            label: "Units of effect measurement"
            type: String
            optional: true

        trendTest:
            label: "p-value for trend"
            type: Number
            decimal: true
            optional: true

        "riskEstimates.$.exposureCategory":
            label: "Exposure category or level"
            type: String

        "riskEstimates.$.numberExposed":
            label: "Exposed cases/deaths"
            type: Number
            decimal: false

        "riskEstimates.$.riskMid":
            label: "Risk estimate"
            type: Number
            decimal: true
            optional: true

        "riskEstimates.$.riskLow":
            label: "95% lower CI"
            type: Number
            decimal: true
            optional: true

        "riskEstimates.$.riskHigh":
            label: "95% upper CI"
            type: Number
            decimal: true
            optional: true

        "riskEstimates.$.riskEstimated":
            label: "Working-group calculation"
            type: Boolean

        covariates:
            label: "Covariates controlled"
            type: [String]
            minCount: 1

        covariatesControlledText:
            label: "Covariates controlled notes"
            type: String
            optional: true

        notes:
            label: "General notes"
            type: String
            optional: true

        isHidden:
            type: Boolean

        parent_id:
            type: SimpleSchema.RegEx.Id
            denyUpdate: true

        sortIdx:
            type: Number
            decimal: true
            optional: true

        tbl_id:
            type: SimpleSchema.RegEx.Id
            denyUpdate: true

        timestamp:
            type: Date
            denyUpdate: true
            optional: true

        user_id:
            type: Date
            denyUpdate: true
            optional: true


    requiredCC = () ->
        isRequired = ((@field('studyDesign').value in CaseControlTypes) and (@value is ""))
        if isRequired then return "required"

    requiredCohort = () ->
        isRequired = ((@field('studyDesign').value not in CaseControlTypes) and (@value is ""))
        if isRequired then return "required"

    share.epiDescriptiveSchema = new SimpleSchema

        referenceID:
            label: "Reference"
            type: SimpleSchema.RegEx.Id

        studyDesign:
            label: "Study design"
            allowedValues: epiStudyDesignOptions
            type: String

        location:
            label: "Location"
            type: String

        enrollmentDates:
            label: "Enrollment or follow-up dates"
            type: String

        eligibilityCriteria:
            label: "Population/eligibility characteristics"
            type: String
            optional: true
            custom: requiredCohort

        populationDescription:
            label: "Other population descriptors"
            type: String
            optional: true

        outcomeDataSource:
            label: "Outcome data source"
            type: String
            optional: true

        populationSize:
            label: "Population size"
            type: String
            optional: true
            custom: requiredCohort
            defaultValue: null

        lossToFollowUp:
            label: "Loss to follow-up (%)"
            type: String
            optional: true
            custom: requiredCohort
            defaultValue: null

        referentGroup:
            label: "Type of referent group"
            type: String
            optional: true
            custom: requiredCohort
            defaultValue: null

        populationSizeCase:
            label: "Population size (cases)"
            type: String
            optional: true
            custom: requiredCC
            defaultValue: null

        populationSizeControl:
            label: "Population size (controls)"
            type: String
            optional: true
            custom: requiredCC
            defaultValue: null

        responseRateCase:
            label: "Response rate (cases)"
            type: String
            optional: true
            custom: requiredCC
            defaultValue: null

        responseRateControl:
            label: "Response rate (controls)"
            type: String
            optional: true
            custom: requiredCC
            defaultValue: null

        sourceCase:
            label: "Source of cases"
            type: String
            optional: true
            custom: requiredCC
            defaultValue: null

        sourceControl:
            label: "Source of controls"
            type: String
            optional: true
            custom: requiredCC
            defaultValue: null

        exposureAssessmentType:
            label: "Exposure assessment type"
            allowedValues: exposureAssessmentTypeOptions
            type: String

        exposureLevel:
            label: "Exposure level"
            type: String
            optional: true

        exposureAssessmentNotes:
            label: "Exposure assessment comments"
            type: String
            optional: true

        coexposures:
            label: "Possible co-exposures"
            type: [String]

        strengths:
            label: "Principal strengths"
            type: String

        limitations:
            label: "Principal limitations"
            type: String

        notes:
            label: "General notes"
            type: String
            optional: true

        isHidden:
            type: Boolean
            optional: true

        sortIdx:
            type: Number
            decimal: true
            optional: true

        tbl_id:
            type: SimpleSchema.RegEx.Id
            denyUpdate: true

        timestamp:
            type: Date
            denyUpdate: true
            optional: true

        user_id:
            type: SimpleSchema.RegEx.Id
            denyUpdate: true
            optional: true

    SimpleSchema.messages({minCount: "[label] must specify at least [minCount] value(s) (press <enter> after typing to add to list)"})

    # attach schema to collections
    Tables.attachSchema(share.TableSchema)
    Reference.attachSchema(share.ReferenceSchema)
    MechanisticEvidence.attachSchema(share.MechanisticEvidenceSchema)
    EpiResult.attachSchema(share.epiResultSchema)
    EpiDescriptive.attachSchema(share.epiDescriptiveSchema)
