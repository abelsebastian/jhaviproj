#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "bed.h"
#include "patient.h"
#include "search.h"
#include "report.h"
#include "file.h"

static Bed g_beds[MAX_BEDS];
static int g_bed_count = 0;

static Patient g_patients[MAX_PATIENTS];
static int g_patient_count = 0;

static void read_str(char *dest, int max) {
    if (fgets(dest, max, stdin)) {
        size_t len = strlen(dest);
        while (len > 0 && (dest[len - 1] == '\n' || dest[len - 1] == '\r')) {
            dest[--len] = '\0';
        }
    }
}

static void sync_storage(void) {
    save_beds(g_beds, g_bed_count, BEDS_FILE);
    save_patients(g_patients, g_patient_count, PATIENTS_FILE);
    export_json(g_beds, g_bed_count, JSON_OUT_FILE);
}

static void do_add_bed(void) {
    printf("\n--- ADD NEW BED ---\n");
    Bed b;
    memset(&b, 0, sizeof(Bed));

    printf("Enter Bed ID (e.g. G113, ICU317): ");
    read_str(b.id, sizeof(b.id));
    if (!b.id[0]) return;

    if (find_bed_idx(g_beds, g_bed_count, b.id) != -1) {
        printf("[!] Bed %s already exists.\n", b.id);
        return;
    }

    printf("Enter Ward Name: ");
    read_str(b.ward, sizeof(b.ward));
    if (!b.ward[0]) return;

    printf("Enter Floor (0 = Ground, 1 = 1st, 2 = 2nd): ");
    char fbuf[8];
    read_str(fbuf, sizeof(fbuf));
    b.floor = atoi(fbuf);

    printf("Enter Room Code: ");
    read_str(b.room, sizeof(b.room));

    printf("Initial Status (1. AVAILABLE, 2. RESERVED, 3. MAINTENANCE) [1]: ");
    char sbuf[8];
    read_str(sbuf, sizeof(sbuf));
    if (strcmp(sbuf, "2") == 0) b.status = ST_RESERVED;
    else if (strcmp(sbuf, "3") == 0) b.status = ST_MAINTENANCE;
    else b.status = ST_AVAILABLE;

    strcpy(b.patient_id, "-");
    get_timestamp(b.updated, sizeof(b.updated));

    if (add_bed(g_beds, &g_bed_count, &b)) {
        log_activity(ACTIVITY_FILE, "ADD_BED", b.id, "-", "-", status_to_str(b.status), "Admin");
        sync_storage();
        printf("[+] Bed %s successfully registered in %s.\n", b.id, b.ward);
    }
}

static void do_update_status(void) {
    printf("\n--- UPDATE BED STATUS ---\n");
    char id[16];
    printf("Enter Bed ID: ");
    read_str(id, sizeof(id));
    if (!id[0]) return;

    int idx = find_bed_idx(g_beds, g_bed_count, id);
    if (idx == -1) {
        printf("ERROR: Bed ID not found.\n");
        return;
    }

    printf("\nCurrent Bed Information:");
    print_bed_card(&g_beds[idx]);

    printf("\nSelect New Status:\n"
           " 1. AVAILABLE\n"
           " 2. OCCUPIED (Requires Patient Admission workflow)\n"
           " 3. CLEANING\n"
           " 4. RESERVED\n"
           " 5. MAINTENANCE\n"
           "Enter choice (1-5): ");

    char ch[8];
    read_str(ch, sizeof(ch));
    BedStatus next;
    switch (ch[0]) {
        case '1': next = ST_AVAILABLE; break;
        case '2': next = ST_OCCUPIED; break;
        case '3': next = ST_CLEANING; break;
        case '4': next = ST_RESERVED; break;
        case '5': next = ST_MAINTENANCE; break;
        default:
            printf("[!] Invalid choice. Update cancelled.\n");
            return;
    }

    char prev[16];
    strncpy(prev, status_to_str(g_beds[idx].status), sizeof(prev) - 1);

    if (update_bed_status(g_beds, g_bed_count, id, next)) {
        log_activity(ACTIVITY_FILE, "UPDATE_STATUS", id, g_beds[idx].patient_id,
                     prev, status_to_str(next), "Staff");
        sync_storage();
    }
}

