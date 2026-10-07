#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <ctype.h>
#include "bed.h"

#ifdef _WIN32
#define strcasecmp _stricmp
#endif

static const char *STATUS_NAMES[] = {
    "AVAILABLE", "OCCUPIED", "CLEANING", "RESERVED", "MAINTENANCE"
};

const char *status_to_str(BedStatus st) {
    if (st >= ST_AVAILABLE && st <= ST_MAINTENANCE) {
        return STATUS_NAMES[st];
    }
    return "UNKNOWN";
}

BedStatus parse_status(const char *str) {
    if (!str) return ST_INVALID;
    for (int i = 0; i <= ST_MAINTENANCE; i++) {
        if (strcasecmp(str, STATUS_NAMES[i]) == 0) return (BedStatus)i;
    }
    return ST_INVALID;
}

int is_valid_status_str(const char *str) {
    return parse_status(str) != ST_INVALID;
}

void get_timestamp(char *buf, int len) {
    time_t now = time(NULL);
    struct tm *t = localtime(&now);
    if (t) strftime(buf, len, "%I:%M %p", t);
    else strncpy(buf, "10:00 AM", len);
}

int find_bed_idx(const Bed beds[], int count, const char *id) {
    if (!beds || !id || !*id) return -1;
    for (int i = 0; i < count; i++) {
        if (strcasecmp(beds[i].id, id) == 0) return i;
    }
    return -1;
}

int add_bed(Bed beds[], int *count, const Bed *new_bed) {
    if (!beds || !count || !new_bed) return 0;
    if (*count >= MAX_BEDS) {
        printf("[!] Hospital bed capacity reached (%d max).\n", MAX_BEDS);
        return 0;
    }
    if (!new_bed->id[0]) {
        printf("[!] Bed ID cannot be blank.\n");
        return 0;
    }
    if (find_bed_idx(beds, *count, new_bed->id) != -1) {
        printf("[!] Duplicate bed ID: %s already exists.\n", new_bed->id);
        return 0;
    }
    if (new_bed->status == ST_INVALID) {
        printf("[!] Invalid status specified.\n");
        return 0;
    }

    beds[*count] = *new_bed;
    (*count)++;
    return 1;
}

int update_bed_status(Bed beds[], int count, const char *id, BedStatus new_status) {
    int idx = find_bed_idx(beds, count, id);
    if (idx == -1) {
        printf("ERROR: Bed ID not found.\n");
        return 0;
    }

    Bed *b = &beds[idx];

    if (new_status == ST_INVALID) {
        printf("[!] Invalid status.\n");
        return 0;
    }

    if (b->status == new_status) {
        printf("Bed %s is already %s.\nWARNING:\nNo status change required.\n",
               b->id, status_to_str(b->status));
        return 0;
    }

    /* Clinical workflow transitions */
    if (new_status == ST_OCCUPIED && strcmp(b->patient_id, "-") == 0) {
        printf("[!] Cannot mark OCCUPIED without patient registration (use menu option 8).\n");
        return 0;
    }
    if (b->status == ST_OCCUPIED && new_status == ST_AVAILABLE) {
        printf("[!] Clinical protocol requires beds to transition to CLEANING before AVAILABLE.\n");
        return 0;
    }

    if (new_status == ST_AVAILABLE || new_status == ST_CLEANING || new_status == ST_MAINTENANCE) {
        if (b->status != ST_OCCUPIED) {
            strcpy(b->patient_id, "-");
        }
    }

    b->status = new_status;
    get_timestamp(b->updated, sizeof(b->updated));
    printf("[+] Bed %s status updated -> %s\n", b->id, status_to_str(b->status));
    return 1;
}

void print_bed_card(const Bed *b) {
    if (!b) return;
    const char *floor_desc = (b->floor == 0) ? "Ground" : (b->floor == 1 ? "1st" : "2nd");
    printf("\nBed ID       : %s\n", b->id);
    printf("Ward         : %s\n", b->ward);
    printf("Floor        : %d (%s Floor)\n", b->floor, floor_desc);
    printf("Room         : %s\n", b->room);
    printf("Status       : %s\n", status_to_str(b->status));
    printf("Patient ID   : %s\n", b->patient_id);
    printf("Last Updated : %s\n", b->updated);
}

void print_table_header(void) {
    printf("+---------+----------------------+-------+--------+-------------+------------+--------------+\n");
    printf("| BED ID  | WARD                 | FLOOR | ROOM   | STATUS      | PATIENT ID | LAST UPDATED |\n");
    printf("+---------+----------------------+-------+--------+-------------+------------+--------------+\n");
}

