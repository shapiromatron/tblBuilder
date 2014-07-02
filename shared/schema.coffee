Meteor.startup ->

    share.TableSchema = new SimpleSchema

        agent:
            label: "Agent Name"
            type: String

        monographNumber:
            label: "Monograph Number"
            type: Number
            decimal: false

        name:
            label: "Table Name"
            type: String

        tblType:
            label: "Table Type"
            type: String
            allowedValues: tblTypeOptions

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
            optional: true


    share.ReferenceSchema = new SimpleSchema

        name:
            label: "Reference Short Name"
            type: String

        referenceType:
            label: "Reference Type"
            type: String
            allowedValues: referenceTypeOptions

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

        fullCitation:
            label: "Full Citation Text"
            type: String

        monographNumber:
            type: [Number]
            minCount: 1
            decimal: false

        timestamp:
            type: Date
            optional: true
            denyUpdate: true

        user_id:
            type: SimpleSchema.RegEx.Id
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

        sortIdx:
            type: Number
            decimal: true
            optional: true

        timestamp:
            type: Date
            optional: true

        user_id:
            type: SimpleSchema.RegEx.Id
            optional: true


    # attach schema to collections
    Tables.attachSchema(share.TableSchema)
    Reference.attachSchema(share.ReferenceSchema)
    MechanisticEvidence.attachSchema(share.MechanisticEvidenceSchema)
