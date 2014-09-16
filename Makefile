sudoku: sudoku.c sudoku.h
	gcc sudoku.c -osudoku -O3
clean:
	rm -f sudoku
install: sudoku
	cp sudoku ..
