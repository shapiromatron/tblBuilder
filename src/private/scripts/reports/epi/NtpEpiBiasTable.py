import re
from docxUtils.reports import DOCXReport
from docxUtils.tables import TableMaker


class NtpEpiBiasTables(DOCXReport):
    """
    NTP epi potential bias report.
    """
    COLUMN_WIDTHS = [.8, 2.2, 2.2]

    def convertCamelCase(self, name):
        s1 = re.sub('(.)([A-Z][a-z]+)', r'\1 \2', name)
        return re.sub('([a-z0-9])([A-Z])', r'\1 \2', s1).lower().title()

    def build_bias_table(self, biasNames, descriptions):
        tbl = TableMaker(self.COLUMN_WIDTHS, numHeaders=0,
                         firstRowCaption=False, tblStyle='ntpTbl')

        # write header
        tbl.new_th(0, 0, 'Reference')
        for i, bias in enumerate(biasNames):
            tbl.new_th(0, i + 1, u'{} rating'.format(self.convertCamelCase(bias)))

        docx_tbl = tbl.render(self.doc)

        for desc in descriptions:
            inner_tbl = self.build_bias(biasNames, desc)
            docx_tbl_inner = inner_tbl.render(self.doc)
            docx_tbl._cells.extend(docx_tbl_inner._cells)

    def build_bias(self, bias, d):

        row = 0
        tbl = TableMaker(self.COLUMN_WIDTHS, numHeaders=0,
                         firstRowCaption=False, tblStyle='ntpTbl')
        rowspan = 1

        if len(bias) == 1:
            if bias[0] == 'confounding':
                rowspan = len(d['confounders'])
                for i, cf in enumerate(d['confounders']):
                    fields = d['biasFields'][bias[0]]
                    txt = u'{}: {} {}\n{}'.format(cf[fields[0]], cf[fields[1]], cf[fields[2]], cf[fields[3]])
                    tbl.new_td_txt(i, 1, txt, colspan=2)
            else:
                fields = d['biasFields'][bias[0]]
                txt = u'{} {}\n{}'.format(d[fields[0]], d[fields[1]], d[fields[2]])
                tbl.new_td_txt(row, 1, txt, colspan=2)
        else:
            for i, b in enumerate(bias):
                fields = d['biasFields'][b]
                txt = u'{} {}\n{}'.format(d[fields[0]], d[fields[1]], d[fields[2]])
                tbl.new_td_txt(row, i + 1, txt)

        tbl.new_td_txt(row, 0, d['reference']['name'], rowspan=rowspan)


        return tbl

    def create_content(self):
        doc = self.doc
        d = self.context

        txt = u'{} {}: potential bias'.format(
            d['tables'][0]['volumeNumber'],
            d['tables'][0]['monographAgent'],
        )
        doc.add_heading(txt, level=1)
        doc.add_paragraph(d['tables'][0]['name'])

        for bias in [
                ['selectionBias'],
                ['exposureAssessment'],
                ['outcomeAssessment'],
                ['sensitivity'],
                ['confounding'],
                ['analysis', 'selectiveReporting'],
            ]:
            self.build_bias_table(bias, d['descriptions'])
            self.doc.add_page_break()

    def get_template_fn(self):
        return 'base.docx'
