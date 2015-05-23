#include <stdio.h>
#include <stdbool.h>

#include <ft2build.h>
#include FT_FREETYPE_H

FT_Library library;
FT_Face face;
FT_Error error;

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
//    printf("units per EM %d\n", face->units_per_EM);
//    printf("ascender %d\n", face->ascender);
//    printf("descender %d\n", face->descender);
//    printf("height %d\n", face->height);
//    printf("number of glyphs: %ld\n", face->num_glyphs);

    printf("{\n");
    _Bool first = true;
    
    // TODO add a switch to control this
    for (int i = 0x0000; i <= 0x024F; i++) {
        FT_UInt index = FT_Get_Char_Index(face, i);
        if (index != 0) {
            error = FT_Load_Glyph(face, i, FT_LOAD_NO_SCALE);
            if (error) {
                printf("error loading glyph: %d (%d)\n", i, error);
                continue;
            }
            FT_GlyphSlot slot = face->glyph;
            FT_Glyph_Metrics metrics = slot->metrics;
            if (first) {
                first = false;
            } else {
                printf(",\n");
            }
            printf("  \"%#06x\": {\n", i);
            printf("    \"width\": %ld,\n", metrics.width);
            printf("    \"height\": %ld,\n", metrics.height);
            printf("    \"advance\": %ld,\n", metrics.horiAdvance);
            printf("    \"bearingX\": %ld,\n", metrics.horiBearingX);
            printf("    \"bearingY\": %ld\n", metrics.horiBearingY);
            printf("  }");
        }
    }
    printf("\n}\n");
    
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
