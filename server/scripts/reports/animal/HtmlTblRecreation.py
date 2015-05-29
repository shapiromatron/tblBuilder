from ..utils import TableMaker, DOCXReport


class AnimalHtmlTblRecreation(DOCXReport):
    """
    Attempt to recreate HTML table in a Word-report.
    """

    def build_tbl(self, data):
        colWidths = [1.4, 1.8, 1.8, 1.0, 4.0]
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
                if len(ep["incidents"]) > 0 or len(ep["incidence_significance"]) > 0:
                    rowspan += 1
                if len(ep["multiplicities"]) > 0 or len(ep["multiplicity_significance"]) > 0:
                    rowspan += 1
                if len(ep["total_tumours"]) > 0 or len(ep["total_tumours_significance"]) > 0:
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
               d["doses"], d["dosingRegimen"], d["nStarts"], d["nSurvivings"]
            )
            tbl.new_td_txt(rows, 1, txt, rowspan=rowspan)

            # Columns C, D
            irows = rows
            for ep in d["endpoints"]:

                txt = u"{}: {}".format(ep["tumourSite"], ep["histology"])
                runs = [tbl.new_run(txt, b=True, newline=False)]
                tbl.new_td_run(irows, 2, runs, colspan=2)
                irows += 1

                if len(ep["incidents"]) > 0 or len(ep["incidence_significance"]) > 0:
                    tbl.new_td_txt(irows, 2, ep["incidents"])
                    tbl.new_td_txt(irows, 3, ep["incidence_significance"])
                    irows += 1

                if len(ep["multiplicities"]) > 0 or len(ep["multiplicity_significance"]) > 0:
                    tbl.new_td_txt(irows, 2, ep["multiplicities"])
                    tbl.new_td_txt(irows, 3, ep["multiplicity_significance"])
                    irows += 1

                if len(ep["total_tumours"]) > 0 or len(ep["total_tumours_significance"]) > 0:
                    tbl.new_td_txt(irows, 2, ep["total_tumours"])
                    tbl.new_td_txt(irows, 3, ep["total_tumours_significance"])
                    irows += 1

            # Column E
            runs = [
                tbl.new_run("Principal strengths:", b=True),
                tbl.new_run(d["strengths"]),
                tbl.new_run("Principal limitations:", b=True),
                tbl.new_run(d["limitations"]),
                tbl.new_run("Other comments:", b=True),
                tbl.new_run(d["comments"], newline=False),
            ]
            tbl.new_td_run(rows, 4, runs, rowspan=rowspan)

            rows += rowspan

        tbl.render(self.doc)

    def create_content(self):
        doc = self.doc
        d = self.context

        self.setLandscape()

        # title
        txt = "{} {}: {}".format(
            d["table"]["volumeNumber"],
            d["table"]["monographAgent"],
            d["table"]["name"]
        )
        p = doc.paragraphs[0]
        p.text = txt
        p.style = "Title"

        self.build_tbl(d)

    def get_template_fn(self):
        return "base.docx"
