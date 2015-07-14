sudoku: sudoku.c sudoku.h
	gcc sudoku.c -osudoku -O3
sudoku-fuzz: sudoku.c sudoku.h
	afl-clang sudoku.c -osudoku-fuzz
	chmod 775 sudoku-fuzz
clean:
	rm -f sudoku sudoku-fuzz
	rm -rf fuzz-out sudoku-fuzz.DSYM
install: sudoku
	cp sudoku ..
fuzz: sudoku-fuzz
	afl-fuzz -i fuzz-in/ -o fuzz-out/ -t 50000 ./sudoku-fuzz
