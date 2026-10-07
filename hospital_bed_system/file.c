#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "file.h"

static void strip_crlf(char *s) {
    if (!s) return;
    size_t len = strlen(s);
    while (len > 0 && (s[len - 1] == '\n' || s[len - 1] == '\r')) {
        s[--len] = '\0';
    }
}

int load_beds(Bed beds[], int *count, const char *path) {
    if (!beds || !count) return 0;
    *count = 0;

    FILE *fp = fopen(path, "r");
    if (!fp) return 0;

    char line[256];
    while (fgets(line, sizeof(line), fp) && *count < MAX_BEDS) {
        strip_crlf(line);
        if (!line[0] || line[0] == '#') continue;

        Bed b;
        memset(&b, 0, sizeof(Bed));

        char *token = strtok(line, "|");
        if (!token) continue;
        strncpy(b.id, token, sizeof(b.id) - 1);

        token = strtok(NULL, "|");
        if (!token) continue;
        strncpy(b.ward, token, sizeof(b.ward) - 1);

        token = strtok(NULL, "|");
        if (!token) continue;
        b.floor = atoi(token);

        token = strtok(NULL, "|");
        if (!token) continue;
        strncpy(b.room, token, sizeof(b.room) - 1);

        token = strtok(NULL, "|");
        if (!token) continue;
        b.status = parse_status(token);

        token = strtok(NULL, "|");
        if (!token) continue;
        strncpy(b.patient_id, token, sizeof(b.patient_id) - 1);

        token = strtok(NULL, "|");
        if (token) strncpy(b.updated, token, sizeof(b.updated) - 1);
        else strcpy(b.updated, "10:00 AM");

        beds[(*count)++] = b;
    }

    fclose(fp);
    return 1;
}

int save_beds(const Bed beds[], int count, const char *path) {
    if (!beds || count < 0) return 0;
    FILE *fp = fopen(path, "w");
    if (!fp) return 0;

    fprintf(fp, "# Bed_ID|Ward|Floor|Room|Status|Patient_ID|Last_Updated\n");
    for (int i = 0; i < count; i++) {
        fprintf(fp, "%s|%s|%d|%s|%s|%s|%s\n",
                beds[i].id, beds[i].ward, beds[i].floor, beds[i].room,
                status_to_str(beds[i].status), beds[i].patient_id, beds[i].updated);
    }

    fclose(fp);
    return 1;
}

int load_patients(Patient patients[], int *count, const char *path) {
    if (!patients || !count) return 0;
    *count = 0;

    FILE *fp = fopen(path, "r");
    if (!fp) return 0;

    char line[256];
    while (fgets(line, sizeof(line), fp) && *count < MAX_PATIENTS) {
        strip_crlf(line);
        if (!line[0] || line[0] == '#') continue;

        Patient p;
        memset(&p, 0, sizeof(Patient));

        char *token = strtok(line, "|");
        if (!token) continue;
        strncpy(p.id, token, sizeof(p.id) - 1);

        token = strtok(NULL, "|");
        if (!token) continue;
        strncpy(p.name, token, sizeof(p.name) - 1);

        token = strtok(NULL, "|");
        if (!token) continue;
        strncpy(p.bed_id, token, sizeof(p.bed_id) - 1);

        token = strtok(NULL, "|");
        if (!token) continue;
        strncpy(p.admitted, token, sizeof(p.admitted) - 1);

        token = strtok(NULL, "|");
        if (!token) continue;
        strncpy(p.discharged, token, sizeof(p.discharged) - 1);

        token = strtok(NULL, "|");
        p.active = (token && strcmp(token, "ADMITTED") == 0) ? 1 : 0;

        patients[(*count)++] = p;
    }

    fclose(fp);
    return 1;
}

