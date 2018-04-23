# -*- coding: utf-8 -*-

from docxUtils.reports import DOCXReport
from docxUtils.tables import TableMaker


class GenotoxHumanHtml(DOCXReport):

    def buildHeader(self):
        doc = self.doc
        d = self.context
        txt = u'{} {}: Genotoxicity human evidence summary'.format(
            d['table']['volumeNumber'],
            d['table']['monographAgent'],
        )
        p = doc.paragraphs[0]
        p.text = txt
        p.style = 'Title'
        doc.add_paragraph(d['table']['name'])

    def buildTable(self):
        colWidths = [1, 1, 1, 1, 1, 1, 1, .7, 1]
        tbl = TableMaker(colWidths, numHeaders=1,
                         tblStyle='ntpTbl', firstRowCaption=False)

        # write header
        tbl.new_th(0, 0, 'Reference,\nagent')
        tbl.new_th(0, 1, 'Location,\ndate')
        tbl.new_th(0, 2, 'Setting,\nscenario')
        tbl.new_th(0, 3, 'Sampling\nmatrix')
        tbl.new_th(0, 4, 'Number of\nsubjects')
        tbl.new_th(0, 5, 'Mean,\nrange,\nunits')
        tbl.new_th(0, 6, 'Endpoint &\nsignificance')
        tbl.new_th(0, 7, 'Result')
        tbl.new_th(0, 8, 'Covariates controlled')

        row = 1
        for ref in self.context['objects']:

            txt = f"{ref['reference']['name']},\n{ref['agent']}"
            tbl.new_td_txt(row, 0, txt)

            txt = f"{ref['location']},\n{ref['collectionDate']}"
            tbl.new_td_txt(row, 1, txt)

            for result in ref['results']:

                txt = f"{result['exposureSetting']},\n{result['exposureScenario']}"
                tbl.new_td_txt(row, 2, txt)

                txt = result['samplingMatrix']
                tbl.new_td_txt(row, 3, txt)

                txt = result['numberSubjects']
                tbl.new_td_txt(row, 4, txt)

                txt = f"{result['exposureLevel']},\n{result['exposureLevelRange']},\n{result['units']}"
                tbl.new_td_txt(row, 5, txt)

                txt = f"{result['endpoint']}\n{result['significancePrint']}"
                tbl.new_td_txt(row, 6, txt)

                txt = result['result']
                tbl.new_td_txt(row, 7, txt)

                txt = ',\n'.join(result['covariates'])
                tbl.new_td_txt(row, 8, txt)

                row += 1

        tbl.render(self.doc)

    def create_content(self):
        self.setLandscape()
        self.buildHeader()
        self.buildTable()

    def get_template_fn(self):
        return 'base.docx'
