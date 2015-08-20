from docxUtils.reports import DOCXReport
from docxUtils.tables import TableMaker


class ExposureTables(DOCXReport):

    def buildOccupationalTable(self, exposures):
        colWidths = [1.7, 1, 1.7, 1.3, 2.0, 1.3]
        tbl = TableMaker(colWidths, numHeaders=2, tblStyle="ntpTbl")

        # write title
        txt = "Occupational exposure data"
        tbl.new_th(0, 0, txt, colspan=6)

        # write header
        tbl.new_th(1, 0, "Industry, country, year")
        tbl.new_th(1, 1, "Job/process")
        tbl.new_th(1, 2, "Mean")
        tbl.new_th(1, 3, "Range")
        tbl.new_th(1, 4, "Comments/\nadditional data")
        tbl.new_th(1, 5, "References")

        row = 2
        for d in exposures:
            runs = [
                tbl.new_run(d["occupation"], newline=True, b=True),
                tbl.new_run(u"{}, {}".format(d["location"], d["collectionDate"]),
                            newline=False)
            ]
            tbl.new_td_run(row, 0, runs)

            tbl.new_td_txt(row, 1, d["occupationInfo"])

            txt = u"{} {} ({}, {})".format(
                d["exposureLevel"],
                d["units"],
                d["exposureLevelDescription"],
                d["agent"]
            )
            tbl.new_td_txt(row, 2, txt)

            txt = u"{} {}".format(d["exposureLevelRange"], d["units"])
            tbl.new_td_txt(row, 3, txt)

            tbl.new_td_txt(row, 4, d["comments"])
            tbl.new_td_txt(row, 5, d["reference"]["name"])
            row += 1

        tbl.render(self.doc)
        self.doc.add_page_break()

    def buildEnviroMixedTables(self, exposures, title):
        colWidths = [2, 1.5, 1.5, 2, 2]
        tbl = TableMaker(colWidths, numHeaders=2, tblStyle="ntpTbl")

        # write title
        tbl.new_th(0, 0, title, colspan=5)

        # write header
        tbl.new_th(1, 0, "Region, country (city)")
        tbl.new_th(1, 1, "Mean")
        tbl.new_th(1, 2, "Range")
        tbl.new_th(1, 3, "Comments/\nadditional data")
        tbl.new_th(1, 4, "References")

        row = 2
        for d in exposures:
            runs = [
                tbl.new_run(d["country"], newline=True, b=True),
                tbl.new_run(
                    u"{}, {}".format(d["location"], d["collectionDate"],
                    newline=False)
                )
            ]
            tbl.new_td_run(row, 0, runs)

            txt = u"{} {} ({}, {})".format(
                d["exposureLevel"],
                d["units"],
                d["exposureLevelDescription"],
                d["agent"]
            )
            tbl.new_td_txt(row, 1, txt)

            txt = u"{} {}".format(d["exposureLevelRange"], d["units"])
            tbl.new_td_txt(row, 2, txt)

            tbl.new_td_txt(row, 3, d["comments"])
            tbl.new_td_txt(row, 4, d["reference"]["name"])
            row += 1

        tbl.render(self.doc)
        self.doc.add_page_break()

    def buildMixedTable(self, exposures):
        pass

    def create_content(self):
        self.setLandscape()
        doc = self.doc
        d = self.context

        txt = "{} {}: Exposure evidence".format(
            d["table"]["volumeNumber"],
            d["table"]["monographAgent"]
        )
        doc.add_heading(txt, level=1)
        doc.add_paragraph(d["table"]["name"])

        self.buildOccupationalTable(d["occupationals"])
        self.buildEnviroMixedTables(d["environmentals"], "Environmental exposure data")
        self.buildEnviroMixedTables(d["mixed"], "Integrated/mixed exposure data")

    def get_template_fn(self):
        return "base.docx"
