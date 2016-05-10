from docxUtils.reports import DOCXReport
from docxUtils.tables import TableMaker

from .genotoxTables import GenotoxTables


class GenotoxHtmlTables(GenotoxTables):

    def create_content(self):
        self.setLandscape()
        self.buildHeader()
        self.buildTable()

    def get_template_fn(self):
        return "base.docx"

    def buildTable(self):
        colWidths = [1.35, 1.8, 1.35, 0.9, 0.9, 0.9, 1.8]
        tbl = TableMaker(colWidths, numHeaders=1,
                         tblStyle='ntpTbl', firstRowCaption=False)

        # write header
        tbl.new_th(0, 0, 'Reference')
        tbl.new_th(0, 1, 'Test system')
        tbl.new_th(0, 2, 'Endpoint/\ntest')
        tbl.new_th(0, 3, 'Results')
        tbl.new_th(0, 4, 'Results (with metabolic activation)')
        tbl.new_th(0, 5, 'Agent, LED/HID dose')
        tbl.new_th(0, 6, 'Comments')

        tbl.render(self.doc)