void print_bed_row(const Bed *b) {
    if (!b) return;
    printf("| %-7s | %-20s |   %-3d | %-6s | %-11s | %-10s | %-12s |\n",
           b->id, b->ward, b->floor, b->room,
           status_to_str(b->status), b->patient_id, b->updated);
}

void print_all_beds(const Bed beds[], int count) {
    if (count <= 0) {
        printf("No beds found in database.\n");
        return;
    }
    printf("\nHospital Bed Registry (%d beds):\n", count);
    print_table_header();
    for (int i = 0; i < count; i++) {
        print_bed_row(&beds[i]);
    }
    printf("+---------+----------------------+-------+--------+-------------+------------+--------------+\n");
}

/* Fast qsort comparators */
static int cmp_bed_id(const void *a, const void *b) {
    return strcmp(((const Bed *)a)->id, ((const Bed *)b)->id);
}

static int cmp_bed_ward(const void *a, const void *b) {
    const Bed *b1 = (const Bed *)a;
    const Bed *b2 = (const Bed *)b;
    int diff = strcmp(b1->ward, b2->ward);
    return diff ? diff : strcmp(b1->id, b2->id);
}

void sort_beds_by_id(Bed beds[], int count) {
    if (beds && count > 1) qsort(beds, count, sizeof(Bed), cmp_bed_id);
}

void sort_beds_by_ward(Bed beds[], int count) {
    if (beds && count > 1) qsort(beds, count, sizeof(Bed), cmp_bed_ward);
}

/* Compact, clean data seed */
typedef struct {
    const char *id;
    const char *ward;
    int floor;
    const char *room;
    BedStatus status;
    const char *pid;
} SeedBed;