static void do_admit_patient(void) {
    printf("\n========================================\n"
           "          PATIENT ADMISSION             \n"
           "========================================\n");
    char pid[16], pname[48], bid[16];

    printf("Enter Patient ID (e.g., P1025): ");
    read_str(pid, sizeof(pid));
    if (!pid[0]) return;

    printf("Enter Patient Name: ");
    read_str(pname, sizeof(pname));
    if (!pname[0]) return;

    printf("\nAvailable Beds:\n");
    int list[MAX_BEDS], avail_cnt = 0;
    for (int i = 0; i < g_bed_count && avail_cnt < 10; i++) {
        if (g_beds[i].status == ST_AVAILABLE) {
            list[avail_cnt++] = i;
            printf(" %d. %s (%s, Floor %d, Room %s)\n",
                   avail_cnt, g_beds[i].id, g_beds[i].ward, g_beds[i].floor, g_beds[i].room);
        }
    }

    if (!avail_cnt) {
        printf("[!] No vacant beds available right now.\n");
        return;
    }

    printf("\nSelect Bed (e.g. %s): ", g_beds[list[0]].id);
    read_str(bid, sizeof(bid));
    if (!bid[0]) return;

    int b_idx = find_bed_idx(g_beds, g_bed_count, bid);
    if (b_idx == -1) {
        printf("ERROR: Bed ID not found.\n");
        return;
    }

    printf("\nConfirm admission? Y/N: ");
    char conf[8];
    read_str(conf, sizeof(conf));
    if (conf[0] == 'y' || conf[0] == 'Y') {
        if (admit_patient(g_beds, g_bed_count, g_patients, &g_patient_count, pid, pname, bid)) {
            log_activity(ACTIVITY_FILE, "ADMISSION", bid, pid, "AVAILABLE", "OCCUPIED", "Reception");
            sync_storage();
        }
    } else {
        printf("Admission cancelled.\n");
    }
}

static void do_discharge_patient(void) {
    printf("\n========================================\n"
           "          PATIENT DISCHARGE             \n"
           "========================================\n");
    char q[16];
    printf("Enter Patient ID or Bed ID: ");
    read_str(q, sizeof(q));
    if (!q[0]) return;

    int p_idx = find_patient_idx(g_patients, g_patient_count, q);
    if (p_idx == -1 || !g_patients[p_idx].active) {
        p_idx = find_patient_by_bed(g_patients, g_patient_count, q);
    }

    if (p_idx == -1) {
        printf("ERROR: No active patient found for '%s'.\n", q);
        return;
    }

    Patient *p = &g_patients[p_idx];
    printf("\nBed ID         : %s\n", p->bed_id);
    printf("Current Patient: %s (%s)\n", p->name, p->id);

    printf("\nDischarge patient? Y/N: ");
    char conf[8];
    read_str(conf, sizeof(conf));
    if (conf[0] == 'y' || conf[0] == 'Y') {
        char bid[16], pid[16];
        strcpy(bid, p->bed_id);
        strcpy(pid, p->id);
        if (discharge_patient(g_beds, g_bed_count, g_patients, g_patient_count, pid)) {
            log_activity(ACTIVITY_FILE, "DISCHARGE", bid, pid, "OCCUPIED", "CLEANING", "Nurse");
            sync_storage();
        }
    } else {
        printf("Discharge cancelled.\n");
    }
}

