#ifndef SEARCH_H
#define SEARCH_H

#include "bed.h"

void search_by_id(const Bed beds[], int count);
void search_by_ward(const Bed beds[], int count);
void search_by_room(const Bed beds[], int count);
void search_by_status(const Bed beds[], int count);

void filter_available(const Bed beds[], int count);
void filter_by_ward(const Bed beds[], int count, const char *ward);
void filter_by_floor(const Bed beds[], int count, int floor);

int match_ignore_case(const char *haystack, const char *needle);

#endif
