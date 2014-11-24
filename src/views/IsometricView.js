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
import device;

import ui.View as View;

import menus.views.components.ButtonView as ButtonView;

import .GridView as GridView;
import .GridInputView as GridInputView;

import .LoadingView;

exports = Class(View, function (supr) {
	this.init = function (opts) {
		opts = merge(
			opts,
			{
				x: 0,
				y: 0,
				width: ('baseWidth' in GC.app) ? GC.app.baseWidth : device.width,
				height: ('baseHeight' in GC.app) ? GC.app.baseHeight : device.height
			}
		);
		supr(this, 'init', [opts]);

		this._gridView = new GridView(this._createOpts(opts)).
			on('Populated', bind(this, 'onPopulated')).
			on('ChangeOffset', bind(this, 'ChangeOffset'));

		var loadingViewCtor = opts.loadingViewCtor || LoadingView;
		this._loadingView = new loadingViewCtor(this._createOpts(opts));
		this._gridInputView = new GridInputView(merge(this._createOpts(opts), {gridView: this._gridView}));

		this._gridView.style.zIndex = 0;
		this._loadingView.style.zIndex = 1;
		this._gridInputView.style.zIndex = 2;

		this._changeOffsetCB = null;
	};

	this._createOpts = function (opts) {
		return {
			superview: this,
			x: 0,
			y: 0,
			width: this.style.width,
			height: this.style.height,
			gridSettings: opts.gridSettings,
			itemSettings: opts.itemSettings || {},
			tileSettings: opts.tileSettings,
			particleSettings: opts.particleSettings || {},
			visible: false
		};
	};

	this.getGridView = function () {
		return this._gridView;
	};

	this.getGridInputView = function () {
		return this._gridInputView;
	};

	this.setProgress = function (progress) {
		this._loadingView.setProgress(progress);
	};

	this.onPopulated = function () {
		this._loadingView.style.visible = false;
	};

	this.startLoading = function () {
		this._loadingView.start();
		this._gridView.style.visible = false;
		this._gridView.onRefreshMap();
	};

	this.show = function () {
		this._gridInputView.style.visible = true;
		this._gridView.style.visible = true;
	};

	this.hide = function () {
		this._gridInputView.style.visible = false;
		this._gridView.style.visible = false;
	};
});