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

import ui.View as View;
import ui.TextView as TextView;

var inputModes = Enum(
		'BUTTON',
		'DRAG'
	);

exports = Class(View, function (supr) {
	this.init = function (opts) {
		var opts = merge(
				opts,
				{
					x: 0,
					y: 0,
					width: GC.app.baseWidth,
					height: GC.app.baseHeight
				}
			);
		supr(this, 'init', [opts]);

		this._gridView = opts.gridView;

		this._downIndexStart = -1;
		this._downIndex = -1;

		this._dragMode = true;
		this._dragPointFirst = null;
		this._dragPoints = {};
		this._dragPointIndex = [];
		this._dragInitialDistance = null;
		this._dragInitialScale = null;

		this._lastScale = null;
	};

	this.getDragPointCount = function () {
		var dragPointCount = 0;
		for (var i in this._dragPoints) {
			if (this._dragPoints[i]) {
				dragPointCount++;
			}
		}
		return dragPointCount;
	};

	this.onInputStart = function (evt) {
		var index = 'p' + evt.id;
		this.emit('SelectCancel');

		this._dragPoints[index] = {x: evt.srcPoint.x, y: evt.srcPoint.y};

		if (this.getDragPointCount() === 1) {
			this._dragPointFirst = index;

			if (!this._dragMode) {
				var scale = GC.app.scale * this._gridView.getScale();
				this.emit('Start', 5, {x: this._dragPoints[index].x / scale, y: this._dragPoints[index].y / scale});
			}
		}

		this._dragInitialDistance = null;
	};

	this.onInputMove = function (evt) {
		if (this.getDragPointCount() === 0) {
			return;
		}

		var x = this._dragPoints[this._dragPointFirst].x;
		var y = this._dragPoints[this._dragPointFirst].y;
		var scale = GC.app.scale * this._gridView.getScale();
		var index = 'p' + evt.id;
		var point = this._dragPoints[index];

		point.x = evt.srcPoint.x;
		point.y = evt.srcPoint.y;

		if (index === this._dragPointFirst) {
			this._dragPoints[index].x = point.x;
			this._dragPoints[index].y = point.y;
		}

		if (this.getDragPointCount() === 2) {
			var p1 = this._dragPoints[this._dragPointIndex[0]];
			var p2 = this._dragPoints[this._dragPointIndex[1]];
			var dx = p2.x - p1.x;
			var dy = p2.y - p1.y;
			var d = Math.sqrt(dx * dx + dy * dy) * GC.app.scale;

			if (this._dragInitialDistance === null) {
				this._dragInitialDistance = d;
				this._dragInitialScale = this._gridView.getScale();
				this._lastScale = null;
			} else {
				scale = (d / this._dragInitialDistance * 100) | 0;
				if (this._lastScale !== scale) {
					this._lastScale = scale;
					this._gridView.setScale(this._dragInitialScale * scale / 100);
				}
			}
		} else if (this._dragMode) {
			if (this._dragPointFirst === index) {
				this.emit('Drag', (x - point.x) / scale, (y - point.y) / scale);
			}
		} else {
			this.emit('Select', 5, {x: point.x / scale, y: point.y / scale});
		}
	};

	this.onInputSelect = function (evt) {
		var index = 'p' + evt.id;
		this._dragPoints[index] = null;
		this.emit('End');
	};

	this.onInputOut = function (evt) {
		var index = 'p' + evt.id;
		this._dragPoints[index] = null;
		this.emit('End');
	};

	this.setDragMode = function (dragMode) {
		this._dragMode = dragMode;
	};
});