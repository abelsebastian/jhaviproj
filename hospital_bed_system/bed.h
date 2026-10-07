#ifndef BED_H
#define BED_H

#define MAX_BEDS 200

typedef enum {
    ST_AVAILABLE = 0,
    ST_OCCUPIED,
    ST_CLEANING,
    ST_RESERVED,
    ST_MAINTENANCE,
    ST_INVALID
} BedStatus;

typedef struct {
    char id[16];
    char ward[32];
    int floor;
    char room[16];
    BedStatus status;
    char patient_id[16];
    char updated[20];
} Bed;

/* Status helpers */
const char *status_to_str(BedStatus st);
BedStatus parse_status(const char *str);
int is_valid_status_str(const char *str);

/* Core operations */
int find_bed_idx(const Bed beds[], int count, const char *id);
int add_bed(Bed beds[], int *count, const Bed *new_bed);
int update_bed_status(Bed beds[], int count, const char *id, BedStatus new_status);

/* Display */
void print_bed_card(const Bed *b);
void print_bed_row(const Bed *b);
void print_table_header(void);
void print_all_beds(const Bed beds[], int count);

/* Sorting (qsort-ready comparators & in-place sorts) */
void sort_beds_by_id(Bed beds[], int count);
void sort_beds_by_ward(Bed beds[], int count);

/* Seed initial state */
void seed_beds(Bed beds[], int *count);
void get_timestamp(char *buf, int len);

#endif
