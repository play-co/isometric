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

exports = Class(View, function (supr) {
	this.init = function (opts) {
		opts.blockEvents = false;

		supr(this, 'init', [opts]);

		this._gridView = opts.gridView;
		this._gridView.setGridInputView(this);

		this._downIndexStart = -1;
		this._downIndex = -1;

		this._dragMode = true;
		this._dragPointFirst = null;
		this._dragPoints = {};
		this._dragPointIndex = [];
		this._dragInitialDistance = null;
		this._dragInitialScale = null;

		this._rectsOnScreen = [];
		this._rectsOnScreenCount = 0;
		this._selectedRect = null;

		this._lastScale = null;

		this._startCB = null;
		this._dragCB = null;
		this._endCB = null;
		this._selectCB = null;
	};

	this._hideSelection = function () {
		var selectedItem = this._gridView.getSelectedItem();
		if (selectedItem.style.visible) {
			this._gridView.emit('UnselectItem');
			this._selectedRect = null;
			selectedItem.style.visible = false;
		}
	};

	this.onInputStartDragMode = function (evt) {
		var found = false;
		var scale = GC.app.scale * this._gridView.getScale();
		var mouseX = evt.srcPoint.x / scale - this._gridView.getX();
		var mouseY = evt.srcPoint.y / scale - this._gridView.getY();
		var rectsOnScreen = this._rectsOnScreen;
		var i = this._rectsOnScreenCount;

		while (i) {
			var rectOnScreen = rectsOnScreen[--i];
			if ((mouseX > rectOnScreen.x1) && (mouseY > rectOnScreen.y1) &&
				(mouseX < rectOnScreen.x2) && (mouseY < rectOnScreen.y2) &&
				(!found || (rectOnScreen.z > found.z))) {
				found = rectOnScreen;
			}
		}

		var selectedItem = this._gridView.getSelectedItem();
		if (found) {
			this._selectedRect = found;
			selectedItem.setRect(found);
			selectedItem.style.zIndex = found.view.style.zIndex - 1;
			this.emit('SelectItem', found.model);
			evt.cancel();
		} else if (selectedItem.style.visible) {
			this.emit('UnselectItem');
			this._selectedRect = null;
			selectedItem.style.visible = false;
		}
	};

	this.onDragStart = function (evt) {
		var point = {x: evt.srcPoint.x, y: evt.srcPoint.y};
		var index = 'p' + evt.id;

		this._dragPoints[index] = point;

		if (this.getDragPointCount() === 1) {
			this._dragPointFirst = index;
			if (this._dragMode) {
				this.onInputStartDragMode(evt);
			} else {
				this._hideSelection();

				var scale = GC.app.scale * this._gridView.getScale();
				this._startCB && this._startCB({x: point.x / scale, y: point.y / scale});
			}
		} else {
			var selectedItem = this._gridView.getSelectedItem();
			if (selectedItem.style.visible) {
				this.emit('UnselectItem');
				this._selectedRect = null;
				selectedItem.style.visible = false;
			}
			this._dragPointSecond = index;
		}

		this._dragInitialDistance = null;
	};

	this.onInputStart = function (evt) {
		this.startDrag();
		this.onDragStart(evt);
		this.onDrag(evt, evt);
	};

	this.onDragStop = function (evt) {
		var index = 'p' + evt.id;
		this._dragPoints[index] = null;
		this._endCB && this._endCB();
		this.emit('EndDrag', evt);
	};

	this.onDrag = function (evt, mouseEvt) {
		if (this.inSelection(evt)) {
			this._dragPoints[this._dragPointFirst] = null;
			return;
		}
		if (!this._dragPoints[this._dragPointFirst]) {
			return;
		} 

		var x = this._dragPoints[this._dragPointFirst].x;
		var y = this._dragPoints[this._dragPointFirst].y;
		var scale = GC.app.scale * this._gridView.getScale();
		var index = 'p' + evt.id;
		var point = this._dragPoints[index];

		point.x = mouseEvt.srcPoint.x;
		point.y = mouseEvt.srcPoint.y;

		this._hideSelection();

		if (index === this._dragPointFirst) {
			this._dragPoints[index].x = point.x;
			this._dragPoints[index].y = point.y;
		}

		if (this.getDragPointCount() === 2) {
			var p1 = this._dragPoints[this._dragPointFirst];
			var p2 = this._dragPoints[this._dragPointSecond];
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
				this._dragCB && this._dragCB((x - point.x) / scale, (y - point.y) / scale);
			}
		} else {
			this._selectCB && this._selectCB({x: point.x / scale, y: point.y / scale});
		}
	};

	this.onInputSelect = function (evt) {
		var index = 'p' + evt.id;
		this._dragPoints[index] = null;
		this._endCB && this._endCB();
	};

	this.onInputOut = function (evt) {
		var index = 'p' + evt.id;
		this._dragPoints[index] = null;
		this._endCB && this._endCB();
	};

	this.inSelection = function (evt) {
		var selectedRect = this._selectedRect;

		if (selectedRect) {
			var scale = GC.app.scale;
			var mouseX = evt.srcPoint.x / scale - this._gridView.getX();
			var mouseY = evt.srcPoint.y / scale - this._gridView.getY();
			if ((mouseX > selectedRect.x1) && (mouseY > selectedRect.y1) && (mouseX < selectedRect.x2) && (mouseY < selectedRect.y2)) {
				evt.cancel();
				return true;
			}
		}

		return false;
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

	this.setDragMode = function (dragMode) {
		if (!dragMode) {
			this._selectedRect = null;
		}
		this._dragMode = dragMode;
	};

	this.resetRects = function () {
		this._rectsOnScreenCount = 0;
	};

	this.clearSelectedRect = function () {
		var result = this._selectedRect;
		this._selectedRect = null;
		return result;
	};

	this.addRect = function (model, tileView, clickRect, updateRect) {
		if (model.canSelect && !model.canSelect()) {
			return;
		}

		var rectsOnScreen = this._rectsOnScreen;
		var rectOnScreen;
		var found = false;

		if (updateRect) {
			var i = this._rectsOnScreenCount;
			while (i) {
				rectOnScreen = rectsOnScreen[--i];
				if (rectOnScreen.view === tileView) {
					found = true;
					break;
				}
			}
		}

		if (!found) {
			rectOnScreen = rectsOnScreen[this._rectsOnScreenCount];
			if (!rectOnScreen) {
				rectOnScreen = {};
				rectsOnScreen[this._rectsOnScreenCount] = rectOnScreen;
			}			
			this._rectsOnScreenCount++;
		}

		var style = tileView.style;
		var x = style.x + clickRect.x;
		var y = style.y + clickRect.y;

		rectOnScreen.view = tileView;
		rectOnScreen.x = x;
		rectOnScreen.y = y;
		rectOnScreen.z = style.zIndex;
		rectOnScreen.width = clickRect.width;
		rectOnScreen.height = clickRect.height;
		rectOnScreen.x1 = x;
		rectOnScreen.y1 = y;
		rectOnScreen.x2 = x + clickRect.width;
		rectOnScreen.y2 = y + clickRect.height;
		rectOnScreen.model = model;

		if (this._selectedRect && (this._selectedRect.view === tileView)) {
			this._selectedRect = rectOnScreen;
			this.emit('UpdateSelection', rectOnScreen);
		}
	};

	this.setStartCB = function (startCB) {
		this._startCB = startCB;
	};

	this.setDragCB = function (dragCB) {
		this._dragCB = dragCB;
	};

	this.setEndCB = function (endCB) {
		this._endCB = endCB;
	};

	this.setSelectCB = function (selectCB) {
		this._selectCB = selectCB;
	};
});