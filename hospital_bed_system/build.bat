@echo off
echo ===================================================
echo Compiling Hospital Bed Monitoring System (C Core)...
echo ===================================================
gcc -Wall -Wextra -std=c99 main.c bed.c patient.c search.c report.c file.c -o hospital_bed_system.exe
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Compilation successful!
    echo Running Hospital Bed Monitoring System...
    echo ===================================================
    hospital_bed_system.exe
) else (
    echo [ERROR] Compilation failed with error code %ERRORLEVEL%.
)
pause
