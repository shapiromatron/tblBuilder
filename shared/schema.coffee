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


    # attach schema to collections
    Tables.attachSchema(share.TableSchema)
    Reference.attachSchema(share.ReferenceSchema)
    MechanisticEvidence.attachSchema(share.MechanisticEvidenceSchema)
