#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "patient.h"

#ifdef _WIN32
#define strcasecmp _stricmp
#endif

int find_patient_idx(const Patient patients[], int count, const char *id) {
    if (!patients || !id || !*id) return -1;
    for (int i = 0; i < count; i++) {
        if (strcasecmp(patients[i].id, id) == 0) return i;
    }
    return -1;
}

int find_patient_by_bed(const Patient patients[], int count, const char *bed_id) {
    if (!patients || !bed_id || !*bed_id) return -1;
    for (int i = 0; i < count; i++) {
        if (patients[i].active && strcasecmp(patients[i].bed_id, bed_id) == 0) {
            return i;
        }
    }
    return -1;
}

int admit_patient(Bed beds[], int bed_count, Patient patients[], int *patient_count,
                  const char *pid, const char *name, const char *bid) {
    if (!beds || !patients || !patient_count) return 0;
    if (!pid || !*pid || !name || !*name || !bid || !*bid) {
        printf("[!] Patient ID, Name, and Bed ID are all required.\n");
        return 0;
    }

    int p_idx = find_patient_idx(patients, *patient_count, pid);
    if (p_idx != -1 && patients[p_idx].active) {
        printf("[!] Patient %s is already admitted in Bed %s.\n", pid, patients[p_idx].bed_id);
        return 0;
    }

    int b_idx = find_bed_idx(beds, bed_count, bid);
    if (b_idx == -1) {
        printf("ERROR: Bed ID not found.\n");
        return 0;
    }

    Bed *b = &beds[b_idx];
    if (b->status == ST_OCCUPIED) {
        printf("[!] Bed %s is already OCCUPIED by patient %s.\n", b->id, b->patient_id);
        return 0;
    }
    if (b->status == ST_CLEANING) {
        printf("[!] Bed %s is currently under CLEANING / sanitation.\n", b->id);
        return 0;
    }
    if (b->status == ST_MAINTENANCE) {
        printf("[!] Bed %s is under MAINTENANCE.\n", b->id);
        return 0;
    }

    if (*patient_count >= MAX_PATIENTS) {
        printf("[!] Patient log capacity reached.\n");
        return 0;
    }

    char now[20];
    get_timestamp(now, sizeof(now));

    /* Create patient entry */
    Patient *p = &patients[*patient_count];
    strncpy(p->id, pid, sizeof(p->id) - 1);
    p->id[sizeof(p->id) - 1] = '\0';
    strncpy(p->name, name, sizeof(p->name) - 1);
    p->name[sizeof(p->name) - 1] = '\0';
    strncpy(p->bed_id, b->id, sizeof(p->bed_id) - 1);
    p->bed_id[sizeof(p->bed_id) - 1] = '\0';
    strncpy(p->admitted, now, sizeof(p->admitted) - 1);
    p->admitted[sizeof(p->admitted) - 1] = '\0';
    strcpy(p->discharged, "-");
    p->active = 1;
    (*patient_count)++;

    /* Update bed state */
    b->status = ST_OCCUPIED;
    strncpy(b->patient_id, pid, sizeof(b->patient_id) - 1);
    b->patient_id[sizeof(b->patient_id) - 1] = '\0';
    strncpy(b->updated, now, sizeof(b->updated) - 1);
    b->updated[sizeof(b->updated) - 1] = '\0';

    printf("\n[+] %s admitted to Bed %s\n", p->name, b->id);
    printf("%s -> OCCUPIED\n", b->id);
    return 1;
}

int discharge_patient(Bed beds[], int bed_count, Patient patients[], int patient_count,
                      const char *query) {
    if (!beds || !patients || !query || !*query) {
        printf("[!] Bed ID or Patient ID required.\n");
        return 0;
    }

    /* Locate patient: check patient ID first, then Bed ID */
    int p_idx = find_patient_idx(patients, patient_count, query);
    if (p_idx == -1 || !patients[p_idx].active) {
        p_idx = find_patient_by_bed(patients, patient_count, query);
    }

    if (p_idx == -1) {
        printf("[!] No active admitted patient found for '%s'.\n", query);
        return 0;
    }

    Patient *p = &patients[p_idx];
    int b_idx = find_bed_idx(beds, bed_count, p->bed_id);
    if (b_idx == -1) {
        printf("[!] Linked Bed %s not found.\n", p->bed_id);
        return 0;
    }

    Bed *b = &beds[b_idx];
    char now[20];
    get_timestamp(now, sizeof(now));

    p->active = 0;
    strncpy(p->discharged, now, sizeof(p->discharged) - 1);
    p->discharged[sizeof(p->discharged) - 1] = '\0';

    /* Bed transitions to CLEANING */
    b->status = ST_CLEANING;
    strcpy(b->patient_id, "-");
    strncpy(b->updated, now, sizeof(b->updated) - 1);
    b->updated[sizeof(b->updated) - 1] = '\0';

    printf("\n[+] Patient %s discharged.\n", p->name);
    printf("Bed %s status updated: OCCUPIED -> CLEANING\n", b->id);
    return 1;
}

