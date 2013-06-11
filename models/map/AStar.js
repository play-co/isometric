/**
 * @license
 * This file is part of the Game Closure SDK.
 *
 * The Game Closure SDK is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * The Game Closure SDK is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with the Game Closure SDK.  If not, see <http://www.gnu.org/licenses/>.
 */
exports = Class(function () {
    this.init = function (opts) {
        this._map = opts.map;
        this._width = opts.map.getWidth();
        this._height = opts.map.getHeight();
        this._limit = this._width * this._height;

        this._acceptLength = Math.min(this._width >> 1, this._height >> 1);

        this._grid = [];
        for (var y = 0; y < this._height; y++) {
            for (var x = 0; x < this._width; x++) {
                this._grid.push({
                    parent: null,
                    value: y * this._width + x,
                    tileX: x,
                    tileY: y,
                    t: 0
                });
            }
        }

        this._neighbourList = [];
        for (var x = 0; x < 8; x++) {
            this._neighbourList.push({tileX: 0, tileY: 0});
        }

        this._t = 1;

        this._queue = [];
        this._currentSearch = null;
        this._currentPath = null;
        this._rect = {x: 0, y: 0, w: 1, h: 1};
    };

    this._valid = function (tileX, tileY) {
        this._rect.x = tileX;
        this._rect.y = tileY;
        return this._map.acceptRect(this._rect, this._conditions);
    };

    this._tile = function (index) {
        var tile = this._grid[index];
        var t = this._t;

        if (tile.t < t) {
            tile.f = 0;
            tile.g = 0;
            tile.t = t;
        }

        return tile;
    };

    this._startSearch = function (search) {
        this._result = [];
        this._path = [];
        this._end = this._tile(search.endY * this._width + search.endX);
        this._open = [search.startY * this._width + search.startX];
        this._startX = search.startX;
        this._startY = search.startY;
        this._conditions = search.conditions;

        this._t++;
    };

    this._findPath = function () {
        var result = this._result;
        var path = this._path;
        var end = this._end;
        var open = this._open;

        var grid = this._grid;
        var width = this._width;
        var neighbourList = this._neighbourList;

        var length = open.length;
        var max = this._limit;
        var min = -1;
        for (i = 0; i < length; i++) {
            if (grid[open[i]].f < max) {
                max = grid[open[i]].f;
                min = i;
            }
        };

        var node = this._tile(open.splice(min, 1)[0]);
        if (node.value === end.value) {
            var currentNode = node;
            while (!((currentNode.tileX === this._startX) && (currentNode.tileY === this._startY))) {
                result.push({tileX: currentNode.tileX, tileY: currentNode.tileY});
                currentNode = currentNode.parent;
            }
        } else {
            var i = this._neighbours(node.tileX, node.tileY);
            while (i) {
                var neighbour = neighbourList[--i];
                var currentNode = this._tile(neighbour.tileY * width + neighbour.tileX);
                if (!path[currentNode.value]) {
                    path[currentNode.value] = true;
                    currentNode.parent = node;
                    currentNode.g = this._manhattan(neighbour, node) + node.g;
                    currentNode.f = this._manhattan(neighbour, end) + currentNode.g;
                    open.push(currentNode.value);
                }
            }
        }
    };

    this.update = function () {
        if (!this._currentSearch && this._queue.length) {
            this._currentSearch = this._queue.shift();
            var currentSearch = this._currentSearch;
            this._startSearch(currentSearch);
            this._wrap = false;
        }

        if (!this._currentSearch) {
            return;
        }

        var currentSearch = this._currentSearch;

        for (i = 0; i < 100 && this._open.length; i++) {
            this._findPath();
        }
        if (!this._open.length) {
            if (currentSearch.wrap) {
                if (!this._currentPath.length) {
                    currentSearch.cb(this._result);
                } else if (!this._result.length) {
                    currentSearch.cb(this._currentPath);
                } else {
                    currentSearch.cb((this._currentPath.length < this._result.length) ? this._currentPath : this._result);
                }
                this._currentSearch = null;
            } else if (this._result.length && (this._result.length < this._acceptLength)) {
                // If we have a result without wrap and it has an acceptable length then quit searching...
                currentSearch.cb(this._result);
                this._currentSearch = null;
            } else {
                currentSearch.wrap = true;
                this._currentPath = this._result;
                this._startSearch(currentSearch);
                this._wrap = true;
            }
        }
    };

    this.findPath = function (startX, startY, endX, endY, conditions, cb) {
        this._queue.push({
            startX: startX,
            startY: startY,
            endX: endX,
            endY: endY,
            cb: cb,
            wrap: false,
            conditions: conditions
        });
    };

    this.clear = function () {
        this._queue = [];
        this._currentSearch = null;
    };

    this._neighbours = function (tileX, tileY) {
        var neighbourList = this._neighbourList;
        var neighbourCount = 0;
        var neighbour;
        var width = this._width;
        var height = this._height;
        var tileX1Valid;
        var tileY1Valid;
        var tileX2Valid;
        var tileY2Valid;
        var tileX1;
        var tileY1;
        var tileX2;
        var tileY2;

        if (this._wrap) {
            tileX1 = (tileX + width - 1) % width;
            tileX2 = (tileX + width + 1) % width;
            tileY1 = (tileY + height - 1) % height;
            tileY2 = (tileY + height + 1) % height;
            tileX1Valid = this._valid(tileX1, tileY),
            tileX2Valid = this._valid(tileX2, tileY);
            tileY1Valid = this._valid(tileX, tileY1);
            tileY2Valid = this._valid(tileX, tileY2);
        } else {
            tileX1 = tileX - 1;
            tileX2 = tileX + 1;
            tileY1 = tileY - 1;
            tileY2 = tileY + 1;
            tileX1Valid = (tileX1 >= 0) && this._valid(tileX1, tileY),
            tileX2Valid = (tileX2 < width) && this._valid(tileX2, tileY);
            tileY1Valid = (tileY1 >= 0) && this._valid(tileX, tileY1);
            tileY2Valid = (tileY2 < height) && this._valid(tileX, tileY2);
        }

        if (tileX1Valid) {
            neighbour = neighbourList[neighbourCount];
            neighbour.tileX = tileX1;
            neighbour.tileY = tileY;
            neighbourCount++;
        }
        if (tileX2Valid) {
            neighbour = neighbourList[neighbourCount];
            neighbour.tileX = tileX2;
            neighbour.tileY = tileY;
            neighbourCount++;
        }

        if (tileY1Valid) {
            neighbour = neighbourList[neighbourCount];
            neighbour.tileX = tileX;
            neighbour.tileY = tileY1;
            neighbourCount++;

            if (tileX2Valid && this._valid(tileX2, tileY1)) {
                neighbour = neighbourList[neighbourCount];
                neighbour.tileX = tileX2;
                neighbour.tileY = tileY1;
                neighbourCount++;
            }
            if (tileX1Valid && this._valid(tileX1, tileY1)) {
                neighbour = neighbourList[neighbourCount];
                neighbour.tileX = tileX1;
                neighbour.tileY = tileY1;
                neighbourCount++;
            }
        }
        if (tileY2Valid) {
            neighbour = neighbourList[neighbourCount];
            neighbour.tileX = tileX;
            neighbour.tileY = tileY2;
            neighbourCount++;

            if (tileX2Valid && this._valid(tileX2, tileY2)) {
                neighbour = neighbourList[neighbourCount];
                neighbour.tileX = tileX2;
                neighbour.tileY = tileY2;
                neighbourCount++;
            }
            if (tileX1Valid && this._valid(tileX1, tileY2)) {
                neighbour = neighbourList[neighbourCount];
                neighbour.tileX = tileX1;
                neighbour.tileY = tileY2;
                neighbourCount++;
            }
        }

        return neighbourCount;
    };

    this._manhattan = function (point, end) {
        return Math.abs(point.tileX - end.tileX) + Math.abs(point.tileY - end.tileY);
    };
});