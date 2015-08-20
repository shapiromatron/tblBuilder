from docxUtils.reports import DOCXReport
from docxUtils.tables import TableMaker


class AnimalHtmlTables(DOCXReport):
    """
    Attempt to recreate HTML table in a Word-report.
    """

    def build_tbl(self, data):
        colWidths = [1.4, 1.8, 1.8, 1.0, 3.0]
        tbl = TableMaker(colWidths, numHeaders=1, firstRowCaption=False, tblStyle="ntpTbl")

        # write header
        tbl.new_th(0, 0, "Study design\nSpecies, strain (sex)\nAge at start\nDuration\nReference")
        tbl.new_th(0, 1, "Route\nAgent tested, purity\nVehicle\nDose(s)\n# animals at start\n# surviving animals")
        tbl.new_th(0, 2, "Results")
        tbl.new_th(0, 3, "Significance")
        tbl.new_th(0, 4, "Comments")

        # write additional rows
        rows = 1
        for d in data["studies"]:

            rowspan = 0
            for ep in d["endpoints"]:
                rowspan += 1
                if len(ep["wrd_incidents"]) > 0 or len(ep["wrd_incidence_significance"]) > 0:
                    rowspan += 1
                if len(ep["wrd_multiplicities"]) > 0 or len(ep["wrd_multiplicity_significance"]) > 0:
                    rowspan += 1
                if len(ep["wrd_total_tumours"]) > 0 or len(ep["wrd_total_tumours_significance"]) > 0:
                    rowspan += 1

            # Column A
            runs = [
                tbl.new_run(d["studyDesign"], b=True),
                tbl.new_run(d["species"], b=True, newline=False),
                tbl.new_run(u", {} {}".format(d["strain"], d["sex"])),
                tbl.new_run(d["ageAtStart"]),
                tbl.new_run(d["duration"]),
                tbl.new_run(d["reference"]["name"], newline=False),
            ]
            tbl.new_td_run(rows, 0, runs, rowspan=rowspan)

            # Column B
            txt = u"{}\n{}, {}\n{}\n{}\n{}\n{}\n{}".format(
               d["dosingRoute"], d["agent"], d["purity"], d["vehicle"],
               d["wrd_doses"], d["dosingRegimen"], d["wrd_nStarts"], d["wrd_nSurvivings"]
            )
            tbl.new_td_txt(rows, 1, txt, rowspan=rowspan)

            # Columns C, D
            irows = rows
            for ep in d["endpoints"]:

                txt = u"{}: {}".format(ep["tumourSite"], ep["histology"])
                runs = [tbl.new_run(txt, b=True, newline=False)]
                tbl.new_td_run(irows, 2, runs, colspan=2)
                irows += 1

                if len(ep["wrd_incidents"]) > 0 or len(ep["wrd_incidence_significance"]) > 0:
                    tbl.new_td_txt(irows, 2, ep["wrd_incidents"])
                    tbl.new_td_txt(irows, 3, ep["wrd_incidence_significance"])
                    irows += 1

                if len(ep["wrd_multiplicities"]) > 0 or len(ep["wrd_multiplicity_significance"]) > 0:
                    tbl.new_td_txt(irows, 2, ep["wrd_multiplicities"])
                    tbl.new_td_txt(irows, 3, ep["wrd_multiplicity_significance"])
                    irows += 1

                if len(ep["wrd_total_tumours"]) > 0 or len(ep["wrd_total_tumours_significance"]) > 0:
                    tbl.new_td_txt(irows, 2, ep["wrd_total_tumours"])
                    tbl.new_td_txt(irows, 3, ep["wrd_total_tumours_significance"])
                    irows += 1

            # Column E
            runs = [
                tbl.new_run("Principal strengths:", b=True),
                tbl.new_run(d["wrd_strengths"]),
                tbl.new_run("Principal limitations:", b=True),
                tbl.new_run(d["wrd_limitations"]),
                tbl.new_run("Other comments:", b=True),
                tbl.new_run(d["wrd_comments"], newline=False),
            ]
            tbl.new_td_run(rows, 4, runs, rowspan=rowspan)

            rows += rowspan

        tbl.render(self.doc)

    def create_content(self):
        doc = self.doc
        d = self.context

        self.setLandscape()

        txt = u"{} {}: Animal evidence".format(
            d["table"]["volumeNumber"],
            d["table"]["monographAgent"],
        )
        doc.add_heading(txt, level=1)
        doc.add_paragraph(d["table"]["name"])
        self.build_tbl(d)

    def get_template_fn(self):
        return "base.docx"
