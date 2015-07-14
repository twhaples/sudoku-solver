/*
	Copyright 2006 Thomas Whaples

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/

#include <string.h>
#include <ctype.h>
#include <assert.h>
#include <stdio.h>
#include "sudoku.h"

static int board[81];			/* This points to our gameboard. */
static int cellstrikes[81][10];	/* This tells us which numbers won't work where. */

int try();

int place(int,int);
int strike(int,int);
void unplace(int);
void unstrike(int,int); 
void printboard(int *);

int *solve(int problem);
int main(int argc, char **argv){
	int c;
	int index;

	for(index = 0; ((c = getchar()) != EOF) && index < 81; index++){
		if(isdigit(c)){
			c -= '0';
			if(c){
				if(!place(index,c)){
#if CGI
					printf("%d\n",index);
#else
					printf("Invalid input board: cell %d\n",index);
#endif
					return 2;
				}
			}
		} else if(c == '\n' || c == '\r'){
#if CGI
			puts("-1 Inadequate input!");
			return 4;
#endif
			index--;
			// never mind!
		} else if(isspace(c) || c == '?' || c == '.' || c == '_') {
			; // blank-space handling
		} else {
#if CGI
			printf("%d",index);
#else
			printf("Problem with input character '%c' in cell %d\n",c,index);
#endif
			return 3;
		}
	}
	if(try()){
		printboard(board);
	} else {
		puts("No success.");
		return 1;
	}
	return 0;
}
void putdigit(int c){
	putchar(c ? c + '0' : ' ');
}

void printboard(int *board){
	int r,c;
	for(r = 0; r < 9; r++){
		for(c = 0; c < 9; c++){
			putdigit(board[r*9+c]);
			}
#if CGI
		}
	putchar('\n'); // \n per board
#else	
		putchar('\n'); // \n per line
	}
#endif 
}


/*
  strikes[n] tracks which numbers are available for a certain cell, row, or column.
  strikes[n][1] to strikes[n][9] track individual digits' use.
  strikes[n][0] holds a count of the total digits unavailable.
 */

 /* Look for the cell with the least options (the most strikes against it) */
  /* this is probably the best cell to try and fill because if you fail, you have */
  /* wasted less effort than you would have otherwise. */
int best(){
  int cell;
  int bestcell = -1;
  int bcScore = -1;
  int thisScore;
  /* if we find a cell with 8 strikes, then we're not getting any better    */
  /* We don't bother sorting - we won't search often enough to warrant it.  */
  for(cell = 0; cell < 81 && bcScore != 8; cell++){
    if(board[cell] == 0){ /* only consider empty cells */
      thisScore = cellstrikes[cell][0];
      if(thisScore > bcScore){
	bestcell = cell;
	bcScore = thisScore;
      }
    }
  }
  return bestcell;
}

/*
 * Attempt to solve sudoku, with the given board.
 * Returns true if it has found a solution.
 */
int try(){
	int cell = best();
	if(cell == -1) return true; /* if all cells are full, assume we're done. */

	int n; 
	/* Try and put a number in this square. */
	for(n = 1; n <= 9; n++){ /* Try every number. */
		if(place(cell,n)){ 		/* if the number even fits in the cell... */
    		if(try())			/* try and solve the problem like this. */
				return true;	/* if you solved it hooray! */
	      	else unplace(cell); /* otherwise, undo the placement... */
		}					/* and try the next number. */
	}                   
	return false; /* must not have worked. */
}


/**
 * Places a value in a cell. Returns false if this is illegal. Updates unavailability counts as appropriate.
 */
int place(int cell, int value){
  /* If it's an illegal placement, don't let it happen. */
  if(cellstrikes[cell][value]) return false;
  board[cell] = value;
  int n,idx,
    therow,thecol,thesq;
  int allgood = true;  /* is this placement still possible? */
  therow = ROW(cell);  /* which row is the cell in? */
  thecol = COL(cell);  /* which column is the cell in? */
  thesq = cellsquares[cell]; /* which square is the cell in? */
  for(n = 0; n < 9 && allgood; n++){
    idx = IDX(n,thecol);         if(idx != cell) allgood &= strike(idx,value);
    idx = IDX(therow,n);         if(idx != cell) allgood &= strike(idx,value);
    idx = squarecells[thesq][n]; if(idx != cell) allgood &= strike(idx,value);
    /* Yes that's a bitwise and. So what? */
  }
  if(!allgood){ /* whoops! We've hit a snag. */
    while(n--){ /* go back and undo everything we've already done */
      idx = IDX(n,thecol);         if(idx != cell) unstrike(idx,value);
      idx = IDX(therow,n);         if(idx != cell) unstrike(idx,value);
      idx = squarecells[thesq][n]; if(idx != cell) unstrike(idx,value);
    }
    board[cell] = 0;
    return false; /* Sorry, ma'am, I can't let you do that. */
  }
  return true;
}

/* Zeroes a particular cell. Updates unavailablity counts as appropriate. */
void unplace(int cell){
  int n,
    therow = ROW(cell),
    thecol = COL(cell),
    thesq = cellsquares[cell],
    value = board[cell];
  for(n = 0; n < 9; n++){
    unstrike(IDX(n,thecol),value);         /* unstrike this digit from each cell in its column */
    unstrike(IDX(therow,n),value);         /* unstrike this digit from each cell in its row */
    unstrike(squarecells[thesq][n],value); /* unstrike this digit from each cell in its square. */
  }

  board[cell] = 0;
}

/* Makes the digit 'value' unavailable in
   the length-10 strike-array specified. 
   Returns false if this strike results in a square that is empty becoming unfillable, true otherwise.
*/
int strike(int cell, int value){
  if(board[cell])                /* if the cell is already set */
    return board[cell] != value; /* you'd better not be striking its present value. */

  if(cellstrikes[cell][value])  /* if we already KNOW it's not this value */
    cellstrikes[cell][value]++; /* just increment that */
  else {                        /* otherwise, this is the first time we've struck this */
    cellstrikes[cell][value]++; /* so mark its cell */
    return(++cellstrikes[cell][0] != 9); /* and add one (return false if it's illegal) */
  }
  return true;
}

void unstrike(int cell, int value){
  if(board[cell]) return; /* we don't play with cells who are already set. */

  assert(cellstrikes[cell][value] > 0); /* don't unstrike more than you've struck! */
  --cellstrikes[cell][value];
  if(cellstrikes[cell][value] == 0){ /* if you're down to 0 here, you've just freed a whole digit */
    assert(cellstrikes[cell][0] > 0);
    cellstrikes[cell][0]--;
  }
}