static const SeedBed SEED_DATA[] = {
    /* Floor 0: General Ward (12) */
    {"G101", "General Ward", 0, "G01", ST_AVAILABLE, "-"},
    {"G102", "General Ward", 0, "G01", ST_OCCUPIED, "P1001"},
    {"G103", "General Ward", 0, "G01", ST_AVAILABLE, "-"},
    {"G104", "General Ward", 0, "G02", ST_CLEANING, "-"},
    {"G105", "General Ward", 0, "G02", ST_OCCUPIED, "P1002"},
    {"G106", "General Ward", 0, "G02", ST_AVAILABLE, "-"},
    {"G107", "General Ward", 0, "G03", ST_OCCUPIED, "P1003"},
    {"G108", "General Ward", 0, "G03", ST_AVAILABLE, "-"},
    {"G109", "General Ward", 0, "G03", ST_RESERVED, "-"},
    {"G110", "General Ward", 0, "G04", ST_OCCUPIED, "P1004"},
    {"G111", "General Ward", 0, "G04", ST_AVAILABLE, "-"},
    {"G112", "General Ward", 0, "G04", ST_MAINTENANCE, "-"},
    /* Floor 0: Emergency (8) */
    {"E201", "Emergency", 0, "EMG01", ST_AVAILABLE, "-"},
    {"E202", "Emergency", 0, "EMG01", ST_OCCUPIED, "P1005"},
    {"E203", "Emergency", 0, "EMG01", ST_AVAILABLE, "-"},
    {"E204", "Emergency", 0, "EMG02", ST_OCCUPIED, "P1006"},
    {"E205", "Emergency", 0, "EMG02", ST_OCCUPIED, "P1007"},
    {"E206", "Emergency", 0, "EMG02", ST_CLEANING, "-"},
    {"E207", "Emergency", 0, "EMG03", ST_AVAILABLE, "-"},
    {"E208", "Emergency", 0, "EMG03", ST_OCCUPIED, "P1008"},
    /* Floor 1: General Ward (8) */
    {"G201", "General Ward", 1, "G11", ST_AVAILABLE, "-"},
    {"G202", "General Ward", 1, "G11", ST_OCCUPIED, "P1009"},
    {"G203", "General Ward", 1, "G11", ST_OCCUPIED, "P1010"},
    {"G204", "General Ward", 1, "G12", ST_AVAILABLE, "-"},
    {"G205", "General Ward", 1, "G12", ST_CLEANING, "-"},
    {"G206", "General Ward", 1, "G12", ST_OCCUPIED, "P1011"},
    {"G207", "General Ward", 1, "G13", ST_AVAILABLE, "-"},
    {"G208", "General Ward", 1, "G13", ST_RESERVED, "-"},
    /* Floor 1: ICU (10) */
    {"ICU301", "ICU", 1, "ICU01", ST_AVAILABLE, "-"},
    {"ICU302", "ICU", 1, "ICU01", ST_OCCUPIED, "P1012"},
    {"ICU303", "ICU", 1, "ICU02", ST_OCCUPIED, "P1013"},
    {"ICU304", "ICU", 1, "ICU02", ST_AVAILABLE, "-"},
    {"ICU305", "ICU", 1, "ICU03", ST_OCCUPIED, "P1014"},
    {"ICU306", "ICU", 1, "ICU03", ST_CLEANING, "-"},
    {"ICU307", "ICU", 1, "ICU04", ST_OCCUPIED, "P1015"},
    {"ICU308", "ICU", 1, "ICU04", ST_AVAILABLE, "-"},
    {"ICU309", "ICU", 1, "ICU05", ST_OCCUPIED, "P1016"},
    {"ICU310", "ICU", 1, "ICU05", ST_MAINTENANCE, "-"},
    /* Floor 1: Pediatric (6) */
    {"P401", "Pediatric", 1, "PED01", ST_AVAILABLE, "-"},
    {"P402", "Pediatric", 1, "PED01", ST_OCCUPIED, "P1017"},
    {"P403", "Pediatric", 1, "PED02", ST_AVAILABLE, "-"},
    {"P404", "Pediatric", 1, "PED02", ST_OCCUPIED, "P1018"},
    {"P405", "Pediatric", 1, "PED03", ST_AVAILABLE, "-"},
    {"P406", "Pediatric", 1, "PED03", ST_RESERVED, "-"},
    /* Floor 2: Surgical Ward (8) */
    {"S501", "Surgical Ward", 2, "SUR01", ST_AVAILABLE, "-"},
    {"S502", "Surgical Ward", 2, "SUR01", ST_OCCUPIED, "P1019"},
    {"S503", "Surgical Ward", 2, "SUR01", ST_AVAILABLE, "-"},
    {"S504", "Surgical Ward", 2, "SUR02", ST_OCCUPIED, "P1020"},
    {"S505", "Surgical Ward", 2, "SUR02", ST_CLEANING, "-"},
    {"S506", "Surgical Ward", 2, "SUR02", ST_AVAILABLE, "-"},
    {"S507", "Surgical Ward", 2, "SUR03", ST_OCCUPIED, "P1021"},
    {"S508", "Surgical Ward", 2, "SUR03", ST_AVAILABLE, "-"},
    /* Floor 2: Maternity (6) */
    {"M601", "Maternity", 2, "MAT01", ST_AVAILABLE, "-"},
    {"M602", "Maternity", 2, "MAT01", ST_OCCUPIED, "P1022"},
    {"M603", "Maternity", 2, "MAT02", ST_AVAILABLE, "-"},
    {"M604", "Maternity", 2, "MAT02", ST_OCCUPIED, "P1023"},
    {"M605", "Maternity", 2, "MAT03", ST_CLEANING, "-"},
    {"M606", "Maternity", 2, "MAT03", ST_AVAILABLE, "-"},
    /* Floor 2: ICU (6) */
    {"ICU311", "ICU", 2, "ICU06", ST_AVAILABLE, "-"},
    {"ICU312", "ICU", 2, "ICU06", ST_OCCUPIED, "P1024"},
    {"ICU313", "ICU", 2, "ICU07", ST_OCCUPIED, "P1025"},
    {"ICU314", "ICU", 2, "ICU07", ST_AVAILABLE, "-"},
    {"ICU315", "ICU", 2, "ICU08", ST_RESERVED, "-"},
    {"ICU316", "ICU", 2, "ICU08", ST_AVAILABLE, "-"}
};

void seed_beds(Bed beds[], int *count) {
    *count = 0;
    char time_str[20];
    get_timestamp(time_str, sizeof(time_str));

    int n = sizeof(SEED_DATA) / sizeof(SEED_DATA[0]);
    for (int i = 0; i < n; i++) {
        Bed *b = &beds[*count];
        strncpy(b->id, SEED_DATA[i].id, sizeof(b->id) - 1);
        b->id[sizeof(b->id) - 1] = '\0';
        strncpy(b->ward, SEED_DATA[i].ward, sizeof(b->ward) - 1);
        b->ward[sizeof(b->ward) - 1] = '\0';
        b->floor = SEED_DATA[i].floor;
        strncpy(b->room, SEED_DATA[i].room, sizeof(b->room) - 1);
        b->room[sizeof(b->room) - 1] = '\0';
        b->status = SEED_DATA[i].status;
        strncpy(b->patient_id, SEED_DATA[i].pid, sizeof(b->patient_id) - 1);
        b->patient_id[sizeof(b->patient_id) - 1] = '\0';
        strncpy(b->updated, time_str, sizeof(b->updated) - 1);
        b->updated[sizeof(b->updated) - 1] = '\0';
        (*count)++;
    }
}
