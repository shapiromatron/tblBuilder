from docxUtils.reports import DOCXReport


class MechanisticEvidenceHtmlTables(DOCXReport):

    def write_node(self, node, lvl):
        p = self.doc.add_paragraph('\t'*lvl)
        if 'hasSubheading' in node and node['hasSubheading'] is True:
            run = p.add_run(node['subheading'] + ': ')
            run.bold = True

        p.add_run(node['text'])

        if len(node['references']) > 0:
            run = p.add_run(' ' + node['references'])
            run.italic = True

        for child in node['children']:
            self.write_node(child, lvl+1)

    def write_nodes(self, data):
        doc = self.doc
        for section in data['sections']:
            doc.add_heading(section['description'], level=3)
            for child in section['children']:
                self.write_node(child, 1)

    def create_content(self):
        doc = self.doc
        d = self.context

        txt = '{} {}: Mechanistic evidence summary'.format(
            d['table']['volumeNumber'],
            d['table']['monographAgent'],
        )
        p = doc.paragraphs[0]
        p.text = txt
        p.style = 'Title'
        doc.add_paragraph(d['table']['name'])
        self.write_nodes(d)

    def get_template_fn(self):
        return 'base.docx'
