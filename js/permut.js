/*
Copyright 2014 Aalesund University College

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

"use strict";

var Permut = function (a, n) {

    this._a = a;
    this._n = n;

    this.getVariations = function () {
        // split string
        var temp = this._a.split("-");
        var l = temp.length;
        //console.log("l= " + l);
        var numPermutations = parseInt(Math.pow(l, this._n));
        //console.log(numPermutations);
        var table = new Array(numPermutations);
        for (var i = 0; i < numPermutations; i++) {
            table[i] = (new Array(this._n));
        }

        for (var x = 0; x < this._n; x++) {
            var t2 = parseInt(Math.pow(l, x));
            for (var p1 = 0; p1 < numPermutations;) {
                for (var al = 0; al < l; al++) {
                    for (var p2 = 0; p2 < t2; p2++) {
                        table[p1][x] = temp[al];
                        p1++;
                    }
                }
            }
        }

        var result = [];
        for (var i = 0; i < table.length; i++) {
            var tmp = '';
            for (var j = 0; j < table[i].length; j++) {
                tmp += table[i][j] ;
                if (j !== table[i].length - 1) {
                    tmp += ":";
                }
            }
            //console.log(tmp);
            result.push(tmp);
        }
        return result;
    }
}