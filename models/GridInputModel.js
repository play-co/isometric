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

exports = Class(Emitter, function (supr) {
	this.init = function (opts) {
		supr(this, 'init', arguments);

		this._gridModel = opts.gridModel;
		this._startPoint = null;
	};

	this.onStart = function (index, point) {
		this._startPoint = this._gridModel.pointToGrid(point);
		this._gridModel.setSelection(this._startPoint, this._startPoint);
	};

	this.onSelect = function (index, point) {
		var startPoint = this._startPoint;

		this._gridModel.setSelection(startPoint, this._gridModel.pointToGrid(point));
	};

	this.onSelectCancel = function () {
		this._gridModel.clearSelection();
	};

	this.onEnd = function (index) {
		var selection = this._gridModel.getSelection();
		selection && selection.accept && this.emit('Selection', selection);

		this._gridModel.clearSelection();
		this._sideIndex = -1;
		this._startPoint = null;
	};

	this.onDrag = function (x, y) {
		var gridModel = this._gridModel;
		(x < 0) ? gridModel.scrollLeft(-x) : gridModel.scrollRight(x);
		(y < 0) ? gridModel.scrollUp(-y) : gridModel.scrollDown(y);
	};
});