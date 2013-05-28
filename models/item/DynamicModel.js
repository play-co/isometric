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

		this._gridModel = opts.gridModel;

		this._path = null;
		this._pathIndex = 0;
		this._pathDT = 200;

		this._target = {x: 0, y: 0};
		this._targetTile = null;
		this._speed = 1;

		this._maxTileX = this._gridModel.getWidth() - 1;
		this._maxTileY = this._gridModel.getHeight() - 1;

		this._onScreen = false;
		this._offScreenCount = 0;

		this._id = ++id;

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

	this.moveTo = function (destTileX, destTileY, x, y) {
		this._destTileX = destTileX;
		this._destTileY = destTileY;
		this._destX = (x === undefined) ? 0.5 : x;
		this._destY = (y === undefined) ? 0.5 : y;

		this._reachedX = false;
		this._reachedY = false;

		this._gridModel.findPath(this._opts.tileX, this._opts.tileY, destTileX, destTileY, 1, 3, bind(this, 'onFindPath'));
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
	this._moveToTile = function (speed, field1, field2, maxTileN) {
		var reached = false;
		var tileN = this._opts[field1];
		var targetTileN = this._targetTile[field2];
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
			if (n < 0.5) {
				n += speed;
				if (n >= 0.5) {
					reached = true;
				}
			} else if (n > 0.5) {
				n -= speed;
				if (n <= 0.5) {
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

	this._move = function (dt) {
		var speed = this._speed * dt / 1000;

		if (!this._targetTile) {
			this._moveOnTile(speed, 'x');
			this._moveOnTile(speed, 'y');
			return;
		}

		// Don't remove these variable assignments!!!
		// Both functions have to be called for proper movement!!!
		this._reachedX = this._reachedX || this._moveToTile(speed, 'tileX', 'x', this._maxTileX);
		this._reachedY = this._reachedY || this._moveToTile(speed, 'tileY', 'y', this._maxTileY);
		if (!this._reachedX || !this._reachedY) {
			return;
		}

		this._reachedX = false;
		this._reachedY = false;

		var opts = this._opts;
		var targetTileX = this._targetTile.x;
		var targetTileY = this._targetTile.y;
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
			this._move(dt);
			this._opts.dt = dt;
			this.publish('Update', this._opts);
		}

		return tickResult.CONTINUE;
	};
});

exports.tickResult = tickResult;