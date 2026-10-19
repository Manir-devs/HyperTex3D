# File: Makefile
# Location: HyperTex3D/Makefile

CC = gcc
CFLAGS = -Wall -std=c99 -O3 -I./src
LDFLAGS = -lraylib -lGL -lm -lpthread -ldl -lrt -lX11

SRC = src/main.c src/engine.c src/ui.c src/fileio.c
OBJ = $(SRC:src/%.c=build/%.o)
OUT = app/hypertex3d

all: setup $(OUT)

setup:
	@mkdir -p build app app/backups

$(OUT): $(OBJ)
	$(CC) $(OBJ) -o $(OUT) $(LDFLAGS)

build/%.o: src/%.c src/hypertex.h
	$(CC) $(CFLAGS) -c $< -o $@

clean:
	rm -rf build/*.o app/hypertex3d
