import ui.resource.Image as Image;

exports = Class(function () {
	this.init = function (opts) {
		this._images = {};

		var prefix = opts.prefix;
		var images = opts.images;

		for (var i = 0; i < images.length; i++) {
			var image = images[i];
			var index = image.index;
			var url = image.url;

			if (isArray(url)) {
				var list = [];
				for (var j = 0; j < url.length; j++) {
					list.push(new Image({url: url[j]}));
				}
				this._images[index] = list;
			} else if (url) {
				this._images[index] = new Image({url: url});
			} else {
				this._images[index] = null;
			}

			if (this._images[index]) {
				this._images[index].blockEvents = !!image.blockEvents;
				this._images[index].flipX = !!image.flipX;
				this._images[index].flipY = !!image.flipY;
			}
		}

		this._defaultImage = opts.defaultImage ? new Image({url: opts.defaultImage}) : false;
	};

	this.setImage = function (tileView, tile) {
		var image = this._images[tile.index];
		if (image) {
			if (isArray(image)) {
				if (image[tile.randomIndex]) {
					tileView.setImage(image[tile.randomIndex]);
				}
			} else {
				tileView.setImage(image);
			}
			tileView.style.flipX = image.flipX;
			tileView.style.flipY = image.flipY;
			tileView.__input.blockEvents = image.blockEvents;
		} else {
			tileView.style.visible = false;			
		}
	};
});