XLSX = Meteor.npmRequire('xlsx')

type = do ->
    classToType = {}
    for name in "Boolean Number String Function Array Date RegExp Undefined Null".split(" ")
        classToType["[object " + name + "]"] = name.toLowerCase()

    (obj) ->
        strType = Object::toString.call(obj)
        classToType[strType] or "object"

excel_datenum = (v, date1904) ->
    if(date1904) then v+=1462
    epoch = Date.parse(v)
    (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000)

class Workbook
    constructor: () ->
        @SheetNames = []
        @Sheets = {}

sheet_from_array_of_arrays = (data) ->
    ws = {}
    range = {s: {c:10000000, r:10000000}, e: {c:0, r:0 }}
    for R,i in data
        for C,j in data[i]
            if (range.s.r > i) then range.s.r = i
            if (range.s.c > j) then range.s.c = j
            if (range.e.r < i) then range.e.r = i
            if (range.e.c < j) then range.e.c = j
            cell = {v: data[i][j] };
            if cell.v is null then continue
            cell_ref = XLSX.utils.encode_cell({c:j, r:i})
            switch type(cell.v)
                when "number"
                    cell.t = 'n'
                when "boolean"
                    cell.t = 'b'
                when 'date'
                    cell.t = 'n'
                    cell.z = XLSX.SSF._table[14]
                    cell.v = excel_datenum(cell.v)
                else
                    cell.t = 's'

            ws[cell_ref] = cell
    if(range.s.c < 10000000) then ws['!ref'] = XLSX.utils.encode_range(range)
    return ws

Meteor.methods
    epiEvidenceDownload: (tbl_id) ->
        data = share.getFlattenedEpiData(tbl_id)
        ws_name = "epi Results"
        wb = new Workbook()
        ws = sheet_from_array_of_arrays(data)
        wb.SheetNames.push(ws_name)
        wb.Sheets[ws_name] = ws
        XLSX.write(wb, {bookType:'xlsx', bookSST:true, type: 'binary'})

    mechanisticEvidenceExcelDownload: (tbl_id) ->

        getDataRow = (v) ->
            refs = _.pluck(Reference.find({_id: {$in : v.references}},
                                          {fields: {name: 1}}).fetch(), 'name')
            return [
                v._id,
                v.section,
                v.parent,
                v.subheading or "",
                v.text or "",
                refs.join('; '),
                v.humanInVivo,
                v.humanInVitro,
                v.animalInVivo,
                v.animalInVitro
            ]

        getData = (tbl_id) ->
            header = [
                '_id',
                'section',
                'parent',
                'subheading',
                'text',
                'references',
                'humanInVivo',
                'humanInVitro',
                'animalInVivo',
                'animalInVitro'
            ]
            data = [header]

            addEvidence = (evidence) ->
                data.push(getDataRow(evidence))
                children = MechanisticEvidence.find({parent: evidence._id},
                                                    {sort: {sortIdx: 1}})
                children.forEach((child) -> addEvidence(child))

            for section in mechanisticEvidenceSections
                sectionEvidences = MechanisticEvidence.find({tbl_id: tbl_id, section: section.section},
                                                            {sort: {sortIdx: 1}})
                sectionEvidences.forEach((evidence) -> addEvidence(evidence))

            return data

        data = getData(tbl_id)
        ws_name = "mechanisticEvidence"
        wb = new Workbook()
        ws = sheet_from_array_of_arrays(data)
        wb.SheetNames.push(ws_name)
        wb.Sheets[ws_name] = ws
        XLSX.write(wb, {bookType:'xlsx', bookSST:true, type: 'binary'})

    exposureEvidenceDownload: (tbl_id) ->
        data = share.getFlattenedExposureData(tbl_id)
        ws_name = "Exposure Results"
        wb = new Workbook()
        ws = sheet_from_array_of_arrays(data)
        wb.SheetNames.push(ws_name)
        wb.Sheets[ws_name] = ws
        XLSX.write(wb, {bookType:'xlsx', bookSST:true, type: 'binary'})

    animalEvidenceDownload: (tbl_id) ->
        data = share.getFlattenedAnimalData(tbl_id)
        ws_name = "Bioassay Results"
        wb = new Workbook()
        ws = sheet_from_array_of_arrays(data)
        wb.SheetNames.push(ws_name)
        wb.Sheets[ws_name] = ws
        XLSX.write(wb, {bookType:'xlsx', bookSST:true, type: 'binary'})

    genotoxEvidenceDownload: (tbl_id) ->
        data = share.getFlattenedGenotoxData(tbl_id)
        ws_name = "Genotoxicity Results"
        wb = new Workbook()
        ws = sheet_from_array_of_arrays(data)
        wb.SheetNames.push(ws_name)
        wb.Sheets[ws_name] = ws
        XLSX.write(wb, {bookType:'xlsx', bookSST:true, type: 'binary'})

    referenceExcelDownload: (monographAgent) ->

        getDataRow = (v) ->
            return [v._id, v.name, v.fullCitation,
                    v.referenceType, v.pubmedID, v.otherURL]

        getData = ->
            header = ['_id', 'Short Citation', 'Full Citation',
                      'Reference Type', 'Pubmed ID', 'Other URL']
            data = [header]
            refs = Reference.find({"monographAgent": {$in: [monographAgent]}},
                                  {sort: [["name", 1]]})

            for ref in refs.fetch()
                data.push(getDataRow(ref))

            return data

        data = getData()
        ws_name = "#{monographAgent}-references"
        wb = new Workbook()
        ws = sheet_from_array_of_arrays(data)
        wb.SheetNames.push(ws_name)
        wb.Sheets[ws_name] = ws
        XLSX.write(wb, {bookType:'xlsx', bookSST:true, type: 'binary'})
