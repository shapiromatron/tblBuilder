from docxUtils.reports import DOCXReport
from docxUtils.tables import TableMaker


def null_getter(d, fld, default='-'):
    """
    Return value if not falsy else default value
    """
    return d.get(fld, default) or default


class EpiExposureAssessmentTables(DOCXReport):

    COLUMN_WIDTHS = [1.0, 1.8, 1.6, 1.6, 1.4, 1.6]

    def _build_table(self, data):
        tbl = TableMaker(
            self.COLUMN_WIDTHS, numHeaders=0,
            firstRowCaption=False, tblStyle='ntpTbl'
        )

        # write header
        tbl.new_th(0, 0, 'Exposure assessment method')
        tbl.new_th(0, 1, 'Description')
        tbl.new_th(0, 2, 'Strengths')
        tbl.new_th(0, 3, 'Limitations')
        tbl.new_th(0, 4, 'Reference')
        tbl.new_th(0, 5, 'Notes')

        # write data rows
        for i, d in enumerate(data['descriptions']):
            r = i + 1

            txt = null_getter(d, 'exposureAssessmentType')
            tbl.new_td_txt(r, 0, txt)

            txt = '\n'.join([
                null_getter(d, 'exposureAssessmentPopulationDetails'),
                null_getter(d, 'exposureAssessmentNotes')
            ])
            tbl.new_td_txt(r, 1, txt)

            txt = null_getter(d, 'exposureAssessmentStrengths')
            tbl.new_td_txt(r, 2, txt)

            txt = null_getter(d, 'exposureAssessmentLimitations')
            tbl.new_td_txt(r, 3, txt)

            txt = d['reference']['name']
            tbl.new_td_txt(r, 4, txt)

            txt = null_getter(d, 'exposureAssessmentComments')
            tbl.new_td_txt(r, 5, txt)

        return tbl

    def create_content(self):
        doc = self.doc
        d = self.context

        self.setLandscape()

        # title
        txt = (f'{d["tables"][0]["volumeNumber"]} {d["tables"][0]["monographAgent"]}:'
               ' Exposure assessment in key epidemiologic studies')
        p = doc.paragraphs[0]
        p.text = txt
        p.style = 'Title'
        doc.add_paragraph(d['tables'][0]['name'])
        tbl = self._build_table(d)
        tbl.render(self.doc)

    def get_template_fn(self):
        return 'base.docx'