static void do_search_menu(void) {
    int sub = -1;
    while (sub != 0) {
        printf("\n--- SEARCH PORTAL ---\n"
               " 1. Search by Bed ID\n"
               " 2. Search by Ward\n"
               " 3. Search by Room Code\n"
               " 4. Search by Status\n"
               " 0. Back to Main Menu\n"
               "Select: ");
        char buf[8];
        read_str(buf, sizeof(buf));
        sub = atoi(buf);

        switch (sub) {
            case 1: search_by_id(g_beds, g_bed_count); break;
            case 2: search_by_ward(g_beds, g_bed_count); break;
            case 3: search_by_room(g_beds, g_bed_count); break;
            case 4: search_by_status(g_beds, g_bed_count); break;
            case 0: break;
            default: printf("[!] Invalid option.\n"); break;
        }
    }
}

int main(void) {
    /* Fast startup: load files or seed fresh dataset */
    int b_ok = load_beds(g_beds, &g_bed_count, BEDS_FILE);
    int p_ok = load_patients(g_patients, &g_patient_count, PATIENTS_FILE);

    if (!b_ok || !g_bed_count || !p_ok || !g_patient_count) {
        printf("[*] Initializing database with 64 sample beds and active registry...\n");
        seed_beds(g_beds, &g_bed_count);
        seed_patients(g_patients, &g_patient_count);
        sync_storage();
        log_activity(ACTIVITY_FILE, "SYSTEM_INIT", "ALL", "-", "-", "SYSTEM_ONLINE", "System");
    }

    char in[16];
    while (1) {
        printf("\n========================================\n"
               "       HOSPITAL BED MANAGEMENT          \n"
               "========================================\n"
               " 1. Add New Bed\n"
               " 2. View All Beds\n"
               " 3. Search Bed\n"
               " 4. Update Bed Status\n"
               " 5. Find Available Beds\n"
               " 6. Filter By Ward\n"
               " 7. Filter By Floor\n"
               " 8. Patient Admission\n"
               " 9. Patient Discharge\n"
               " 10. Generate Report\n"
               " 11. View Statistics\n"
               " 12. View Activity Logs\n"
               " 13. View Patient Registry\n"
               " 0. Exit\n"
               "========================================\n"
               "Enter your choice: ");

        read_str(in, sizeof(in));
        if (!in[0]) continue;

        int choice = atoi(in);
        if (choice == 0 && in[0] != '0') {
            printf("[!] Invalid input. Enter a number 0 - 13.\n");
            continue;
        }

        if (choice == 0) {
            printf("[*] Syncing data to disk...\n");
            sync_storage();
            printf("[*] Exiting. System stopped.\n");
            break;
        }

        switch (choice) {
            case 1: do_add_bed(); break;
            case 2: {
                printf("\nSort: [1] By Bed ID | [2] By Ward | [Enter] Natural: ");
                char sc[8];
                read_str(sc, sizeof(sc));
                if (sc[0] == '1') sort_beds_by_id(g_beds, g_bed_count);
                else if (sc[0] == '2') sort_beds_by_ward(g_beds, g_bed_count);
                print_all_beds(g_beds, g_bed_count);
                break;
            }
            case 3: do_search_menu(); break;
            case 4: do_update_status(); break;
            case 5: filter_available(g_beds, g_bed_count); break;
            case 6: {
                char ward[32];
                printf("Enter Ward Name: ");
                read_str(ward, sizeof(ward));
                filter_by_ward(g_beds, g_bed_count, ward);
                break;
            }
            case 7: {
                char fl[8];
                printf("Enter Floor Number (0, 1, 2): ");
                read_str(fl, sizeof(fl));
                filter_by_floor(g_beds, g_bed_count, atoi(fl));
                break;
            }
            case 8: do_admit_patient(); break;
            case 9: do_discharge_patient(); break;
            case 10: generate_report(g_beds, g_bed_count, "reports/bed_report.txt"); break;
            case 11: print_quick_stats(g_beds, g_bed_count); break;
            case 12: print_activity_log(ACTIVITY_FILE); break;
            case 13: print_all_patients(g_patients, g_patient_count); break;
            default:
                printf("[!] Unknown choice %d. Enter 0 - 13.\n", choice);
                break;
        }
    }

    return 0;
}
