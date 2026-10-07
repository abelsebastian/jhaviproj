#ifndef PATIENT_H
#define PATIENT_H

#include "bed.h"

#define MAX_PATIENTS 200

typedef struct {
    char id[16];
    char name[48];
    char bed_id[16];
    char admitted[20];
    char discharged[20];
    int active; /* 1 = currently admitted, 0 = discharged */
} Patient;

int find_patient_idx(const Patient patients[], int count, const char *id);
int find_patient_by_bed(const Patient patients[], int count, const char *bed_id);

int admit_patient(Bed beds[], int bed_count, Patient patients[], int *patient_count,
                  const char *pid, const char *name, const char *bid);

int discharge_patient(Bed beds[], int bed_count, Patient patients[], int patient_count,
                      const char *query);

void print_patient_card(const Patient *p);
void print_all_patients(const Patient patients[], int count);
void seed_patients(Patient patients[], int *count);

#endif