int save_patients(const Patient patients[], int count, const char *path) {
    if (!patients || count < 0) return 0;
    FILE *fp = fopen(path, "w");
    if (!fp) return 0;

    fprintf(fp, "# Patient_ID|Name|Bed_ID|Admitted|Discharged|Status\n");
    for (int i = 0; i < count; i++) {
        fprintf(fp, "%s|%s|%s|%s|%s|%s\n",
                patients[i].id, patients[i].name, patients[i].bed_id,
                patients[i].admitted, patients[i].discharged,
                patients[i].active ? "ADMITTED" : "DISCHARGED");
    }

    fclose(fp);
    return 1;
}

int log_activity(const char *path, const char *action, const char *bid,
                 const char *pid, const char *prev_st, const char *new_st,
                 const char *user) {
    FILE *fp = fopen(path, "a");
    if (!fp) return 0;

    char now[20];
    get_timestamp(now, sizeof(now));

    fprintf(fp, "%s|%s|%s|%s|%s|%s|%s\n",
            now,
            action ? action : "UPDATE",
            bid ? bid : "-",
            pid ? pid : "-",
            prev_st ? prev_st : "-",
            new_st ? new_st : "-",
            user ? user : "Staff");

    fclose(fp);
    return 1;
}

void print_activity_log(const char *path) {
    FILE *fp = fopen(path, "r");
    if (!fp) {
        printf("No activity log found.\n");
        return;
    }

    printf("\nActivity Audit Log:\n");
    printf("+--------------+----------------------+---------+------------+---------------+----------------+\n");
    printf("| TIME         | ACTION               | BED ID  | PATIENT ID | STATUS CHANGE | STAFF USER     |\n");
    printf("+--------------+----------------------+---------+------------+---------------+----------------+\n");

    char line[256];
    int count = 0;
    while (fgets(line, sizeof(line), fp)) {
        strip_crlf(line);
        if (!line[0] || line[0] == '#') continue;

        char *token = strtok(line, "|");
        char time_str[20] = "-", action[24] = "-", bid[16] = "-";
        char pid[16] = "-", prev[16] = "-", next[16] = "-", user[24] = "-";

        if (token) strncpy(time_str, token, sizeof(time_str) - 1);
        if ((token = strtok(NULL, "|"))) strncpy(action, token, sizeof(action) - 1);
        if ((token = strtok(NULL, "|"))) strncpy(bid, token, sizeof(bid) - 1);
        if ((token = strtok(NULL, "|"))) strncpy(pid, token, sizeof(pid) - 1);
        if ((token = strtok(NULL, "|"))) strncpy(prev, token, sizeof(prev) - 1);
        if ((token = strtok(NULL, "|"))) strncpy(next, token, sizeof(next) - 1);
        if ((token = strtok(NULL, "|"))) strncpy(user, token, sizeof(user) - 1);

        char change[36];
        if (strcmp(prev, "-") != 0 && strcmp(next, "-") != 0) {
            snprintf(change, sizeof(change), "%s -> %s", prev, next);
        } else {
            snprintf(change, sizeof(change), "%s", next);
        }

        printf("| %-12s | %-20s | %-7s | %-10s | %-13s | %-14s |\n",
               time_str, action, bid, pid, change, user);
        count++;
    }
    printf("+--------------+----------------------+---------+------------+---------------+----------------+\n");
    printf("Total entries logged: %d\n", count);
    fclose(fp);
}

int export_json(const Bed beds[], int count, const char *path) {
    if (!beds) return 0;
    FILE *fp = fopen(path, "w");
    if (!fp) return 0;

    fprintf(fp, "[\n");
    for (int i = 0; i < count; i++) {
        fprintf(fp, "  {\n"
                    "    \"bed_id\": \"%s\",\n"
                    "    \"ward\": \"%s\",\n"
                    "    \"floor\": %d,\n"
                    "    \"room\": \"%s\",\n"
                    "    \"status\": \"%s\",\n"
                    "    \"patient_id\": \"%s\",\n"
                    "    \"last_updated\": \"%s\"\n"
                    "  }%s\n",
                beds[i].id, beds[i].ward, beds[i].floor, beds[i].room,
                status_to_str(beds[i].status), beds[i].patient_id, beds[i].updated,
                (i == count - 1) ? "" : ",");
    }
    fprintf(fp, "]\n");
    fclose(fp);
    return 1;
}
