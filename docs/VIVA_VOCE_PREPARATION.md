# Viva Voce Preparation Guide: Hospital Bed Monitoring System

**Academic Level**: Semester 3 B.Tech / B.E. / BCA / B.Sc Computer Science  
**Subject**: Data Structures & C Programming Mini Project  

---

## Section 1: C Programming Core Concepts

### Q1. Why did you choose C programming for the core logic instead of implementing everything in JavaScript or Python?
**Answer**:
C provides direct control over memory, data structures, and predictable execution without runtime overhead. In medical devices and hospital telemetry hardware, low-level reliability, bounded memory footprints, and deterministic execution are vital. In our academic project, C implements the core business logic, strict clinical state machines, memory arrays, pointer manipulations, and file persistence, proving fundamental systems programming competence.

---

### Q2. Explain the memory layout of `struct Bed` in your program.
**Answer**:
`struct Bed` is declared as:
```c
typedef struct {
    char bed_id[20];
    char ward[50];
    int floor;
    char room[20];
    char status[20];
    char patient_id[20];
    char last_updated[30];
} Bed;
```
- Character arrays occupy fixed contiguous memory blocks (`20 + 50 + 20 + 20 + 20 + 30 = 160 bytes`).
- The `int floor` typically occupies `4 bytes`.
- Depending on compiler struct alignment padding (usually 4-byte boundaries), `sizeof(Bed)` is approximately `164 to 168 bytes`.
- A 200-bed global buffer `Bed g_beds[200]` requires roughly `33 KB` of static memory, which is lightweight and cache-friendly.

---

### Q3. Why did you use pass-by-reference using pointers for `bed_count` and `patient_count`?
**Answer**:
In C, function arguments are passed by value (a copy is passed). When a function like `add_bed(Bed beds[], int *bed_count, const Bed *new_bed)` adds a new bed, the total bed count needs to increment in the caller's scope (`main.c`). By passing the pointer `int *bed_count`, the function directly dereferences and modifies `(*bed_count)++` in place. Similarly, `const Bed *new_bed` passes a pointer to the structure rather than copying all 168 bytes onto the call stack, optimizing function call performance.

---

### Q4. Why did you use `fgets()` instead of `scanf()` or `gets()` for user input?
**Answer**:
- `gets()` is notoriously unsafe and deprecated in C99 / removed in C11 because it does not accept a maximum buffer size, leading to buffer overflow vulnerabilities.
- `scanf("%s", ...)` stops reading at whitespace, making it unsuitable for multi-word input like `"General Ward"` or `"Surgical Ward"`. Furthermore, unbounded `scanf` can also overflow buffers.
- `fgets(dest, max_len, stdin)` safely reads up to `max_len - 1` characters, guaranteeing null-termination and preventing stack/buffer overruns. We then sanitize any trailing `\n` or `\r` characters.

---

### Q5. Explain your data persistence format and why pipe (`|`) delimiters were used.
**Answer**:
In `beds.txt`, records are stored as:
`Bed_ID|Ward|Floor|Room|Status|Patient_ID|Last_Updated`
Example:
`ICU301|ICU|1|ICU01|AVAILABLE|-|10:00 AM`
We chose pipe (`|`) rather than spaces or commas because clinical ward names like `"General Ward"` contain spaces, and clinical notes may contain commas. The pipe symbol never occurs in medical codes, allowing unambiguous parsing using `strtok()` in `file.c`.

---

### Q6. What is the time complexity of searching a bed in your program?
**Answer**:
In our primary implementation in `bed.c` and `search.c`, `find_bed_index_by_id()` uses a Linear Search with time complexity **$O(N)$**, where $N$ is the number of beds (up to 200). For an in-memory array of 200 items, $O(N)$ executes in microseconds.
For large datasets, we can apply `sort_beds_by_id()` (which sorts the array in $O(N^2)$ via bubble sort or $O(N \log N)$ via quicksort) and execute Binary Search with time complexity **$O(\log N)$**.

---

### Q7. What are Header Guards (`#ifndef`, `#define`, `#endif`) and why are they necessary in `bed.h`?
**Answer**:
Header guards prevent the preprocessor from including the same header file multiple times within the same compilation unit. If `bed.h` is included by both `patient.c` and `main.c`, without header guards the compiler would encounter duplicate type definitions for `struct Bed`, throwing a compilation error. The header guard ensures the preprocessor parses the definition only once.

---

