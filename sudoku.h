/*
 * Copyright 2006 Thomas Whaples
 * See sudoku.c for license information
 */

#ifndef __SDK_H
#define __SDH_H
/* Some useful constants and macros. */

/* Given a square ID, which cells are in it? */
static int squarecells[9][9] = {
  { 0, 1, 2,   9,10,11,  18,19,20},
  { 3, 4, 5,  12,13,14,  21,22,23},
  { 6, 7, 8,  15,16,17,  24,25,26},

  {27,28,29,  36,37,38,  45,46,47},
  {30,31,32,  39,40,41,  48,49,50},
  {33,34,35,  42,43,44,  51,52,53},

  {54,55,56,  63,64,65,  72,73,74},
  {57,58,59,  66,67,68,  75,76,77},
  {60,61,62,  69,70,71,  78,79,80}
};
/* Given a cell ID, which square is it in? */
static int cellsquares[81] = {
  0,0,0,1,1,1,2,2,2,
  0,0,0,1,1,1,2,2,2,
  0,0,0,1,1,1,2,2,2,
  3,3,3,4,4,4,5,5,5,
  3,3,3,4,4,4,5,5,5,
  3,3,3,4,4,4,5,5,5,
  6,6,6,7,7,7,8,8,8,
  6,6,6,7,7,7,8,8,8,
  6,6,6,7,7,7,8,8,8};

/* row/column to index-in-81 mappings */
#define IDX(row,col) (((row)*9) + col)
#define COL(idx)     ((idx) % 9)
#define ROW(idx)     ((idx) / 9)
#define true 1
#define false 0

#endif
