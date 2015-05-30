#include <stdio.h>
#include <stdbool.h>

#include <ft2build.h>
#include FT_FREETYPE_H

FT_Library library;
FT_Face face;
FT_Error error;

void write_metrics(const char *filename, int first, int last) {
    FILE *fp;
    fp = fopen(filename, "w");
    fprintf(fp, "{\n");
    _Bool is_first = true;

    for (int i = first; i <= last; i++) {
        FT_UInt index = FT_Get_Char_Index(face, i);
        if (index == 0) {
            // printf("character %#06x not found\n", i);
            continue;
        }

        error = FT_Load_Glyph(face, index, FT_LOAD_NO_SCALE);
        if (error) {
            printf("error loading glyph: %d (%d)\n", i, error);
            continue;
        }

        if (is_first) {
            is_first = false;
        } else {
            fprintf(fp, ",\n");
        }

        FT_GlyphSlot slot = face->glyph;
        FT_Glyph_Metrics metrics = slot->metrics;

        fprintf(fp, "  \"%d\": {\n", i);
        fprintf(fp, "    \"width\": %ld,\n", metrics.width);
        fprintf(fp, "    \"height\": %ld,\n", metrics.height);
        fprintf(fp, "    \"advance\": %ld,\n", metrics.horiAdvance);
        fprintf(fp, "    \"bearingX\": %ld,\n", metrics.horiBearingX);
        fprintf(fp, "    \"bearingY\": %ld\n", metrics.horiBearingY);
        fprintf(fp, "  }");
    }
    fprintf(fp, "\n}\n");
    fclose(fp);
}

int main(void) {

    error = FT_Init_FreeType(&library);

    if (error) {
        printf("error: %d\n", error);
        exit(1);
    }

    error = FT_New_Face(library, "Comic Sans MS.ttf", 0, &face);
    if (error) {
        printf("error opening file");
        exit(1);
    }

    // TODO include this info in the JSON
    printf("units per EM %d\n", face->units_per_EM);
    printf("ascender: %d\n", face->ascender);
    printf("descender: %d\n", face->descender);
    printf("height: %d\n", face->height);
    printf("number of glyphs: %ld\n", face->num_glyphs);
    printf("bbox:\n");
    printf("  xMin: %ld\n", face->bbox.xMin);
    printf("  yMin: %ld\n", face->bbox.yMin);
    printf("  xMax: %ld\n", face->bbox.xMax);
    printf("  yMax: %ld\n", face->bbox.yMax);
    printf("underline_thickness: %d\n", face->underline_thickness);
    printf("underline_position: %d\n", face->underline_position);

    write_metrics("json/basic-latin.json", 0x0000, 0x007F);
    write_metrics("json/latin-1.json", 0x0080, 0x00FF);
    write_metrics("json/greek.json", 0x0370, 0x03FF);
    write_metrics("json/math-operators.json", 0x2200, 0x22FF);

    // if (slot->format == FT_GLYPH_FORMAT_OUTLINE) {
    //   printf("outline\n");
    // }

    // printf("number of contours: %d\n", slot->outline.n_contours);
    // printf("number of points: %d\n", slot->outline.n_points);
    // for (int i = 0; i < slot->outline.n_points; i++) {
    //   printf("%d\n", slot->outline.tags[i]);
    // }

    return 0;
}
