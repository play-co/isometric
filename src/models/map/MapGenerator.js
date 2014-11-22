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
import event.Emitter as Emitter;

exports = Class(Emitter, function (supr) {
	this.init = function (opts) {
		supr(this, 'init', arguments);

		this._gridModel = opts.gridModel;
		this._settings = opts.settings || {};

		this._map = opts.map;
		this._done = true;

		this._width = this._map.getWidth();
		this._height = this._map.getHeight();

		this._steps = this._initGeneratorSteps(this._settings.generatorSteps || []);

		this._map.clear();
		this._map.zeroLayer(0, 1);
	};

	this._initGeneratorSteps = function (generatorSteps) {
		var i = generatorSteps.length;
		while (i) {
			var step = generatorSteps[--i];
			if (step.accept) {
				var j = step.accept.length;
				while (j) {
					j--;
					var t = {};
					step.accept[j].tiles.map(function (a) { t[a] = true; }, {});
					step.accept[j].tiles = t;
				}
			}
		}

		return generatorSteps;
	};

	this.generate = function () {
		if (!this._steps.length) {
			this._map.zeroLayer(0, 1);
			this._done = true;
			return;
		}

		var map = this._map;
		var total = this._height * this._width;

		this._done = false;

		map.clear();
		map.zeroLayer(0, 1);

		// Progress:
		this._totalCount = this._steps.reduce(
			function (a, b) {
				if (b.type === 'fill') {
					return total + a;
				}
				return b.repeat + a;
			},
			0
		);

		this._currentCount = 0;

		this._stepIndex = 0;
		this._startStep();
	};

	this._startStep = function () {
		var step = this._steps[this._stepIndex];

		this._repeatIndex = step.repeat;
		this._layer = step.layer || 0;
		this._group = step.group;
		this._index = step.index;
		this._count = step.count;
		this._accept = step.accept;
		this._type = step.type;
		this._chance = step.chance;
		this._stepsPerFrame = step.stepsPerFrame || 200;

		switch (this._type) {
			case 'rectangles':
				this._startRectangles(step.width || 3, step.height || 3, step.firstRectangle);
				break;

			case 'fill':
				this._startFill();
				break;
		}
	};

	this._step = function () {
		if (this._done) {
			return true;
		}

		this._currentCount++;

		var step = this._steps[this._stepIndex];

		this._repeatIndex--;
		if (this._repeatIndex <= 0) {
			this._stepIndex++;
			this._done = (this._stepIndex >= this._steps.length);
			if (!this._done) {
				this._startStep();
			}
		} else {
			switch (this._type) {
				case 'rectangles':
					this._stepRectangle();
					break;

				case 'fill':
					this.stepFill();
					break;
			}
		}
	};

	this._stepRectangle = function () {
		this._count--;
		if (this._count < 0) {
			var step = this._steps[this._stepIndex];
			this._count = step.count;
			this._startRectangles(step.width || 3, step.height || 3);
		}

		var rect = this._rect;
		var w = 2 + (Math.random() * this._rectWidth) | 0;
		var h = 2 + (Math.random() * this._rectHeight) | 0;

		var dir = this._lastDir;
		if (Math.random() < 0.4) {
			dir = (Math.random() * 4) | 0;
		}
		this._lastDir = dir;

		switch (dir) {
			case 0:
				this._rect = this._createRect(rect.x - w + 2, rect.y - h + 2, w, h);
				break;
			case 1:
				this._rect = this._createRect(rect.x + rect.w - 2, rect.y - h + 2, w, h);
				break;
			case 2:
				this._rect = this._createRect(rect.x + rect.w - 2, rect.y + rect.h - 2, w, h);
				break;
			case 3:
				this._rect = this._createRect(rect.x - w + 2, rect.y + rect.h - 2, w, h);
				break;
		}
	};

	this.stepFill = function () {
		var map = this._map;
		var x = this._repeatIndex % this._width;
		var y = (this._repeatIndex / this._height) | 0;

		if (this._accept && !map.isTiles(this._accept[0].layer, x, y, 1, 1, this._accept)) {
			return;
		}

		if (Math.random() < this._chance) {
			map.drawTile(this._layer, x, y, this._group, this._index, false);
		}
	};

	this.generateStep = function () {
		if (this._done) {
			return true;
		}

		for (var i = 0; i < this._stepsPerFrame; i++) {
			this._step();
		}

		this._gridModel.getProgressCB()(this._currentCount / this._totalCount);

		return false;
	};

	this._startRectangles = function (rectWidth, rectHeight, firstRectangle) {
		this._rectWidth = rectWidth;
		this._rectHeight = rectHeight;
		this._lastDir = -1;

		if (firstRectangle) {
			this._rect = this._createRect(
				firstRectangle.x,
				firstRectangle.y,
				firstRectangle.w,
				firstRectangle.h
			);
		} else {
			this._rect = this._createRect(
				2 + (Math.random() * this._width) | 0,
				2 + (Math.random() * this._height) | 0,
				this._rectWidth + (Math.random() * this._rectWidth) | 0,
				this._rectHeight + (Math.random() * this._rectHeight) | 0
			);
		}
	};

	this._startFill = function () {
		this._repeatIndex = this._height * this._width;
	};

	this._createRect = function (x, y, w, h) {
		var rect = {
			x: this._width + x,
			y: this._height + y,
			w: w,
			h: h
		};

		var map = this._map;
		if (this._accept && !map.isTiles(this._layer, rect.x, rect.y, rect.w, rect.h, this._accept)) {
			return rect;
		}

		map.drawRect(
			this._layer,
			rect.x, rect.y, rect.w, rect.h,
			this._group, [[8, 12, 4], [10, 15, 5], [2, 3, 1]]
		);

		return rect;
	};

	this.setDone = function (done) {
		this._done = done;
	};
});