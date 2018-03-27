from io import BytesIO
import json
import os
import urllib.parse
import six
import sys

from ftptool import FTPHost
import xlsxwriter


# from https://docs.djangoproject.com/en/1.10/_modules/django/utils/encoding/
def smart_text(s, encoding='utf-8', strings_only=False, errors='strict'):
    """
    Returns a text object representing 's' -- unicode on Python 2 and str on
    Python 3. Treats bytestrings using the 'encoding' codec.

    If strings_only is True, don't convert (some) non-string-like objects.
    """
    return force_text(s, encoding, strings_only, errors)


# from https://docs.djangoproject.com/en/1.10/_modules/django/utils/encoding/
def force_text(s, encoding='utf-8', strings_only=False, errors='strict'):
    """
    Similar to smart_text, except that lazy instances are resolved to
    strings, rather than kept as lazy objects.

    If strings_only is True, don't convert (some) non-string-like objects.
    """
    # Handle the common case first for performance reasons.
    if issubclass(type(s), six.text_type):
        return s
    try:
        if not issubclass(type(s), six.string_types):
            if six.PY3:
                if isinstance(s, bytes):
                    s = six.text_type(s, encoding, errors)
                else:
                    s = six.text_type(s)
            elif hasattr(s, '__unicode__'):
                s = six.text_type(s)
            else:
                s = six.text_type(bytes(s), encoding, errors)
        else:
            # Note: We use .decode() here, instead of six.text_type(s, encoding,
            # errors), so that if s is a SafeBytes, it ends up being a
            # SafeText at the end.
            s = s.decode(encoding, errors)
    except UnicodeDecodeError as e:
        # If we get to here, the caller has passed in an Exception
        # subclass populated with non-ASCII bytestring data without a
        # working unicode method. Try to handle this without raising a
        # further exception by individually forcing the exception args
        # to unicode.
        s = ' '.join(force_text(arg, encoding, strings_only, errors)
                     for arg in s)
    return s


def _get_ftp_data(data):
    outputs = []
    conn = FTPHost.connect(
        data['address'], user=data['user'], password=data['password'])
    for (dirname, subdirs, files) in conn.walk(data.get('path', '/')):
        outputs.append((dirname, files))
    conn.try_quit()
    return outputs


def _get_root_url(data):
    return f'ftp://{data["user"]}:{data["password"]}@{data["address"]}'


def _populate_workbook(wb, root_url, data):
    ws = wb.add_worksheet()

    # write header rows
    ws.write(0, 0, 'Folder')
    ws.write(0, 1, 'Filename')
    ws.write(0, 2, 'URL')

    parser = urllib.parse.quote

    # write data rows
    row = 0
    for path, files in data:
        for fn in files:
            row += 1
            path_url = parser(os.path.join(path.decode('utf8'), fn.decode('utf8')).encode('utf8'))
            url = root_url + path_url
            ws.write(row, 0, smart_text(path))
            ws.write(row, 1, smart_text(fn))
            ws.write(row, 2, smart_text(url))

    # setup header and autofilter
    bold = wb.add_format({'bold': True})
    ws.set_row(0, None, bold)
    ws.autofilter(f'A1:C{row + 1}')

    # set widths
    ws.set_column('A:A', 30)
    ws.set_column('B:B', 65)
    ws.set_column('C:C', 100)


def _generate_xlsx(data):
    # create workbook
    output = BytesIO()
    wb = xlsxwriter.Workbook(output, {'constant_memory': True})

    # add stuff to workbook
    ftp_data = _get_ftp_data(data)
    root_url = _get_root_url(data)
    _populate_workbook(wb, root_url, ftp_data)

    # return base64 encoded workbook
    wb.close()
    output.seek(0)
    return output.read().encode('base64')


if __name__ == "__main__":
    for data in sys.stdin:
        b64 = _generate_xlsx(json.loads(data))
        print((json.dumps({'xlsx': b64})))
