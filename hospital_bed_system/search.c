#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include "search.h"

#ifdef _WIN32
#define strcasecmp _stricmp
#endif

static void read_line(char *buf, int max) {
    if (fgets(buf, max, stdin)) {
        size_t len = strlen(buf);
        while (len > 0 && (buf[len - 1] == '\n' || buf[len - 1] == '\r')) {
            buf[len - 1] = '\0';
            len--;
        }
    }
}

int match_ignore_case(const char *haystack, const char *needle) {
    if (!haystack || !needle) return 0;
    if (!*needle) return 1;

    /* Simple case-insensitive substring search */
    for (; *haystack; haystack++) {
        const char *h = haystack;
        const char *n = needle;
        while (*h && *n && tolower((unsigned char)*h) == tolower((unsigned char)*n)) {
            h++;
            n++;
        }
        if (!*n) return 1;
    }
    return 0;
}

void search_by_id(const Bed beds[], int count) {
    char id[16];
    printf("\nEnter Bed ID: ");
    read_line(id, sizeof(id));
    if (!id[0]) return;

    int idx = find_bed_idx(beds, count, id);
    if (idx == -1) {
        printf("ERROR: Bed ID not found.\n");
        return;
    }

    printf("\nResult:");
    print_bed_card(&beds[idx]);
    printf("\n");
}

void search_by_ward(const Bed beds[], int count) {
    char ward[32];
    printf("\nEnter Ward Name: ");
    read_line(ward, sizeof(ward));
    if (!ward[0]) return;

    filter_by_ward(beds, count, ward);
}

void search_by_room(const Bed beds[], int count) {
    char room[16];
    printf("\nEnter Room Code: ");
    read_line(room, sizeof(room));
    if (!room[0]) return;

    int found = 0;
    print_table_header();
    for (int i = 0; i < count; i++) {
        if (strcasecmp(beds[i].room, room) == 0) {
            print_bed_row(&beds[i]);
            found++;
        }
    }
    printf("+---------+----------------------+-------+--------+-------------+------------+--------------+\n");
    if (!found) printf("No beds found in Room '%s'.\n", room);
}

void search_by_status(const Bed beds[], int count) {
    char buf[20];
    printf("\nEnter Status (AVAILABLE / OCCUPIED / CLEANING / RESERVED / MAINTENANCE): ");
    read_line(buf, sizeof(buf));
    BedStatus target = parse_status(buf);
    if (target == ST_INVALID) {
        printf("[!] Invalid status name.\n");
        return;
    }

    int found = 0;
    print_table_header();
    for (int i = 0; i < count; i++) {
        if (beds[i].status == target) {
            print_bed_row(&beds[i]);
            found++;
        }
    }
    printf("+---------+----------------------+-------+--------+-------------+------------+--------------+\n");
    printf("Total beds with status %s: %d\n", status_to_str(target), found);
}

void filter_available(const Bed beds[], int count) {
    int avail = 0;
    printf("\n=========================================================================================\n");
    printf("                               CURRENTLY AVAILABLE BEDS                                  \n");
    printf("=========================================================================================\n");
    print_table_header();
    for (int i = 0; i < count; i++) {
        if (beds[i].status == ST_AVAILABLE) {
            print_bed_row(&beds[i]);
            avail++;
        }
    }
    printf("+---------+----------------------+-------+--------+-------------+------------+--------------+\n");
    printf("Total Available Beds: %d / %d (%.1f%% available)\n",
           avail, count, count ? (avail * 100.0f / count) : 0.0f);
}

void filter_by_ward(const Bed beds[], int count, const char *ward) {
    int total = 0, avail = 0;
    printf("\n=========================================================================================\n");
    printf("                              BEDS IN WARD: %-45s\n", ward);
    printf("=========================================================================================\n");
    print_table_header();
    for (int i = 0; i < count; i++) {
        if (match_ignore_case(beds[i].ward, ward)) {
            print_bed_row(&beds[i]);
            total++;
            if (beds[i].status == ST_AVAILABLE) avail++;
        }
    }
    printf("+---------+----------------------+-------+--------+-------------+------------+--------------+\n");
    if (!total) {
        printf("No beds found in ward matching '%s'.\n", ward);
    } else {
        printf("Ward Summary: %d total beds | %d available | %d occupied/other\n",
               total, avail, total - avail);
    }
}

void filter_by_floor(const Bed beds[], int count, int floor) {
    const char *fname = (floor == 0) ? "Ground" : (floor == 1 ? "1st" : "2nd");
    int total = 0, avail = 0;
    printf("\n=========================================================================================\n");
    printf("                              BEDS ON FLOOR %d (%s Floor)                                \n", floor, fname);
    printf("=========================================================================================\n");
    print_table_header();
    for (int i = 0; i < count; i++) {
        if (beds[i].floor == floor) {
            print_bed_row(&beds[i]);
            total++;
            if (beds[i].status == ST_AVAILABLE) avail++;
        }
    }
    printf("+---------+----------------------+-------+--------+-------------+------------+--------------+\n");
    if (!total) printf("No beds found on Floor %d.\n", floor);
    else printf("Floor Summary: %d total beds | %d available\n", total, avail);
}
