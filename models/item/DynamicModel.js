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
import lib.Enum as Enum;

import event.Emitter as Emitter;

var tickResult = Enum(
		'CONTINUE',
		'SLEEP',
		'REMOVE'
	);

var id = 0;

exports = Class(Emitter, function (supr) {
	this.init = function (opts) {
		supr(this, 'init', arguments);

		this._modelType = opts.modelType;

		this._gridModel = opts.gridModel;

		this._path = null;
		this._pathIndex = 0;
		this._pathDT = 200;

		this._targetTile = null;
		this._speed = 1;

		this._maxTileX = this._gridModel.getWidth() - 1;
		this._maxTileY = this._gridModel.getHeight() - 1;

		this._onScreen = false;
		this._offScreenCount = 0;

		this._id = ++id;

		this._lastX = 0;
		this._lastY = 0;
		this._movedX = 0;
		this._movedY = 0;
		this._deltaX = 0.5;
		this._deltaY = 0.5;

		this._zIndex = 0;

		this._roadLeft = 0.2;
		this._roadRight = 0.8;

		this._needsSleep = false;
		this._needsRemove = false;

		this._conditions = opts.conditions;

		this._updateCB = null;
		this._sleepCB = null;
		this._removeCB = null;

		this.updateOpts(opts);
	};

	this.updateOpts = function (opts) {
		this._opts = merge(
			merge(
				opts,
				this._opts
			),
			{
				tileX: 0,
				tileY: 0,
				x: 0.5,
				y: 0.5
			}
		);

		this._destX = opts.x;
		this._destY = opts.y;
	};

	this.setUpdateCB = function (updateCB) {
		this._updateCB = updateCB;
	};

	this.setSleepCB = function (sleepCB) {
		this._sleepCB = sleepCB;
	};

	this.setRemoveCB = function (removeCB) {
		this._removeCB = removeCB;
	};

	this.getModelType = function () {
		return this._modelType;
	};

	this.getId = function () {
		return this._id;
	};

	this.getOpts = function (opts) {
		return this._opts;
	};

	this.setPos = function (x, y) {
		this._opts.x = x;
		this._opts.y = y;
	};

	this.setPath = function (path) {
		this._path = path;
		this._pathIndex = path.length - 1;
		this._targetTile = path[this._pathIndex];
	};

	this.setOnScreen = function (onScreen) {
		this._onScreen = onScreen;
	};

	this.getTileX = function () {
		return this._opts.tileX;
	};

	this.getTileY = function () {
		return this._opts.tileY;
	};

	this.moveTo = function (destTileX, destTileY, x, y) {
		this._destTileX = destTileX;
		this._destTileY = destTileY;
		this._destX = (x === undefined) ? 0.5 : x;
		this._destY = (y === undefined) ? 0.5 : y;

		this._reachedX = false;
		this._reachedY = false;

		this._gridModel.findPath(this._opts.tileX, this._opts.tileY, destTileX, destTileY, this._conditions, bind(this, 'onFindPath'));
	};

	this.onFindPath = function (path) {
		path.length && this.setPath(path);
	};

	this.onNewTile = function () {
	};

	/**
	 * Move from one tile to another.
	 * field1 = 'tileX' or 'tileY', field2 = 'x' or 'y'
	**/
	this._moveToTile = function (speed, field1, field2, maxTileN, delta) {
		var reached = false;
		var tileN = this._opts[field1];
		var targetTileN = this._targetTile[field1];
		var n = this._opts[field2];

		if ((targetTileN === 0) && (tileN === maxTileN)) {
			n += speed;
			if (n >= 1) {
				n = 1;
				reached = true;
			}
		} else if ((targetTileN === maxTileN) && (tileN === 0)) {
			n -= speed;
			if (n <= 0) {
				n = 0;
				reached = true;
			}
		} else if (targetTileN > tileN) {
			n += speed;
			if (n >= 1) {
				n = 1;
				reached = true;
			}
		} else if (targetTileN < tileN) {
			n -= speed;
			if (n <= 0) {
				n = 0;
				reached = true;
			}
		} else if (targetTileN === tileN) {
			if (n < delta) {
				n += speed;
				if (n >= delta) {
					reached = true;
				}
			} else if (n > delta) {
				n -= speed;
				if (n <= delta) {
					reached = true;
				}
			} else {
				reached = true;
			}
		} else {
			reached = true;
		}

		this._opts[field2] = n;

		return reached;
	};

	/**
	 * Move inside a tile.
	 * field = 'x' or 'y'
	 */
	this._moveOnTile = function (speed, field) {
		var n = this._opts[field];
		if (n < 0.5) {
			n += speed;
			if (n >= 0.5) {
				n = 0.5;
			}
		} else if (n > 0.5) {
			n -= speed;
			if (n <= 0.5) {
				n = 0.5;
			}
		}
		this._opts[field] = n;
	};

	this._updateMoved = function () {
		var opts = this._opts;

		if (opts.x !== this._lastX) {
			if (opts.x < this._lastX) {
				this._movedX = -1;
			} else if (opts.x > this._lastX) {
				this._movedX = 1;
			} else {
				this._movedX = 0;
			}
			this._lastX = opts.x;
		}

		if (opts.y !== this._lastY) {
			if (opts.y < this._lastY) {
				this._movedY = -1;
			} else if (opts.y > this._lastY) {
				this._movedY = 1;
			} else {
				this._movedY = 0;
			}
			this._lastY = opts.y;
		}
	};

	this._updateDelta = function () {
		var opts = this._opts;

		var targetTileY = this._targetTile.tileY;
		var tileY = opts.tileY;
		var targetTileX = this._targetTile.tileX;
		var tileX = opts.tileX;

		if ((targetTileX === 0) && (tileX === this._maxTileX)) {
			targetTileX = this._maxTileX + 1;
		}
		if ((targetTileX === this._maxTileX) && (tileX === 0)) {
			tileX = this._maxTileX + 1;
		}

		if ((targetTileY === 0) && (tileY === this._maxTileY)) {
			targetTileY = this._maxTileY + 1;
		}
		if ((targetTileY === this._maxTileY) && (tileY === 0)) {
			tileY = this._maxTileY + 1;
		}

		if (targetTileY === tileY) { // Straight in x direction
			if (targetTileX > tileX) {
				this._deltaY = this._roadLeft;
			} else if (targetTileX < tileX) {
				this._deltaY = this._roadRight;
			}
			this._deltaX = 0.5;
		} else if (targetTileX === tileX) { // Straight in y direction
			if (targetTileY > tileY) {
				this._deltaX = this._roadRight;
			} else if (targetTileY < tileY) {
				this._deltaX = this._roadLeft;
			}
			this._deltaY = 0.5;
		}
	}

	this._move = function (dt) {
		var speed = this._speed * dt / 1000;

		this._movedX = 0;
		this._movedY = 0;

		if (!this._targetTile) {
			this._moveOnTile(speed, 'x');
			this._moveOnTile(speed, 'y');
			this._updateMoved();
			return;
		}

		// Don't remove these variable assignments!!!
		// Both functions have to be called for proper movement!!!
		this._reachedX = this._reachedX || this._moveToTile(speed, 'tileX', 'x', this._maxTileX, this._deltaX);
		this._reachedY = this._reachedY || this._moveToTile(speed, 'tileY', 'y', this._maxTileY, this._deltaY);
		this._updateMoved();
		this._updateDelta();
		if (!this._reachedX || !this._reachedY) {
			return;
		}

		this._reachedX = false;
		this._reachedY = false;

		var opts = this._opts;
		var targetTileX = this._targetTile.tileX;
		var targetTileY = this._targetTile.tileY;
		var tileX = opts.tileX;
		var tileY = opts.tileY;
		var x = opts.x;
		var y = opts.y;

		if ((targetTileX === 0) && (tileX === this._maxTileX)) {
			x = 0;
		} else if ((targetTileX === this._maxTileX) && (tileX === 0)) {
			x = 1;
		} else if (targetTileX > tileX) {
			x = 0;
		} else if (targetTileX < tileX) {
			x = 1;
		}

		if ((targetTileY === 0) && (tileY === this._maxTileY)) {
			y = 0;
		} else if ((targetTileY === this._maxTileY) && (tileY === 0)) {
			y = 1;
		} else if (targetTileY > tileY) {
			y = 0;
		} else if (targetTileY < tileY) {
			y = 1;
		}

		if ((opts.tileX !== targetTileX) || (opts.tileY !== targetTileY)) {
			opts.tileX = targetTileX;
			opts.tileY = targetTileY;
			this.onNewTile();
		}

		if (this._path) {
			this._pathIndex--;
			if (this._pathIndex >= 0) {
				this._targetTile = this._path[this._pathIndex];
			} else {
				this._path = null;
				this.onReachTarget && this.onReachTarget();
			}
		} else {
			this._targetTile = null;
		}
		opts.x = x;
		opts.y = y;
	};

	this.tick = function (dt) {
		var update = false;

		if (this._onScreen) {
			update = true;
		} else {
			this._offScreenCount++;
			if (this._offScreenCount > 10) {
				this._offScreenCount = 0;
				update = true;
				dt *= 10;
			}
		}

		if (update) {
			var opts = this._opts;

			this._move(dt);
			opts.dt = dt;
			opts.zIndex = this._zIndex + ((opts.y * 24) | 0) + ((12 - opts.x * 12) | 0);

			this._updateCB && this._updateCB(opts);
		}

		if (this._needsSleep) {
			this._needsSleep = false;
			this._sleepCB && this._sleepCB(this);
			return tickResult.SLEEP;
		}
		if (this._needsRemove) {
			this._needsRemove = false;
			this._removeCB && this._removeCB(this);
			return tickResult.REMOVE;
		}

		return tickResult.CONTINUE;
	};

	this.needsSleep = function () {
		this._needsSleep = true;
	};

	this.needsRemove = function () {
		this._needsRemove = true;
	};
});

exports.tickResult = tickResult;