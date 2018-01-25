from docxUtils.reports import DOCXReport
from docxUtils.tables import TableMaker


def to_string(d, el, default=''):
    # return value or default if None type
    return d[el] if el in d and d[el] is not None else default


class NtpEpiResultTables(DOCXReport):

    COLUMN_WIDTHS = [1.0, 1.7, 1.25, 1.25, 1.2, 2.6]

    @classmethod
    def get_desc_rowspan(cls, results):
        return sum([
            cls.get_result_rowspan(res)
            for res in results
        ])

    @classmethod
    def get_result_rowspan(cls, result):
        rows = len(result['riskEstimates'])
        if result.get('organSite') or result.get('effectMeasure'):
            rows += 1
        return rows

    def _build_description(self, desc, site):
        results = desc['organSiteResults'][site]
        row = 0
        tbl = TableMaker(self.COLUMN_WIDTHS, numHeaders=0,
                         firstRowCaption=False, tblStyle='ntpTbl')

        rowspan = self.get_desc_rowspan(results)
        # Column A
        runs = [
            tbl.new_run(desc['reference']['name']),
            tbl.new_run(desc['studyDesign']),
            tbl.new_run(to_string(desc, 'location')),
            tbl.new_run('Enrollment or follow-up:', b=True),
            tbl.new_run(to_string(desc, 'enrollmentDates'))
        ]
        tbl.new_td_run(row, 0, runs, rowspan=rowspan)

        # Column B
        if desc['isCaseControl']:
            txt = u'Cases: {}; Controls: {}'.format(
                desc.get('populationSizeCases', ''),
                desc.get('populationSizeControls', ''))
            populationEligibility = desc.get('populationEligibility')
            if populationEligibility is not None:
                txt = u'{}\n{}'.format(populationEligibility, txt)
            popD = tbl.new_run(txt)
        else:
            popD = tbl.new_run(u'{}\n{}'.format(
                desc.get('populationEligibility', ''),
                desc.get('cohortPopulationSize', '')))

        runs = [
            tbl.new_run('Population:', b=True),
            popD,
            tbl.new_run('Exposure assessment method: ',
                        b=True, newline=False),
            tbl.new_run(desc['exposureAssessmentType'],
                        newline=False)
        ]

        tbl.new_td_run(row, 1, runs, rowspan=rowspan)

        result_row = row
        for res in results:
            # Columns C,D
            result_rowspan = self.get_result_rowspan(res)
            risk_row = result_row
            if res.get('organSite') or res.get('effectMeasure'):
                txt = unicode(res['organSite']) if res.get('organSite') else u''
                if res.get('effectMeasure'):
                    txt += u': ' if len(txt) > 0 else u''
                    txt += res['effectMeasure']

                if res.get('effectUnits') is not None:
                    txt += u' {}'.format(res['effectUnits'])

                run = [tbl.new_run(txt, b=True)]
                tbl.new_td_run(risk_row, 2, run, colspan=2)
                risk_row += 1
                risk_row += 1
            for i, est in enumerate(res['riskEstimates']):
                tbl.new_td_txt(risk_row + i, 2, est['exposureCategory'])
                tbl.new_td_txt(risk_row + i, 3, est['riskFormatted'])

            # Column E
            tbl.new_td_txt(result_row, 4, res['wrd_covariatesList'],
                           rowspan=result_rowspan)

            # update result_row
            result_row = result_row + result_rowspan

        # Column F
        runs = []
        wrd_notes = desc.get('wrd_notes')
        if wrd_notes is not None and wrd_notes != '':
            runs.append(tbl.new_run(wrd_notes))

        additional_results = '\n'.join([
            res['additionalResults'] for res in results
            if ('additionalResults' in res and
                res['additionalResults'] is not None and
                res['additionalResults'] is not u'')
            ])
        if additional_results is '':
            additional_results = '-'

        runs.extend([
            tbl.new_run('Strengths:', b=True),
            tbl.new_run(to_string(desc, 'strengths')),
            tbl.new_run('Limitations:', b=True),
            tbl.new_run(to_string(desc, 'limitations')),
            tbl.new_run('Additional results:', b=True),
            tbl.new_run(additional_results),
            tbl.new_run('Confidence in evidence:', b=True),
            tbl.new_run(desc['confidenceInEvidence'], newline=False),
        ])
        tbl.new_td_run(row, 5, runs, rowspan=rowspan)

        return tbl

    def build_desc_tbl(self, caption, descriptions, site):
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
        for desc in descriptions:
            inner_tbl = self._build_description(desc, site)
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
            self.build_desc_tbl(txt, organSite['descriptions'], organSite['organSite'])
            self.doc.add_page_break()

    def get_template_fn(self):
        return 'base.docx'
