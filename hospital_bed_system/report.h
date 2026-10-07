#ifndef REPORT_H
#define REPORT_H

#include "bed.h"

typedef struct {
    int total;
    int available;
    int occupied;
    int cleaning;
    int reserved;
    int maintenance;
    float avail_rate;
    float occ_rate;
} BedStats;

typedef struct {
    char name[32];
    int total;
    int avail;
    int occ;
} WardStat;

void compute_stats(const Bed beds[], int count, BedStats *stats);
void print_quick_stats(const Bed beds[], int count);
void generate_report(const Bed beds[], int count, const char *path);

#endif
