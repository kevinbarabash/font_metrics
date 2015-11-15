import argparse
import json

from fontTools.ttLib import TTFont

parser = argparse.ArgumentParser(
    description='Get glyph metrics from a TrueType font')
parser.add_argument(
    'input_file', type=str, help='the font file to read')

args = parser.parse_args()

font_info = TTFont(args.input_file)

basic_latin = range(0x0020, 0x007F)
latin_1 = range(0x0080, 0x00FF)
greek = range(0x0370, 0x03FF)
math_operators = range(0x2200, 0x22FF)

char_list = basic_latin + latin_1 + greek + math_operators

cmap = {}

for t in font_info['cmap'].tables:
    for k, v in t.cmap.iteritems():
        if k in char_list:
            cmap[k] = v

        if k in cmap and cmap[k] != v:
            print "%s: %s != %s" % (k, cmap[k], v)

glyf = font_info["glyf"]
hmtx = font_info["hmtx"]

glyph_metrics = {}

for k, v in cmap.iteritems():
    glyph = glyf[v]
    [advance, _] = hmtx[v]

    xMin = getattr(glyph, "xMin", 0)
    yMin = getattr(glyph, "yMin", 0)
    xMax = getattr(glyph, "xMax", 0)
    yMax = getattr(glyph, "yMax", 0)

    bearingX = xMin
    bearingY = yMin
    width = xMax - xMin
    height = yMax - yMin

    glyph_metrics[k] = {
        "advance": advance,
        "bearingX": bearingX,
        "bearingY": bearingY,
        "width": width,
        "height": height
    }

print json.dumps(glyph_metrics, indent=4, sort_keys=True)

