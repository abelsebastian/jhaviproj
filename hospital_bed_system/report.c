#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "report.h"

void compute_stats(const Bed beds[], int count, BedStats *stats) {
    if (!stats) return;
    memset(stats, 0, sizeof(BedStats));
    stats->total = count;

    /* Single pass $O(N)$ accumulator with jump table */
    for (int i = 0; i < count; i++) {
        switch (beds[i].status) {
            case ST_AVAILABLE:   stats->available++;   break;
            case ST_OCCUPIED:    stats->occupied++;    break;
            case ST_CLEANING:    stats->cleaning++;    break;
            case ST_RESERVED:    stats->reserved++;    break;
            case ST_MAINTENANCE: stats->maintenance++; break;
            default: break;
        }
    }

    if (count > 0) {
        stats->avail_rate = (stats->available * 100.0f) / count;
        stats->occ_rate   = (stats->occupied * 100.0f) / count;
    }
}

void print_quick_stats(const Bed beds[], int count) {
    BedStats s;
    compute_stats(beds, count, &s);

    printf("\n========================================\n");
    printf("        HOSPITAL BED STATISTICS         \n");
    printf("========================================\n");
    printf(" Total Beds        : %d\n", s.total);
    printf(" Available Beds    : %d\n", s.available);
    printf(" Occupied Beds     : %d\n", s.occupied);
    printf(" Cleaning Beds     : %d\n", s.cleaning);
    printf(" Reserved Beds     : %d\n", s.reserved);
    printf(" Maintenance Beds  : %d\n", s.maintenance);
    printf("----------------------------------------\n");
    printf(" Availability Rate : %.1f%%\n", s.avail_rate);
    printf(" Occupancy Rate    : %.1f%%\n", s.occ_rate);
    printf("========================================\n");
}

void generate_report(const Bed beds[], int count, const char *path) {
    BedStats s;
    compute_stats(beds, count, &s);

    WardStat wards[16];
    int ward_cnt = 0;
    memset(wards, 0, sizeof(wards));

    /* Aggregate ward stats */
    for (int i = 0; i < count; i++) {
        int idx = -1;
        for (int w = 0; w < ward_cnt; w++) {
            if (strcmp(wards[w].name, beds[i].ward) == 0) {
                idx = w;
                break;
            }
        }
        if (idx == -1 && ward_cnt < 16) {
            idx = ward_cnt++;
            strncpy(wards[idx].name, beds[i].ward, sizeof(wards[idx].name) - 1);
        }
        if (idx != -1) {
            wards[idx].total++;
            if (beds[i].status == ST_AVAILABLE) wards[idx].avail++;
            else if (beds[i].status == ST_OCCUPIED) wards[idx].occ++;
        }
    }

    /* Print to console */
    printf("\n========================================\n");
    printf("       HOSPITAL BED REPORT\n");
    printf("========================================\n\n");
    printf("Total Beds       : %d\n", s.total);
    printf("Available        : %d\n", s.available);
    printf("Occupied         : %d\n", s.occupied);
    printf("Cleaning         : %d\n", s.cleaning);
    printf("Reserved         : %d\n", s.reserved);
    printf("Maintenance      : %d\n\n", s.maintenance);
    printf("Availability Rate: %.1f%%\n", s.avail_rate);
    printf("Occupancy Rate   : %.1f%%\n\n", s.occ_rate);
    printf("----------------------------------------\n");
    printf("WARD-WISE AVAILABILITY\n");
    printf("----------------------------------------\n");
    for (int w = 0; w < ward_cnt; w++) {
        printf("%-16s : %d / %d available\n",
               wards[w].name, wards[w].avail, wards[w].total);
    }
    printf("========================================\n");

    /* Write to file */
    const char *out = path ? path : "reports/bed_report.txt";
    FILE *fp = fopen(out, "w");
    if (!fp) fp = fopen("bed_report.txt", "w");

    if (fp) {
        char time_str[20];
        get_timestamp(time_str, sizeof(time_str));
        fprintf(fp, "========================================\n");
        fprintf(fp, "       HOSPITAL BED REPORT\n");
        fprintf(fp, "  Generated at: %s\n", time_str);
        fprintf(fp, "========================================\n\n");
        fprintf(fp, "Total Beds       : %d\n", s.total);
        fprintf(fp, "Available        : %d\n", s.available);
        fprintf(fp, "Occupied         : %d\n", s.occupied);
        fprintf(fp, "Cleaning         : %d\n", s.cleaning);
        fprintf(fp, "Reserved         : %d\n", s.reserved);
        fprintf(fp, "Maintenance      : %d\n\n", s.maintenance);
        fprintf(fp, "Availability Rate: %.1f%%\n", s.avail_rate);
        fprintf(fp, "Occupancy Rate   : %.1f%%\n\n", s.occ_rate);
        fprintf(fp, "----------------------------------------\n");
        fprintf(fp, "WARD-WISE AVAILABILITY\n");
        fprintf(fp, "----------------------------------------\n");
        for (int w = 0; w < ward_cnt; w++) {
            fprintf(fp, "%-16s : %d / %d available (%.1f%%)\n",
                    wards[w].name, wards[w].avail, wards[w].total,
                    wards[w].total ? (wards[w].avail * 100.0f / wards[w].total) : 0.0f);
        }
        fprintf(fp, "\n========================================\n");
        fclose(fp);
        printf("\n[+] Report saved -> %s\n", out);
    }
}
