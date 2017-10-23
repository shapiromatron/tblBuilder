from docxUtils.reports import DOCXReport
from docxUtils.tables import TableMaker


class ExposureTables(DOCXReport):

    def buildOccupationalTable(self, exposures):
        colWidths = [1.7, 1, 1.7, 1.3, 2.0, 1.3]
        tbl = TableMaker(colWidths, numHeaders=2, tblStyle='ntpTbl')

        # write title
        txt = 'Occupational exposure data'
        tbl.new_th(0, 0, txt, colspan=6)

        # write header
        tbl.new_th(1, 0, 'Industry, country, year')
        tbl.new_th(1, 1, 'Job/process')
        tbl.new_th(1, 2, 'Mean, agent')
        tbl.new_th(1, 3, 'Range')
        tbl.new_th(1, 4, 'Comments/\nadditional data')
        tbl.new_th(1, 5, 'References')

        row = 2
        for exp in exposures:
            for res in exp['results']:
                runs = [
                    tbl.new_run(exp['occupation'], newline=True, b=True),
                    tbl.new_run(u'{}, {}'.format(
                            exp['location'] or 'Not-reported',
                            exp['collectionDate']
                        ), newline=False)
                ]
                tbl.new_td_run(row, 0, runs)

                txt = exp['occupationInfo'] or ''
                tbl.new_td_txt(row, 1, txt)

                txt = u'{} {} ({}), {}'.format(
                    res['exposureLevel'],
                    res['units'],
                    res['exposureLevelDescription'],
                    res['agent']
                )
                tbl.new_td_txt(row, 2, txt)

                txt = res['exposureRangePrint']
                tbl.new_td_txt(row, 3, txt)

                txt = exp['comments'] or ''
                tbl.new_td_txt(row, 4, txt)

                txt = exp['reference']['name']
                tbl.new_td_txt(row, 5, txt)

                row += 1

        tbl.render(self.doc)
        self.doc.add_page_break()

    def buildEnviroMixedTables(self, exposures, title):
        colWidths = [2, 1.5, 1.5, 2, 2]
        tbl = TableMaker(colWidths, numHeaders=2, tblStyle='ntpTbl')

        # write title
        tbl.new_th(0, 0, title, colspan=5)

        # write header
        tbl.new_th(1, 0, 'Region, country (city)')
        tbl.new_th(1, 1, 'Mean, agent')
        tbl.new_th(1, 2, 'Range')
        tbl.new_th(1, 3, 'Comments/\nadditional data')
        tbl.new_th(1, 4, 'References')

        row = 2
        for exp in exposures:
            for res in exp['results']:
                runs = [
                    tbl.new_run(exp['country'], newline=True, b=True),
                    tbl.new_run(u'{}, {}'.format(
                            exp['location'] or 'Not-reported',
                            exp['collectionDate']
                        ), newline=False)
                ]
                tbl.new_td_run(row, 0, runs)

                txt = u'{} {} ({}), {}'.format(
                    res['exposureLevel'],
                    res['units'],
                    res['exposureLevelDescription'],
                    res['agent']
                )
                tbl.new_td_txt(row, 1, txt)

                txt = res['exposureRangePrint']
                tbl.new_td_txt(row, 2, txt)

                txt = exp['comments'] or ''
                tbl.new_td_txt(row, 3, txt)

                txt = exp['reference']['name']
                tbl.new_td_txt(row, 4, txt)

                row += 1

        tbl.render(self.doc)
        self.doc.add_page_break()

    def create_content(self):
        self.setLandscape()
        doc = self.doc
        d = self.context

        txt = '{} {}: Exposure evidence'.format(
            d['table']['volumeNumber'],
            d['table']['monographAgent']
        )
        p = doc.paragraphs[0]
        p.text = txt
        p.style = 'Title'
        doc.add_paragraph(d['table']['name'])

        self.buildOccupationalTable(
            d['occupationals'])
        self.buildEnviroMixedTables(
            d['environmentals'], 'Environmental exposure data')
        self.buildEnviroMixedTables(
            d['mixed'], 'Integrated/mixed exposure data')

    def get_template_fn(self):
        return 'base.docx'
