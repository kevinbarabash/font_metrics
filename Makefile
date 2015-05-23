CC = cc
CFLAGS = `freetype-config --cflags`
LIBS = `freetype-config --libs`

fttest:	fttest.c
	$(CC) fttest.c -o fttest $(CFLAGS) $(LIBS)
