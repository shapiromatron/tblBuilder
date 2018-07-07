from textwrap import dedent

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
        tbl = TableMaker(
            colWidths, numHeaders=1, tblStyle="ntpTbl", firstRowCaption=False
        )

        # write header
        tbl.new_th(0, 0, "Reference")
        tbl.new_th(0, 1, "Test system")
        tbl.new_th(0, 2, "Endpoint/\ntest")
        tbl.new_th(0, 3, "Results")
        tbl.new_th(0, 4, "Results (with metabolic activation)")
        tbl.new_th(0, 5, "Agent, LED/HID dose")
        tbl.new_th(0, 6, "Comments")

        row = 0
        for d in self.context["objects"]:
            row += 1

            txt = dedent(
                f"""\
                {d['reference']['name']}
                {d['dataClass']}"""
            )
            tbl.new_td_txt(row, 0, txt)

            txt = d["col2"]
            tbl.new_td_txt(row, 1, txt)

            txt = d["col3"]
            tbl.new_td_txt(row, 2, txt)

            txt = d["col4"]
            tbl.new_td_txt(row, 3, txt)

            txt = d["col5"]
            tbl.new_td_txt(row, 4, txt)

            txt = d["col6"]
            tbl.new_td_txt(row, 5, txt)

            txt = d["wrd_comments"]
            tbl.new_td_txt(row, 6, txt)

        tbl.render(self.doc)
