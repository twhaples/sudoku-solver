/*
    Copyright December 2006 Thomas Whaples

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more detailsudo.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA

*/
var Sudoku = {

Data: {
	blockcells: [
 		[ 0, 1, 2,  9,10,11, 18,19,20],
 		[ 3, 4, 5, 12,13,14, 21,22,23],
 		[ 6, 7, 8, 15,16,17, 24,25,26],
 
 		[27,28,29, 36,37,38, 45,46,47],
 		[30,31,32, 39,40,41, 48,49,50],
 		[33,34,35, 42,43,44, 51,52,53],
 		
 		[54,55,56, 63,64,65, 72,73,74],
 		[57,58,59, 66,67,68, 75,76,77],
 		[60,61,62, 69,70,71, 78,79,80]],
	cellblocks: [
 		0,0,0,1,1,1,2,2,2,
 		0,0,0,1,1,1,2,2,2,
 		0,0,0,1,1,1,2,2,2,
 		3,3,3,4,4,4,5,5,5,
 		3,3,3,4,4,4,5,5,5,
 		3,3,3,4,4,4,5,5,5,
		6,6,6,7,7,7,8,8,8,
		6,6,6,7,7,7,8,8,8,
		6,6,6,7,7,7,8,8,8],
	rowcells: [
		[ 0, 1, 2, 3, 4, 5, 6, 7, 8],
		[ 9,10,11,12,13,14,15,16,17],
		[18,19,20,21,22,23,24,25,26],
		[27,28,29,30,31,32,33,34,35],
		[36,37,38,39,40,41,42,43,44],
		[45,46,47,48,49,50,51,52,53],
		[54,55,56,57,58,59,60,61,62],
		[63,64,65,66,67,68,69,70,71],
		[72,73,74,75,76,77,78,79,80]],
	colcells: [
		[0, 9,18,27,36,45,54,63,72],
		[1,10,19,28,37,46,55,64,73],
		[2,11,20,29,38,47,56,65,74],
		[3,12,21,30,39,48,57,66,75],
		[4,13,22,31,40,49,58,67,76],
		[5,14,23,32,41,50,59,68,77],
		[6,15,24,33,42,51,60,69,78],
		[7,16,25,34,43,52,61,70,79],
		[8,17,26,35,44,53,62,71,80]],
},

Cell: {
	strike: function(val) {
		this.strikes[val]++;
		return this.v != val;
	},
	unstrike: function(val){ 
		this.strikes[val]--; 
		},
	
	place: function(val){
		if(this.strikes[val]) return false; // disallow the impossible
		this.v = val;
		if(this.animate) this.show();
		var good = true;
		var cells = this.board.cells;
		var ind = this.index;
		var func = function(cell,index){
			if(cell != ind){
				var res = cells[cell].strike(val);
				good = good && res;
			}
		}
		this.getBlock().each(func);
		this.getRow().each(func);
		this.getCol().each(func);
		if(!good){ this.unplace();}
		return good;
	},
	unplace: function(){
		if(!this.v) return;
		var cells = this.board.cells;
		var ind = this.index;
		var v = this.v;
		var func = function(cell){
			if(cell != ind){
				cells[cell].unstrike(v);
			}
		}
		this.getCol().each(func);
		this.getRow().each(func);
		this.getBlock().each(func);
		
		this.v = 0;
		if(this.animate) this.show();
	},
	
	freedom: function(){
		var total = 9;
		this.strikes.each(function(val){
			if(val) total--;
		});
		return total;
	},
	

	lock: function(){
		this.v = 0;
		this.bookmark = 0;
		this.readOnly = true;
		if(this.value){
			if(this.place(this.value))
				this.className = "user";
			else {
				this.className = "error";
				return false;
			}
		} else {
			this.className = "system";
		}
		return true;
	},
	unlock: function(){
		if(this.className == "system"){
			this.value = "";
			this.v = 0;
		}
		if(this.className != "error")
			this.className = "";
		this.strikes = [0,0,0,0,0,0,0,0,0,0];
		this.readOnly = false;
	},
	
	oneStep: function(){
		if(this.bookmark < 9){
			this.bookmark++; // starts at 0 -- try 1 first
			if(this.v) this.unplace(); 
			var res = this.place(this.bookmark);
			return true;
		} // bookmark == 9 -- just completed trying 9
		this.bookmark = 0;
		return false;
	},
	
	
	show: function(){ this.value = this.v ? this.v : ""; },
	
	reset: function(){
		this.value = "";
		this.className = "";
		this.readOnly = false;
	},
	
	getBlock: function(){
		return Sudoku.Data.blockcells[this.block];
	},
	
	getRow: function(){
		return Sudoku.Data.rowcells[this.row];
	},
	getCol: function() {
		return Sudoku.Data.colcells[this.col];
	},
	
	onfocus: function() { 
		this.select(); 
		if(this.className == "error")
			this.className = "";
		},
	
}};


