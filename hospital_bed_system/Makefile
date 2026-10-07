CC = gcc
CFLAGS = -Wall -Wextra -std=c99 -pedantic -g
TARGET = hospital_bed_system.exe
SRCS = main.c bed.c patient.c search.c report.c file.c
OBJS = $(SRCS:.c=.o)

all: $(TARGET)

$(TARGET): $(OBJS)
	$(CC) $(CFLAGS) -o $@ $(OBJS)

%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

clean:
	del *.o $(TARGET) 2>nul || rm -f *.o $(TARGET)

run: all
	./$(TARGET)
