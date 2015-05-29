from ..utils import TableMaker, DOCXReport


class EpiHtmlTblRecreation(DOCXReport):
    """
    Attempt to recreate HTML table in a Word-report.
    """

    def getCol2(self, d, tbl):
        # recreation of table-helper
        runs = []
        if d["isCaseControl"]:
            runs.append(tbl.new_run("Cases: ", b=True))
            runs.append(tbl.new_run(u"{} ({}); {}".format(
                            d["populationSizeCase"],
                            d["responseRateCase"],
                            d["sourceCase"])))
            runs.append(tbl.new_run("Controls: ", b=True))
            runs.append(tbl.new_run(u"{} ({}); {}".format(
                        d["populationSizeControl"],
                        d["responseRateControl"],
                        d["sourceControl"])))
        else:
            runs.append(tbl.new_run(u"{}; {}".format(
                        d["populationSize"],
                        d["eligibilityCriteria"])))

        runs.append(tbl.new_run("Exposure assessment method: ", b=True))
        if d["exposureAssessmentType"].lower().find("other")>=0:
            runs.append(tbl.new_run("other", newline=False))
        else:
            runs.append(tbl.new_run(d["exposureAssessmentType"], newline=False))

        if d.get("exposureAssessmentNotes"):
            runs.append(tbl.new_run(u"; " + d.get("exposureAssessmentNotes")))

        if d.get("outcomeDataSource"):
            runs.append(tbl.new_run(d.get("outcomeDataSource"), newline=False))

        return runs

    def build_tbl(self, data):
        colWidths = [1.5, 2.0, 0.8, 1.1, 0.6, 1.0, 0.8, 2.0]
        tbl = TableMaker(colWidths, numHeaders=1, firstRowCaption=False, tblStyle="ntpTbl")

        # write header
        tbl.new_th(0, 0, "Reference, location follow-up/enrollment period, study-design")
        tbl.new_th(0, 1, "Population size, description, exposure assessment method")
        tbl.new_th(0, 2, "Organ site (ICD code)")
        tbl.new_th(0, 3, "Exposure category or level")
        tbl.new_th(0, 4, "Exposed cases/ deaths")
        tbl.new_th(0, 5, "Risk estimate (95% CI)")
        tbl.new_th(0, 6, "Covariates controlled")
        tbl.new_th(0, 7, "Comments")

        # write additional rows
        rows = 1
        for d in data["descriptions"]:

            for res in d["results"]:
                res["_rowspan"] = max(len(res["riskEstimates"]), 1)
                if res["hasTrendTest"]:
                    res["_rowspan"] += 1

            st_rowspan = sum(res["_rowspan"] for res in d["results"])

            # Column A
            runs = [
                tbl.new_run(d["reference"]["name"]),
                tbl.new_run(d["location"]),
                tbl.new_run(d["enrollmentDates"]),
                tbl.new_run(d["studyDesign"]),
            ]
            tbl.new_td_run(rows, 0, runs, rowspan=st_rowspan)

            # Column B
            runs = self.getCol2(d, tbl)
            tbl.new_td_run(rows, 1, runs, rowspan=st_rowspan)

            # Columns C, D, E, F, G
            irows = rows
            for res in d["results"]:
                tbl.new_td_txt(irows, 2, res["organSite"], rowspan=res["_rowspan"])
                for i, est in enumerate(res["riskEstimates"]):
                    tbl.new_td_txt(irows+i, 3, est["exposureCategory"])
                    tbl.new_td_txt(irows+i, 4, unicode(est["numberExposed"]))
                    tbl.new_td_txt(irows+i, 5, unicode(est["riskFormatted"]))

                tbl.new_td_txt(irows, 6, res["covariatesList"], rowspan=res["_rowspan"])

                if res["hasTrendTest"]:
                    txt = u"Trend-test p-value: {}".format(res["trendTest"])
                    tbl.new_td_txt(irows+i+1, 3, txt, colspan=3)

                irows += res["_rowspan"]

            # Column H
            runs = [
                tbl.new_run(d.get("notes")),
                tbl.new_run("Strengths: ", b=True, newline=False),
                tbl.new_run(d.get("strengths")),
                tbl.new_run("Limitations: ", b=True, newline=False),
                tbl.new_run(d.get("limitations")),
            ]
            tbl.new_td_run(rows, 7, runs, rowspan=st_rowspan)

            rows += st_rowspan

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
