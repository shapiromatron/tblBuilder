from docxUtils.reports import DOCXReport
from docxUtils.tables import TableMaker


class EpiHtmlTables(DOCXReport):

    def getCol2(self, d, tbl):
        # recreation of table-helper
        runs = []
        if d['isCaseControl']:
            case = '{}; {}'.format(
                d['populationSizeCase'], d['sourceCase'])
            ctrl = '{}; {}'.format(
                d['populationSizeControl'], d['sourceControl'])
            runs.append(tbl.new_run('Cases: ', b=True))
            runs.append(tbl.new_run(case))
            runs.append(tbl.new_run('Controls: ', b=True))
            runs.append(tbl.new_run(ctrl))
        else:
            runs.append(tbl.new_run('{}; {}'.format(
                        d['populationSize'],
                        d['eligibilityCriteria'])))

        runs.append(tbl.new_run('Exposure assessment method: ', b=True))
        if d['exposureAssessmentType'].lower().find('other') >= 0:
            runs.append(tbl.new_run('other', newline=False))
        else:
            runs.append(tbl.new_run(d['exposureAssessmentType'], newline=False))

        if d.get('exposureAssessmentNotes'):
            runs.append(tbl.new_run('; ' + d.get('exposureAssessmentNotes')))

        return runs

    COLUMN_WIDTHS = (1.5, 1.0, 0.8, 1.1, 0.6, 1.0, 0.8, 2.0)

    def _build_description(self, d):
        rows = 0
        tbl = TableMaker(self.COLUMN_WIDTHS, numHeaders=0,
                         firstRowCaption=False, tblStyle='ntpTbl')

        for res in d['results']:
            res['_rowspan'] = max(len(res['riskEstimates']), 1)
            effectUnits = res.get('effectUnits', None)
            if effectUnits and len(effectUnits) > 0:
                res['_rowspan'] += 1
            if res['hasTrendTest']:
                res['_rowspan'] += 1

        st_rowspan = sum(res['_rowspan'] for res in d['results'])

        # Column A
        runs = [
            tbl.new_run(d['reference']['name']),
            tbl.new_run(d['location']),
            tbl.new_run(d['enrollmentDates']),
            tbl.new_run(d['studyDesign']),
        ]
        tbl.new_td_run(rows, 0, runs, rowspan=st_rowspan)

        # Column B
        runs = self.getCol2(d, tbl)
        tbl.new_td_run(rows, 1, runs, rowspan=st_rowspan)

        # Columns C, D, E, F, G
        irows = rows
        for res in d['results']:
            additionalRows = 0
            tbl.new_td_txt(irows, 2, res['printOrganSite'],
                           rowspan=res['_rowspan'])
            tbl.new_td_txt(irows, 6, res['wrd_covariatesList'],
                           rowspan=res['_rowspan'])

            effectUnits = res.get('effectUnits', None)
            if effectUnits and len(effectUnits) > 0:
                tbl.new_td_txt(irows, 3, effectUnits, colspan=3)
                additionalRows += 1

            stratum = res.get('stratum', None)
            for i, est in enumerate(res['riskEstimates']):

                runs = []
                if i == 0 and stratum and len(stratum) > 0:
                    runs.append(tbl.new_run('{}: '.format(stratum),
                                            b=True, newline=False))
                runs.append(tbl.new_run(est['exposureCategory'], newline=False))
                tbl.new_td_run(irows+additionalRows, 3, runs)

                tbl.new_td_txt(irows+additionalRows, 4,
                               '{}'.format(est['numberExposed']))
                tbl.new_td_txt(irows+additionalRows, 5,
                               '{}'.format(est['riskFormatted']))
                additionalRows += 1

            if res['hasTrendTest']:
                txt = 'Trend-test p-value: {}'.format(res['trendTest'])
                tbl.new_td_txt(irows+additionalRows, 3, txt, colspan=3)
                additionalRows += 1

            irows += additionalRows

        # Column H
        runs = [
            tbl.new_run(d['wrd_notes']),
            tbl.new_run('Strengths: ', b=True, newline=False),
            tbl.new_run(d.get('strengths', '')),
            tbl.new_run('Limitations: ', b=True, newline=False),
            tbl.new_run(d.get('limitations', '')),
        ]
        tbl.new_td_run(rows, 7, runs, rowspan=st_rowspan)

        return tbl

    def build_tbl(self, data):
        tbl = TableMaker(self.COLUMN_WIDTHS, numHeaders=1,
                         firstRowCaption=False, tblStyle='ntpTbl')

        # write header
        tbl.new_th(0, 0, 'Reference, location follow-up/enrollment period, study-design')  # noqa
        tbl.new_th(0, 1, 'Population size, description, exposure assessment method')  # noqa
        tbl.new_th(0, 2, 'Organ site')
        tbl.new_th(0, 3, 'Exposure category or level')
        tbl.new_th(0, 4, 'Exposed cases/ deaths')
        tbl.new_th(0, 5, 'Risk estimate (95% CI)')
        tbl.new_th(0, 6, 'Covariates controlled')
        tbl.new_th(0, 7, 'Comments')

        docx_tbl = tbl.render(self.doc)

        for d in data['descriptions']:
            inner_tbl = self._build_description(d)
            docx_tbl_inner = inner_tbl.render(self.doc)
            docx_tbl._cells.extend(docx_tbl_inner._cells)

    def create_content(self):
        d = self.context

        self.setLandscape()

        # title
        txt = '{} {}'.format(
            d['tables'][0]['volumeNumber'],
            d['tables'][0]['monographAgent']
        )
        p = self.doc.paragraphs[0]
        p.text = txt
        p.style = 'Title'
        self.doc.add_paragraph(d['tables'][0]['name'])

        self.build_tbl(d)

    def get_template_fn(self):
        return 'base.docx'
