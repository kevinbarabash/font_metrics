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


void write_outline(FILE *fp, FT_GlyphSlot slot) {
    int contour_start = -1;

    _Bool is_first_contour = true;
    for (int i = 0; i < slot->outline.n_contours; i++) {
        if (is_first_contour) {
            is_first_contour = false;
        } else {
            fprintf(fp, ",\n");
        }
        fprintf(fp, "    [\n");
        int contour_end = slot->outline.contours[i];
        _Bool is_first_point = true;
        for (int j = contour_start + 1; j <= contour_end; j++) {
            FT_Vector point = slot->outline.points[j];
            char tag = slot->outline.tags[j];
            if (is_first_point) {
                is_first_point = false;
            } else {
                fprintf(fp, ",\n");
            }
            fprintf(fp, "      [%ld, %ld, %d]", point.x, point.y, tag);
        }
        fprintf(fp, "    ]");
        contour_start = contour_end;
    }
}

void write_outlines(const char *filename, int first, int last) {
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

        fprintf(fp, "  \"%d\": [\n", i);
        write_outline(fp, face->glyph);
        fprintf(fp, "\n  ]");
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

    write_metrics("metrics/basic-latin.json", 0x0000, 0x007F);
    write_metrics("metrics/latin-1.json", 0x0080, 0x00FF);
    write_metrics("metrics/greek.json", 0x0370, 0x03FF);
    write_metrics("metrics/math-operators.json", 0x2200, 0x22FF);


    FT_UInt index = FT_Get_Char_Index(face, 65);    // A

    error = FT_Load_Glyph(face, index, FT_LOAD_NO_SCALE);
    if (error) {
        printf("error loading glyph: %d (%d)\n", 65, error);
    }

    FT_GlyphSlot slot = face->glyph;

    if (slot->format == FT_GLYPH_FORMAT_OUTLINE) {
        printf("outline\n");
    }

    printf("number of contours: %d\n", slot->outline.n_contours);

    write_outlines("outlines/basic-latin.json", 0x0000, 0x007F);
    write_outlines("outlines/latin-1.json", 0x0080, 0x00FF);
    write_outlines("outlines/greek.json", 0x0370, 0x03FF);
    write_outlines("outlines/math-operators.json", 0x2200, 0x22FF);

    return 0;
}
