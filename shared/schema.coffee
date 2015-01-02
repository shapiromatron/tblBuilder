Meteor.startup ->

    # define base-schemas
    base_content =

        timestamp:
            type: Date
            optional: true
            denyUpdate: true

        user_id:
            type: SimpleSchema.RegEx.Id
            denyUpdate: true
            optional: true

    tbl_content_base =

        tbl_id:
            type: SimpleSchema.RegEx.Id
            denyUpdate: true

        isHidden:
            type: Boolean
            optional: true

        sortIdx:
            type: Number
            decimal: true
            optional: true

        isQA:
            type: Boolean
            defaultValue: false
            optional: true

        timestampQA:
            type: Date
            optional: true

        user_id_QA:
            type: SimpleSchema.RegEx.Id
            optional: true


    # define collection-specific schemas
    tbl_schema =

        monographAgent:
            label: "Monograph Agent Name"
            type: String
            min: 1

        volumeNumber:
            label: "Volume Number"
            type: Number
            decimal: false

        name:
            label: "Table Name"
            type: String
            min: 1

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

    ref_schema =
        name:
            label: "Reference Short Name"
            type: String
            min: 1

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
            min: 1

        monographAgent:
            type: [String]
            minCount: 1

    mech_schema =

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

    epi_result_schema =

        organSite:
            label: "Organ site (ICD code)"
            type: String
            min: 1

        effectMeasure:
            label: "Measure of effect"
            type: String
            min: 1

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
            min: 1

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

        "riskEstimates.$.inTrendTest":
            label: "Estimate in Trend Test"
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

        parent_id:
            type: SimpleSchema.RegEx.Id
            denyUpdate: true

    requiredCC = () ->
        isRequired = ((@field('studyDesign').value in CaseControlTypes) and (@value is ""))
        if isRequired then return "required"

    requiredCohort = () ->
        isRequired = ((@field('studyDesign').value not in CaseControlTypes) and (@value is ""))
        if isRequired then return "required"

    epi_descriptive_schema =

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
            min: 1

        enrollmentDates:
            label: "Enrollment or follow-up dates"
            type: String
            min: 1

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
            min: 1

        limitations:
            label: "Principal limitations"
            type: String
            min: 1

        notes:
            label: "General notes"
            type: String
            optional: true


    requiredOccupational = () ->
        isRequired = ((@field('exposureScenario').value in exposureScenariosOccupational) and (@value is ""))
        if isRequired then return "required"

    exposure_schema =

        referenceID:
            label: "Reference"
            type: SimpleSchema.RegEx.Id

        exposureScenario:
            label: "Exposure scenario"
            type: String
            allowedValues: exposureScenarios

        collectionDate:
            label: "Collection date"
            type: String
            min: 1

        occupation:
            label: "Industry or occupation"
            type: String
            optional: true
            custom: requiredOccupational

        occupationInfo:
            label: "Other occupational information"
            type: String
            optional: true

        country:
            label: "Country"
            type: String
            min: 1

        location:
            label: "Other locational information"
            type: String
            optional: true

        agent:
            label: "Agent"
            type: String
            min: 1

        samplingMatrix:
            label: "Sampling matrix"
            type: String
            min: 1

        samplingApproach:
            label: "Sampling approach"
            type: String
            allowedValues: samplingApproaches

        numberMeasurements:
            label: "Number of measurements"
            type: String
            min: 1

        measurementDuration:
            label: "Measurement duration"
            type: String
            min: 1

        exposureLevel:
            label: "Mean or median exposure-level"
            type: String
            min: 1

        exposureLevelDescription:
            label: "Description of exposure-level"
            type: String
            allowedValues: exposureLevelDescriptions

        exposureLevelRange:
            label: "Range of exposure-level"
            type: String
            min: 1

        units:
            label: "Units"
            type: String
            min: 1

        comments:
            label: "Comments"
            type: String
            optional: true

    animal_schema =

        referenceID:
            label: "Reference"
            type: SimpleSchema.RegEx.Id


    reqNonMammVitro = () ->
        isRequired = ((@field('dataClass').value is "Non-mammalian in vitro") and
                      (@value is ""))
        if isRequired then return "required"

    reqAcellular = () ->
        isRequired = ((@field('dataClass').value is "Non-mammalian in vitro") and
            (@field('phylogeneticClass').value is "Acellular systems") and
            (@value is ""))
        if isRequired then return "required"

    reqNotAcellular = () ->
        isRequired = ((@field('dataClass').value is "Non-mammalian in vitro") and
            (@field('phylogeneticClass').value isnt "Acellular systems") and
            (@value is ""))
        if isRequired then return "required"

    reqMammVitro = () ->
        isRequired = ((@field('dataClass').value is "Mammalian and human in vitro") and
                      (@value is ""))
        if isRequired then return "required"

    reqAniVivo = () ->
        isRequired = ((@field('dataClass').value is "Animal in vivo") and
                      (@value is ""))
        if isRequired then return "required"

    reqHumanVivo = () ->
        isRequired = ((@field('dataClass').value is "Human in vivo") and
                      (@value is ""))
        if isRequired then return "required"

    genotox_schema =

        # FIRST ROW
        referenceID:
            label: "Reference"
            type: SimpleSchema.RegEx.Id

        dataClass:
            label: "Data class"
            type: String
            allowedValues: genotoxDataClass

        agent:
            label: "Agent"
            type: String
            min: 1


        # SECOND ROW
        # (non_mamm_vitro)
        phylogeneticClass:
            label: "Data class"
            type: String
            allowedValues: phylogeneticClasses
            optional: true
            custom: reqNonMammVitro

        # (isAcellular only)
        testSystem:
            label: "Test system"
            type: String
            optional: true
            custom: reqAcellular

        # (isntAcellular only)
        speciesNonMamm:
            label: "Species"
            type: String
            optional: true
            custom: reqNotAcellular

        strainNonMamm:
            label: "Strain"
            type: String
            optional: true
            custom: reqNotAcellular

        # (mamm_vitro only)
        testSpeciesMamm:
            label: "Test species class"
            type: String
            allowedValues: mammalianTestSpecies
            optional: true
            custom: reqMammVitro

        speciesMamm:
            label: "Species"
            type: String
            optional: true
            custom: reqMammVitro

        tissueCellLine:
            label: "Tissue, cell-line"
            type: String
            optional: true
            custom: reqMammVitro

        # (ani_vivo only)
        species:
            label: "Species"
            type: String
            optional: true
            custom: reqAniVivo

        strain:
            label: "Strain"
            type: String
            optional: true
            custom: reqAniVivo

        sex:
            label: "Sex"
            type: String
            allowedValues: sexes
            optional: true
            custom: reqAniVivo

        tissueAnimal:
            label: "Tissue"
            type: String
            optional: true
            custom: reqAniVivo

        # (human_vivo only)
        tissueHuman:
            label: "Tissue"
            type: String
            optional: true
            custom: reqHumanVivo

        cellType:
            label: "Cell type"
            type: String
            optional: true

        exposureDescription:
            label: "Description of exposed and controls"
            type: String
            optional: true
            custom: reqHumanVivo


        #THIRD ROW
        endpoint:
            label: "Endpoint"
            type: String
            min: 1

        endpointTest:
            label: "Endpoint test"
            type: String
            min: 1

        #ani_vivo
        dosingRoute:
            label: "Route"
            type: String
            optional: true
            custom: reqAniVivo

        dosingDuration:
            label: "Duration"
            type: String
            optional: true
            custom: reqAniVivo

        dosingRegimen:
            label: "Dosing regimen"
            type: String
            optional: true
            custom: reqAniVivo


        # FOURTH ROW
        result:
            label: "Result"
            type: String
            allowedValues: genotoxResultOptions

        led:
            label: "LED or HID"
            type: String
            optional: true

        units:
            label: "Dosing units"
            type: String
            min: 1

        # (isDualResult only)
        resultMetabolic:
            label: "Result (no metabolic activation)"
            type: String
            allowedValues: genotoxResultOptions

        resultNoMetabolic:
            label: "Result (no metabolic activation)"
            type: String
            allowedValues: genotoxResultOptions


        # (ani_vivo only)
        dosesTested:
            label: "Doses tested"
            type: String
            optional: true
            custom: reqAniVivo


        # (human_vivo only)
        significance:
            label: "Significance"
            type: String
            optional: true


        # FIFTH ROW
        comments:
            label: "Comments"
            type: String
            optional: true


    mech_quant_schema =

        referenceID:
            label: "Reference"
            type: SimpleSchema.RegEx.Id

    animal_endpoint_schema =

        parent_id:
            type: SimpleSchema.RegEx.Id
            denyUpdate: true

        endpoint_name:
            label: "Endpoint name"
            type: String
            min: 1


    # extend content between base base-content objects
    _.extend(tbl_schema, base_content)
    _.extend(ref_schema, base_content)
    _.extend(tbl_content_base, base_content)
    _.extend(mech_schema, tbl_content_base)
    _.extend(epi_result_schema, tbl_content_base)
    _.extend(epi_descriptive_schema, tbl_content_base)
    _.extend(exposure_schema, tbl_content_base)
    _.extend(animal_schema, tbl_content_base)
    _.extend(animal_endpoint_schema, tbl_content_base)
    _.extend(genotox_schema, tbl_content_base)
    _.extend(mech_quant_schema, tbl_content_base)


    # Override simple-schema defaults
    SimpleSchema.messages({minCount: "[label] must specify at least [minCount] value(s) (press <enter> after typing to add to list)"})


    # create simple schema objects
    share.TableSchema = new SimpleSchema(tbl_schema)
    share.ReferenceSchema = new SimpleSchema(ref_schema)
    share.MechanisticEvidenceSchema = new SimpleSchema(mech_schema)
    share.epiResultSchema = new SimpleSchema(epi_result_schema)
    share.epiDescriptiveSchema = new SimpleSchema(epi_descriptive_schema)
    share.exposureEvidenceSchema = new SimpleSchema(exposure_schema)
    share.animalEvidenceSchema = new SimpleSchema(animal_schema)
    share.animalEndpointEvidenceSchema = new SimpleSchema(animal_endpoint_schema)
    share.genotoxEvidenceSchema = new SimpleSchema(genotox_schema)
    share.mechQuantEvidenceSchema = new SimpleSchema(mech_quant_schema)


    # attach schema to collections
    Tables.attachSchema(share.TableSchema)
    Reference.attachSchema(share.ReferenceSchema)
    MechanisticEvidence.attachSchema(share.MechanisticEvidenceSchema)
    EpiResult.attachSchema(share.epiResultSchema)
    EpiDescriptive.attachSchema(share.epiDescriptiveSchema)
    ExposureEvidence.attachSchema(share.exposureEvidenceSchema)
    AnimalEvidence.attachSchema(share.animalEvidenceSchema)
    AnimalEndpointEvidence.attachSchema(share.animalEndpointEvidenceSchema)
    GenotoxEvidence.attachSchema(share.genotoxEvidenceSchema)
    MechQuantEvidence.attachSchema(share.mechQuantEvidenceSchema)
