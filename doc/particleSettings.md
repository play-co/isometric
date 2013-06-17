Back to [isometric documentation](../readme.md).
# Particles settings

Documentation for the `ParticleSystem` class which is used in the isometric engine can
be found [here](https://github.com/gameclosure/shooter/tree/master/particle).

# Particles from static items

A model placed on the grid should subclass `StaticModel`.
From the tick function of the model the `addParticles` method on `_gridModel` can be called.

~~~
	this.tick = function (dt) {
		this._particleDT -= dt;
		if (this._particleDT < 0) {
			this._particleDT = 150 + Math.random() * 150;
			this._gridModel.addParticles('fire', this._tileX, this._tileY, 0, -65);
		}

		return supr(this, 'tick', arguments);
	};
~~~

# Particles from dynamic items

A dynamic model should subclass `DynamicModel`. The model has a private object `_opts`.
In the `_opts` instance there's a particles array property. Particles can be initialized
by adding record to this array.
Every tick this array is checked by the superclass and if there are entries in the list
the particles will be created. Setting the particles array length to 0 stops partcles from
being emitted.

~~~
	if (Math.random() < 0.1) {
		opts.particles = [{type: this._calloutType, x: 0, y: 0}];
	} else {
		opts.particles.length = 0;
	}
~~~
