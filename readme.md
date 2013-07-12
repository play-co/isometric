# Isometric engine

The isometric engine allows you to use 'fake 3d'. It renders diamond shaped tiles.

## Configuration

The isometric engine has has a lot of features which can be configured through a number of setting options
passed to the constructor of the `Isometric` class.

## Examples

 + [Map: a grid with random areas on it](https://github.com/gameclosure/examples/tree/master/src/isometric/map)
 + [Selecting: selecting points, lines or areas](https://github.com/gameclosure/examples/tree/master/src/isometric/selecting)
 + [Drawing: drawing lines on the grid](https://github.com/gameclosure/examples/tree/master/src/isometric/drawing)
 + [Drawing rules: rules for drawing lines on the grid](https://github.com/gameclosure/examples/tree/master/src/isometric/rules)
 + [Items: putting items on the grid](https://github.com/gameclosure/examples/tree/master/src/isometric/items)
 + [Item selecting: Selecting an item](https://github.com/gameclosure/examples/tree/master/src/isometric/itemselecting)
 + [Path finding: Finding a path with aStar](https://github.com/gameclosure/examples/tree/master/src/isometric/pathfinding)
 + [Save, load: Saving and loading a map](https://github.com/gameclosure/examples/tree/master/src/isometric/saveload)
 + [Walking: Items walking random paths](https://github.com/gameclosure/examples/tree/master/src/isometric/walking)
 + [Particles: Particle systems](https://github.com/gameclosure/examples/tree/master/src/isometric/particle)
 + [Item images: Setting images on dynamic items](https://github.com/gameclosure/examples/tree/master/src/isometric/itemimages)

### Tile conditions

A lot of items test the validity of a move or a draw action, all these checkes are done by the `Map` class.
Details about the condition validator can be found [here](doc/conditions.md).

### Isometric Class

The isometric class wraps the models and views of the isometric engine. It exposes a number of methods and 
emit events informing the user about state changed.

More details about settings can be found here:
 + [Grid settings, defining the size of the grid, the size of the tiles and the layers](doc/gridSettings.md)
 + [Map settings, tile rules, map generating and tile randomization](doc/mapSettings.md)
 + [Tile settings, configuring the images](doc/tileSettings.md)
 + [Editor settings, properties defining tools for modifying the grid, links models to tiles](doc/editorSettings.md)
 + [Item settings, view properties for dynamic items on the grid](doc/itemSettings.md)
 + [Particle settings, settings for particle systems on the grid](doc/particleSettings.md)

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

var isometric = new Isometric({
	superview: this,
	gridSettings: gridSettings,
	tileSettings: tileSettings,
	mapSettings: mapSettings
}).
	generate().
	show();
~~~

#### Methods

__getGridModel()__

Get the `GridModel` instance.

Returns
 {GridModel} ---`GridModel` instance.

__getStaticModels()__

Get the `StaticModels` instance wich contains a list of all models on the grid with a fixed position.

Returns
 {StaticModels} ---`StaticModels` instance.

__getDynamicModels()__

Get the `ModelViewConnection` instance which contains a list of dynamic models.

Returns
 {ModelViewConnector} ---`ModelViewConnector` instance.

__getMap()__

Get the `Map` instance.

Returns
 {Map} ---`Map` instance.

__setBackgroundColor(backgroundColor)__

Set the background color of the grid view, is only visible through tiles which contain transparent parts.

Parameters
 + `backgroundColor {string}` ---Set the background color.

__setTool(tool)__

Set the tool, if the tool parameter is false then the grid is put into drag mode if it's a string
then the value should match one of the keys in the `editorSettings`.

Parameters
 + `tool {string|boolean}` ---Set the tool.

__clear(dontGenerate)__

Clear the map.

Parameters
 + `dontGenerate {boolean} = false` ---Don't generate a new map.

__putItem(modelType, tileX, tileY, opts)__

Put a new static item on the map.

Parameters
 + `modelType {string}` ---This value should match one of the keys in the `editorSettings`.
 + `tileX {number}` ---The x-position.
 + `tileY {number}` ---The y-position.
 + `opts {object}` ---Constructor opts for the new item.

__putDynamicItem(ctor, opts, layer)__

Put a new dynamic item on the map.

Parameters
 + `ctor {DynamicModel}` ---A constructor which subclasses `DynamicModel`.
 + `opts {object}` ---Constructor options, should contain the following properties:
  + `tileX {number} = 0` ---The x-position.
  + `tileY {number} = 0` ---The y-position.
  + `x {number} = 0.5` ---The x-position within the tile.
  + `y {number} = 0.5` ---The y-position within the tile.
 + `layer {number}` ---The layer to put the model on

__refreshMap(tileX, tileY)__

Refresh the screen.

Parameters
 + `tileX {number}` ---Optional, the x-position, if not provided then the entire view will be refreshed.
 + `tileY {number}` ---The y-position.

__show()__

Show the isometic view.

__hide()__

Hide the isometric view.

__hideSelectedItem()__

Hide the selected item.

__generate()__

Start generating a new map, clears the map first.
The map is generated based on settings in `mapSettings`.

__toJSON()__

Get a JSON object representing the current state of the map.
This does not include dynamic items.
The data has the following structure:

 + `grid {object}` ---The current position of the viewport:
  + `tileX {number}` ---The x-position.
  + `tileY {number}` ---The y-position.
  + `x {number}` ---The x-position within the tile.
  + `y {number}` ---The y-position within the tile.
 + `map {object}` ---The map data.
 + `staticModels {array}` ---A list of all static models on the map.

Returns
 {object} ---JSON representing the current state.

__fromJSON(data)__

Load a map, see __toJSON()__ for the structure.

Parameters
 + `data {object}` ---The previously serialized map.

#### Events

__'Ready', callback()__

Called when the map is generated.

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

__'InputEnd', callback(evt)__

Published when mouse up, touch up or drag end.

__'SelectItem', callback(model)__

Called when an item is selected.

Parameters
 + `model {StaticModel}` ---An instance of a `StaticModel` subclass.

__'UnselectItem', callback()__

Called when an item was selected and that selection is hidden by clicking somewhere on the grid which is not an item.

__'AddStaticModel', callback(model)__

Called when a static model was added to the map.

Parameters
 + `model {StaticModel}` ---An instance of `StaticModel` which was added.

__'AddDynamicModel', callback(model, layer)__

Called when a dynamic model was added to the map.

Parameters
 + `model {DynamicModel}` ---An instance of `DynamicModel` which was added.
 + `layer {number}` --- The layer to put the DynamicModel on

__'WakeupDynamicModel', callback(model)__

Called when a model is activated, the tick function will be called again and when
the model is visible a view is connected again.

Parameters
 + `model {DynamicModel}` ---An instance of `DynamicModel` which was activated again.

__'SleepDynamicModel', callback(model)__

Called when a model is deactivated, the model instance still exists but there's no
view linked and the tick function is no longer called.

Parameters
 + `model {DynamicModel}` ---An instance of `DynamicModel` which is deactivated.
