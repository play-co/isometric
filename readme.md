# Isometric engine

The isometric engine allows you to use 'fake 3d'. It renders diamond shaped tiles.

## Configuration

The isometric engine has has a lot of features which can be configured through a number of setting options
passed to the constructor of the `Isometric` class.

### Isometric Class

The isometric class wraps the models and views of the isometric engine. It exposes a number of methods and 
emit events informing the user about state changed.

More details about settings can be found here:
 + [Grid settings, defining the size of the grid, the size of the tiles and the layers](doc/grid.md)
 + [Map settings, tile rules, map generating and tile randomization](doc/map.md)
 + [Tile settings, configuring the images](doc/tiles.md)
 + [Editor settings, properties defining tools for modifying the grid, links models to tiles](doc/editor.md)
 + [Item settings, view properties for dynamic items on the grid](doc/items.md)
 + [Particle settings, settings for particle systems on the grid](doc/particles.md)

#### Tile rules

A lot of items test the validity of a move or a draw action, all these checkes are done by the `Map` class.
Details about the condition validator can be found [here](conditions.md).

Parameters
 + `superview {View}` ---The view which contains the isometric view.
 + `gridSettings {object}` ---General grid settings like width, height and number of layers.
 + `tileSettings {object}` ---Definitions for tile images.
 + `mapSettings {object} = {}` ---Optional, definitions to generate a map, random images, tile rules.
 + `editorSettings {object} = {}` ---Optional, tools for modifying the grid.
 + `itemSettings {object} = {}` ---Optional, view properties for items on the grid.
 + `particleSettings {object} = {}` ---Optional, settings for particle systems on teh grid.

~~~
import isometric.Isometric as Isometric;

this._isometric = new Isometric({
	superview: this,
	gridSettings: gridSettings,
	tileSettings: tileSettings,
	mapSettings: mapSettings
}).
	generate().
	show();
~~~