### Q8. How do you prevent duplicate Bed IDs?
**Answer**:
In `add_bed()` (`bed.c`), before appending the new record to `beds[*bed_count]`, the program calls `find_bed_index_by_id(beds, *bed_count, new_bed->bed_id)`. If the returned index is not `-1`, it indicates the primary key already exists. The function aborts and prints `[ERROR] Duplicate Bed ID already exists`, ensuring database entity integrity.

---

### Q9. Explain the clinical state transition logic in your system. Why can't an occupied bed become immediately `AVAILABLE` upon discharge?
**Answer**:
In real-world healthcare protocols, when an admitted patient vacates a hospital bed, the bed is contaminated and cannot be immediately occupied by another patient.
Our finite state machine enforces:
$$\text{OCCUPIED} \xrightarrow{\text{Discharge}} \text{CLEANING} \xrightarrow{\text{Sanitized}} \text{AVAILABLE}$$
Direct transitions from `OCCUPIED` to `AVAILABLE` are flagged and rejected with a clinical warning. Similarly, admitting a patient to a bed marked `CLEANING` or `MAINTENANCE` is blocked to safeguard patient safety.

---

## Section 2: Web Dashboard & System Architecture

### Q10. What is the architecture of your full system?
**Answer**:
The system follows a 3-tier hybrid architecture:
1. **Presentation Layer**: Responsive Web Dashboard built in HTML5, CSS3, and Vanilla JavaScript.
2. **Cloud API & Database Layer**: Google Apps Script acting as a serverless RESTful API backed by Google Sheets.
3. **Core Systems Engine**: C Programming application containing the baseline business rules, data structures, pointer traversals, local file persistence, and CLI interface.
The web frontend is also designed with an autonomous Local Engine fallback so it operates even when disconnected from the internet.

---

### Q11. Why did you use Google Apps Script and Google Sheets instead of Node.js and MongoDB?
**Answer**:
In accordance with the project guidelines, Google Sheets and Google Apps Script provide a completely free, zero-server-maintenance, and lightweight cloud database. It eliminates dependency installations (like Node runtime or database daemons) for college evaluators. A reviewer can inspect the spreadsheet records in real time in Google Sheets just like a database table.

---

### Q12. How does the Web Dashboard communicate with Google Apps Script?
**Answer**:
Google Apps Script exposes `doGet(e)` and `doPost(e)` endpoints. The frontend uses the JavaScript `fetch()` API. Because Google Apps Script redirects POST requests, requests are transmitted with standard text/JSON payloads and Apps Script returns responses with `ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON)`.

---

### Q13. How does the frontend handle API failures or offline scenarios?
**Answer**:
In `api.js`, all network calls are wrapped in `try...catch` blocks. If the user has not configured a Google Apps Script URL, or if the network is disconnected, the system automatically falls back to `BedAPI.getLocalBeds()` using browser `localStorage` seeded with the exact 64 beds from the C system. The dashboard updates its online status badge to `SYSTEM ONLINE (LOCAL ENGINE)`.

---

## Section 3: Algorithmic & Modular Design

### Q14. What sorting algorithm did you implement and why?
**Answer**:
We implemented Bubble Sort in `sort_beds_by_id()` and `sort_beds_by_ward()`.
- **Reasoning**: Bubble sort is stable, easy to trace during viva examinations, and requires $O(1)$ auxiliary space.
- **Inner loop swapping**:
```c
Bed temp = beds[j];
beds[j] = beds[j + 1];
beds[j + 1] = temp;
```
For large scale production datasets, C's standard library `qsort()` using a comparator function pointer can be substituted for $O(N \log N)$ complexity.

---

### Q15. How does the C program generate the Ward-Wise Availability Report?
**Answer**:
In `report.c`, `generate_bed_report()` iterates over all beds, aggregating distinct ward names into a `WardReportItem` frequency array. For each ward, it computes:
$$\text{Availability Rate (\%)} = \left(\frac{\text{Available Beds in Ward}}{\text{Total Beds in Ward}}\right) \times 100$$
The function simultaneously prints the formatted report to `stdout` and writes it to `reports/bed_report.txt` using `fprintf()`.

---

### Q16. Can this C program run on Linux/macOS as well as Windows?
**Answer**:
Yes. The codebase uses strict **C99 standard** functions. Where case-insensitive string comparison is required, preprocessor directives handle cross-platform compatibility:
```c
#ifdef _WIN32
    if (_stricmp(str1, str2) == 0) ...
#else
    if (strcasecmp(str1, str2) == 0) ...
#endif
```
It compiles cleanly using GCC, Clang, or MSVC without warnings.
