#ifndef FILE_H
#define FILE_H

#include "bed.h"
#include "patient.h"

#define BEDS_FILE     "data/beds.txt"
#define PATIENTS_FILE "data/patients.txt"
#define ACTIVITY_FILE "data/activity_log.txt"
#define JSON_OUT_FILE "../web_dashboard/js/data_live.json"

int load_beds(Bed beds[], int *count, const char *path);
int save_beds(const Bed beds[], int count, const char *path);

int load_patients(Patient patients[], int *count, const char *path);
int save_patients(const Patient patients[], int count, const char *path);

int log_activity(const char *path, const char *action, const char *bid,
                 const char *pid, const char *prev_st, const char *new_st,
                 const char *user);
void print_activity_log(const char *path);

int export_json(const Bed beds[], int count, const char *path);

#endif
