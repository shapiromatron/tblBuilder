from docxUtils.reports import DOCXReport
from docxUtils.tables import TableMaker


class NtpEpiResultTables(DOCXReport):

    COLUMN_WIDTHS = [1.0, 1.7, 0.75, 0.75, 1.2, 2.6]

    def _build_result(self, res):

        row = 0
        tbl = TableMaker(self.COLUMN_WIDTHS, numHeaders=0,
                         firstRowCaption=False, tblStyle='ntpTbl')

        rowspan = len(res['riskEstimates'])
        if res.get('organSite'):
            rowspan += 1

        # Column A
        runs = [
            tbl.new_run(res['descriptive']['reference']['name']),
            tbl.new_run(res['descriptive']['studyDesign']),
            tbl.new_run(res['descriptive']['location']),
            tbl.new_run('Enrollment or follow-up:', b=True),
            tbl.new_run(res['descriptive']['enrollmentDates'])
        ]
        tbl.new_td_run(row, 0, runs, rowspan=rowspan)

        # Column B
        if res['descriptive']['isCaseControl']:
            popD = tbl.new_run(u'{}\nCases: {}; Controls: {}'.format(
                res['descriptive'].get('populationEligibility', ''),
                res['descriptive'].get('populationSizeCases', ''),
                res['descriptive'].get('populationSizeControls', '')))
        else:
            popD = tbl.new_run(u'{}\n{}'.format(
                res['descriptive'].get('populationEligibility', ''),
                res['descriptive'].get('cohortPopulationSize', '')))

        runs = [
            tbl.new_run('Population:', b=True),
            popD,
            tbl.new_run('Exposure assessment method: ',
                        b=True, newline=False),
            tbl.new_run(res['descriptive']['exposureAssessmentType'],
                        newline=False)
        ]

        tbl.new_td_run(row, 1, runs, rowspan=rowspan)

        # Columns C,D
        risk_row = row
        if res.get('organSite'):
            tbl.new_td_txt(
                risk_row,
                2,
                u'{} - {} {}'.format(
                    res['organSite'],
                    res['effectMeasure'],
                    res['effectUnits']),
                colspan=2)
            risk_row += 1
        for i, est in enumerate(res['riskEstimates']):
            tbl.new_td_txt(risk_row + i, 2, est['exposureCategory'])
            tbl.new_td_txt(risk_row + i, 3, est['riskFormatted'])

        # Column E
        txt = res['wrd_covariatesList']
        runs = [
            tbl.new_run(res['wrd_covariatesList']),
        ]
        tbl.new_td_run(row, 4, runs, rowspan=rowspan)

        # Column F
        runs = [
            tbl.new_run(res['descriptive']['wrd_notes']),
            tbl.new_run('Strengths:', b=True),
            tbl.new_run(res['descriptive']['strengths']),
            tbl.new_run('Limitations:', b=True),
            tbl.new_run(res['descriptive']['limitations'], newline=False)
        ]
        tbl.new_td_run(row, 5, runs, rowspan=rowspan)

        return tbl

    def build_res_tbl(self, caption, results):
        tbl = TableMaker(self.COLUMN_WIDTHS, numHeaders=2, tblStyle='ntpTbl')

        # write title
        tbl.new_th(0, 0, caption, colspan=6)

        # write header
        tbl.new_th(1, 0, 'Reference, study-design, location, and year')
        tbl.new_th(1, 1, 'Population description & exposure assessment method')
        tbl.new_th(1, 2, 'Exposure category or level')
        tbl.new_th(1, 3, 'Risk estimate\n(95% CI); exposed cases')
        tbl.new_th(1, 4, 'Co-variates controlled')
        tbl.new_th(1, 5, 'Comments, strengths, and weaknesses')

        docx_tbl = tbl.render(self.doc)

        # write additional rows
        for res in results:
            inner_tbl = self._build_result(res)
            docx_tbl_inner = inner_tbl.render(self.doc)
            docx_tbl._cells.extend(docx_tbl_inner._cells)

    def create_content(self):
        doc = self.doc
        d = self.context

        self.setLandscape()

        # title
        txt = '{} {}: Results by organ-site'.format(
            d['tables'][0]['volumeNumber'],
            d['tables'][0]['monographAgent'])
        p = doc.paragraphs[0]
        p.text = txt
        p.style = 'Title'
        doc.add_paragraph(d['tables'][0]['name'])

        # build table for each organ-site
        for organSite in sorted(d['organSites'], key=lambda v: v['organSite']):
            txt = u'Table X: {}'.format(organSite['organSite'])
            self.build_res_tbl(txt, organSite['results'])
            self.doc.add_page_break()

    def get_template_fn(self):
        return 'base.docx'
