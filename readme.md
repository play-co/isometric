# Isometric engine

The isometric engine allows you to use 'fake 3d'. It renders diamond shaped tiles.

## Configuration

The isometric engine has has a lot of features which can be configured through a number of setting options
passed to the constructor of the `Isometric` class.

### Tile conditions

A lot of items test the validity of a move or a draw action, all these checkes are done by the `Map` class.
Details about the condition validator can be found [here](conditions.md).

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

Events

__'Ready', callback()__

__'SelectionCount', callback(selected)__

The `SelectionCount` event is emitted while the user is selecting an eara and the size of the area changes.
If the area is accepted (the editor condition evaluates to true) then the parameter contains info about the
selection.

The data structure of the `selected` value if the area is accepted is an object with the following properties:
 + `total {number}` ---The total number of tile affected.
 + `changed {number}` ---The number of tiles which will be changed if the selection is applied.
 + `accept {boolean} = true` ---By setting this value to false the cursor will change to the `deny` state and the action will not be applied to the grid.

Parameters
 + `selected {boolean|object}` ---False or selection info.

__'Edit', callback(selected)__

This event is emitted when an area on the grid was selected and changed.

The data structure of the `selected` value has the following properties:
 + `total {number}` ---The total number of tile affected.
 + `changed {number}` ---The number of tiles which will be changed if the selection is applied.
 + `rect {object}` ---An object representing the selected rectangle with the following properties:
  + `x {number}` ---The x-position.
  + `y {number}` ---The y-position.
  + `w {number}` ---The width.
  + `h {number}` ---The height.

__'Scrolled', callback()__

Called when `tileX` or `tileY` changes.

__'InputStart', callback(evt)__

Called when the grid view is clicked or touched.

__'InputSelect', callback(evt)__

Called when the click or touch is released.

__'SelectItem', callback(model)__

Called when an item is selected.

Parameters
 + `model {StaticModel}` ---A subclass instance of `StaticModel`.

__'UnselectItem', callback()__

Called when an item was selected and that selection is hidden by clicking somewhere on the grid which is not an item.