Sudoku.Board = Class.create();
Object.extend(Sudoku.Board.prototype, {
    initialize: function(div) {
	    caller = this;
	    this.board = div;
		this.cells = Array();
		this.history = Array();
		this.bookmark = -1;

	    var t = document.createElement("table");
		var tb = document.createElement("tbody");
		t.align = "center";
		t.appendChild(tb);
		this.board.appendChild(t);

		for(var r = 0; r < 9; r++){
			var row = document.createElement("tr");
			for(var c = 0; c < 9; c++){
				var cell = document.createElement("td");   // this is a lil bit of misnomering
				var inp = document.createElement("input"); // 'cell' here is the td, 'inp' is the input/cell
				Object.extend(inp,Sudoku.Cell);
				
				inp.size = inp.maxLength = 1;
				inp.board = this;
				inp.row = r;
				inp.col = c;
				inp.index = this.cells.length;
				inp.block = Sudoku.Data.cellblocks[inp.index]
				inp.strikes = [0,0,0,0,0,0,0,0,0,0];
				
				this.cells[inp.index] = inp;
				
				rm = (r == 3 || r == 4 || r == 5);
				cm = (c == 3 || c == 4 || c == 5);
				if((rm && !cm) || (cm && !rm)){
					cell.className = "stripeA";
					// for the 3x3 squares
				} else {
					cell.className = "stripeB";
				}
				cell.appendChild(inp);
				row.appendChild(cell);
				
			}
			tb.appendChild(row);
		} // end for	

		var anim  = document.createElement("input");
		var solve = document.createElement("input");
		var reset = document.createElement("input");
		var clear = document.createElement("input");
		clear.type = solve.type = reset.type = anim.type = "button";
		
		solve.value = "fast solve";
		anim.value  = "pretty solve";
		reset.value = "reset";
		clear.value = "clear";

		div.appendChild(solve);
		div.appendChild(anim);
		div.appendChild(reset);
		div.appendChild(clear);
		
		var status = document.createElement("p");
		status.className = "status";
		div.appendChild(status);
		
		this.setState = function(state){
			if(state == 0){
				anim.disabled = solve.disabled = clear.disabled = false;
				reset.disabled = true;
				status.innerHTML = "Input mode";
			} else if(state == 1){
				anim.disabled = solve.disabled = reset.disabled = clear.disabled = true;
				status.innerHTML = "Running...";
			} else if(state == 2){
				anim.disabled = solve.disabled = true;
				reset.disabled = clear.disabled = false;
				status.innerHTML = "Solution";
			}
		}
		this.setState(0);
		
		anim.onclick = function(){
			caller.setState(1);
			if(caller.lock(1))
				window.setTimeout(function(){
				caller.run();
				caller.setState(2);
			},10);
			else caller.setState(0);
		};
		solve.onclick = function(){
			caller.setState(1);
			if(caller.lock(0)){
				window.setTimeout(function(){
					caller.run();
					caller.setState(2);
				}, 10);
			} else caller.setState(0);
		};
				
		reset.onclick = function(){
			caller.unlock();
			caller.setState(0);
			};
		clear.onclick = function(){
			caller.clear();
			caller.setState(0);
		};
	}, // end initialize
	lock: function(animate){
		var good = true;
			this.cells.each(function(cell){
				var res = cell.lock();
				cell.animate = animate;
				good = good && res;
			});
		return good;
	},
	unlock: function(){
		this.cells.each(function(cell){
			cell.unlock();
		}); // end each
	},
	clear: function(){
		this.cells.each(function(cell){
			cell.value = "";
			cell.unlock();
		});
	},
	
	best: function(){
		var res = -1;
		var minfree = 10;
		cells = this.cells;
		cells.each(function(cell){
			if(!cell.v){ // no occupied cells please
				var v = cell.freedom();
				if(v && v < minfree){ // no zeros please
					res = cell.index;
					minfree = v;
				}
			}
		});
		return res;
	},
	
	run: function(){
		if(this.full()) return true;
		var b = this.best();
		if(b < 0){ return false; }
		var where = this.cells[b];
		for(var n = 1; n <= 9; n++){
			if(where.place(n)){
				if(this.run()){
					where.show();
					return true;
				} else {
					where.unplace();
				} // end else
			} // end if
		} // end for
		return false;
	},
	/*
	oneStep: function(){
		if(this.bookmark == undefined || this.bookmark == -1){
			this.bookmark = this.best();
		}
		else if(this.cells[this.bookmark].v){
			this.history[this.history.length] = this.bookmark;
			this.bookmark = this.best();
		}
		if(this.bookmark == -1){
			if(this.full())
				return true; // success
			this.bookmark = this.history.last();
			this.history.length--;
		} 
		
		var c = this.cells[this.bookmark];
		res = c.oneStep();
		c.show();
		if(!res){
			if(this.history.length){
				this.bookmark = this.history.last();
				this.history.length--;
			} else{
				// no history. nowhere to backtrack.
				alert("I give up!");
				return true;
			 } // end else: no history
		} // end !res

		return false; // not done yet
	}, // end oneStep */
	
	full: function(){
		cells = this.cells;
		full = true;
		cells.each(function(c){
			if(!(c.v))
				full = false;
		});
		return full;
	}
}); // end SudokuBoard



var s = new Sudoku.Board($("sudo"));

