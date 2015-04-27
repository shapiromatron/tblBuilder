from ..utils import TableMaker, DOCXReport


class NtpEpiResults(DOCXReport):

    def build_res_tbl(self, caption, results):
        colWidths = [1.5, 1.5, 0.75, 0.75, 1.0, 1.5, 3.0]
        styles = {
            "title": "RoCTabletitle",
            "header": "RoCColumnheading",
            "body": "RoCTablebody",
            "subheading" : None
        }
        tbl = TableMaker(colWidths, styles=styles, numHeaders=2, tblStyle="ntpTbl")

        # write title
        tbl.new_tbl_title(caption)

        # write header
        tbl.new_th(1, 0, "Reference, study-design, location, and year")
        tbl.new_th(1, 1, "Population description & exposure assessment method")
        tbl.new_th(1, 2, "Exposure category or level")
        tbl.new_th(1, 3, "Exposed cases/deaths")
        tbl.new_th(1, 4, "Risk estimate\n(95% CI)")
        tbl.new_th(1, 5, "Co-variates controlled")
        tbl.new_th(1, 6, "Comments, strengths, and weaknesses")

        # write additional rows
        rows = 2
        for res in results:

            rowspan = len(res["riskEstimates"])
            if res["hasTrendTest"]:
                rowspan += 1

            # Column A
            txt = u"{}\n{}\n{}\n{}".format(
                res["descriptive"]["reference"]["name"],
                res["descriptive"]["studyDesign"],
                res["descriptive"]["location"],
                res["descriptive"]["enrollmentDates"]
            )
            tbl.new_td_txt(rows, 0, txt, rowspan=rowspan)

            # Column B
            runs = [
                tbl.new_run(res["descriptive"].get("eligibilityCriteria", "")),
                tbl.new_run("Exposure assessment method: ", b=True, newline=False),
                tbl.new_run(res["descriptive"]["exposureAssessmentType"], newline=False)
            ]
            tbl.new_td_run(rows, 1, runs, rowspan=rowspan)

            # Columns C,D,E
            for i, est in enumerate(res["riskEstimates"]):
                tbl.new_td_txt(rows+i, 2, est["exposureCategory"])
                tbl.new_td_txt(rows+i, 3, unicode(est["numberExposed"]))
                tbl.new_td_txt(rows+i, 4, unicode(est["riskFormatted"]))

            if res["hasTrendTest"]:
                runs = [
                    tbl.new_run("Trend-test ", newline=False),
                    tbl.new_run("P", i=True, newline=False),
                    tbl.new_run("-value: {}".format(res["trendTest"]), newline=False),
                ]
                tbl.new_td_run(rows+i+1, 2, runs, colspan=3)

            # Column F
            txt = res["covariatesList"]
            tbl.new_td_txt(rows, 5, txt, rowspan=rowspan)

            # Column G
            runs = [
                tbl.new_run(res["descriptive"].get("exposureLevel", "")),
                tbl.new_run("Confounding:", b=True),
                tbl.new_run(res.get("covariatesControlledText", "")),
                tbl.new_run("Strengths:", b=True),
                tbl.new_run(res["descriptive"]["strengths"]),
                tbl.new_run("Limitations:", b=True),
                tbl.new_run(res["descriptive"]["limitations"], newline=False)
            ]
            tbl.new_td_run(rows, 6, runs, rowspan=rowspan)

            # increment rows
            rows += rowspan

        tbl.render(self.doc)

    def create_content(self):
        doc = self.doc
        d = self.context

        self.setLandscape()

        # title
        txt = "{} {}: Results by organ-site".format(d["volumeNumber"], d["monographAgent"])
        p = doc.paragraphs[0]
        p.text = txt
        p.style = "Title"

        # build table for each organ-site
        for organSite in sorted(
            d["organSites"],
            key=lambda d: d["organSite"]
        ):
            txt = "Table X: Epidemiological exposure to {}: {}".format(d["monographAgent"], organSite["organSite"])
            self.build_res_tbl(txt, organSite["results"])
            self.doc.add_page_break()

    def get_template_fn(self):
        return "baseRoC.docx"
