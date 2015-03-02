from utils import DOCXReport


class NtpEpiDescriptive(DOCXReport):

    def create_content(self):
        self.doc.add_heading("I'm a descriptive report", 0)


class NtpEpiResults(DOCXReport):

    def create_content(self):
        self.doc.add_heading("I'm a results report", 0)
