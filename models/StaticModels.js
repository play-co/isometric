import event.Emitter as Emitter;

exports = Class(Emitter, function (supr) {
	this.init = function (opts) {
		supr(this, 'init', arguments);

		this._gridModel = opts.gridModel;
		this._list = [];
	};

	this.findStaticModelByGroup = function (group, x, y, exclude) {
		var result = null;
		var map = this._gridModel.getMap();
		var mapWidth = map.getWidth() - 1;
		var mapHeight = map.getHeight() - 1;
		var min = Math.min;
		var max = Math.max;
		var minDistance = 9999999999;
		var list = this._list;
		var i = list.length;

		while (i) {
			var staticModel = list[--i];
			if ((staticModel !== exclude) && (staticModel.getGroup() === group)) {
				var modelX = staticModel.getX();
				var modelY = staticModel.getY();
				var minX = min(x, modelX);
				var maxX = max(x, modelX);
				var minY = min(y, modelY);
				var maxY = max(y, modelY);
				var deltaX = min(mapWidth - maxX + minX, maxX - minX);
				var deltaY = min(mapHeight - maxY + minY, maxY - minY);
				var manhattan = deltaX + deltaY;

				if (manhattan < minDistance) {
					minDistance = manhattan;
					result = staticModel;
				}
			}
		}

		return result;
	};

	this.add = function (staticModel) {
		this._list.push(staticModel);
	};

	this.tick = function (dt) {
		var list = this._list;
		var i = list.length;
		while (i) {
			list[--i].tick(dt);
		}
	};
});