void print_patient_card(const Patient *p) {
    if (!p) return;
    printf("\nPatient ID     : %s\n", p->id);
    printf("Name           : %s\n", p->name);
    printf("Bed Assigned   : %s\n", p->bed_id);
    printf("Admitted At    : %s\n", p->admitted);
    printf("Discharged At  : %s\n", p->discharged);
    printf("Status         : %s\n", p->active ? "ADMITTED" : "DISCHARGED");
}

void print_all_patients(const Patient patients[], int count) {
    if (count <= 0) {
        printf("No patient records in log.\n");
        return;
    }
    printf("\nPatient Admission Registry (%d records):\n", count);
    printf("+------------+----------------------+---------+--------------+--------------+------------+\n");
    printf("| PATIENT ID | PATIENT NAME         | BED ID  | ADMITTED AT  | DISCHARGED   | STATUS     |\n");
    printf("+------------+----------------------+---------+--------------+--------------+------------+\n");
    for (int i = 0; i < count; i++) {
        const Patient *p = &patients[i];
        printf("| %-10s | %-20s | %-7s | %-12s | %-12s | %-10s |\n",
               p->id, p->name, p->bed_id, p->admitted, p->discharged,
               p->active ? "ADMITTED" : "DISCHARGED");
    }
    printf("+------------+----------------------+---------+--------------+--------------+------------+\n");
}

typedef struct {
    const char *id;
    const char *name;
    const char *bed;
    const char *time;
} SeedPatient;

static const SeedPatient SEED_PATIENTS[] = {
    {"P1001", "Ramesh Sharma", "G102", "08:15 AM"},
    {"P1002", "Priya Nair", "G105", "09:30 AM"},
    {"P1003", "Anand Kulkarni", "G107", "09:45 AM"},
    {"P1004", "Sunita Menon", "G110", "10:10 AM"},
    {"P1005", "David Joseph", "E202", "07:20 AM"},
    {"P1006", "Kavita Verma", "E204", "08:05 AM"},
    {"P1007", "Mohammed Rafi", "E205", "08:50 AM"},
    {"P1008", "Deepak Gupta", "E208", "09:15 AM"},
    {"P1009", "Meera Sen", "G202", "06:40 AM"},
    {"P1010", "Vikram Patel", "G203", "07:10 AM"},
    {"P1011", "Sneha Rao", "G206", "08:25 AM"},
    {"P1012", "Arun Kumar", "ICU302", "05:15 AM"},
    {"P1013", "Lakshmi Iyer", "ICU303", "06:00 AM"},
    {"P1014", "Rajesh Pillai", "ICU305", "07:45 AM"},
    {"P1015", "Anita Roy", "ICU307", "08:30 AM"},
    {"P1016", "Suresh Deshmukh", "ICU309", "09:10 AM"},
    {"P1017", "Master Aryan (Ped)", "P402", "08:00 AM"},
    {"P1018", "Baby Diya (Ped)", "P404", "09:20 AM"},
    {"P1019", "George Thomas", "S502", "07:35 AM"},
    {"P1020", "Fatima Begum", "S504", "08:10 AM"},
    {"P1021", "Bala Chandran", "S507", "09:05 AM"},
    {"P1022", "Pooja Hegde", "M602", "06:50 AM"},
    {"P1023", "Shalini Reddy", "M604", "08:40 AM"},
    {"P1024", "Karthik Krishnan", "ICU312", "07:15 AM"},
    {"P1025", "Manoj Nambiar", "ICU313", "08:20 AM"}
};

void seed_patients(Patient patients[], int *count) {
    *count = 0;
    int n = sizeof(SEED_PATIENTS) / sizeof(SEED_PATIENTS[0]);
    for (int i = 0; i < n; i++) {
        Patient *p = &patients[*count];
        strncpy(p->id, SEED_PATIENTS[i].id, sizeof(p->id) - 1);
        p->id[sizeof(p->id) - 1] = '\0';
        strncpy(p->name, SEED_PATIENTS[i].name, sizeof(p->name) - 1);
        p->name[sizeof(p->name) - 1] = '\0';
        strncpy(p->bed_id, SEED_PATIENTS[i].bed, sizeof(p->bed_id) - 1);
        p->bed_id[sizeof(p->bed_id) - 1] = '\0';
        strncpy(p->admitted, SEED_PATIENTS[i].time, sizeof(p->admitted) - 1);
        p->admitted[sizeof(p->admitted) - 1] = '\0';
        strcpy(p->discharged, "-");
        p->active = 1;
        (*count)++;
    }
}
