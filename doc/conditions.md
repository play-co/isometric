Back to [isometric documentation](../readme.md).

# Conditions

A lot of operations on the grid are done conditionally. All conditions are validated by the `Map` class.
Conditions have two parts, both are optional: `accept` and `decline`.

The `accept` and `decline` parts of a condition are lists, each entry is a condition with parameters.
If one entry in the `accept` list evaluates as true then the condition is accepted, if a one entry of the
`decline` part failes then the condition is false. So for a condition to pass at least one `accept` entry
has to be true and none of the `decline` entries have to be true.

Every condition entry in `accept` or `decline` also allows a custon validator function which is called for
each tile which is tested.

## Validator function parameters

 + `map {Map}` ---An instance of the `Map` class.
 + `tileX {number}` ---The x-tile which is tested.
 + `tileY {number}` ---The y-tile which is tested.
 + `x {number}` ---The x-position of the area on which the validation is performed.
 + `y {number}` ---The y-position of the area on which the validation is performed.
 + `w {number}` ---The width of the area on which the validation is performed.
 + `h {number}` ---The height of the area on which the validation is performed.

If one of the standard conditions for a tile which is being checked in the `accept` or `decline` list failes 
then the custom validator can still pass it.

### Data structure

 + `accept {array}` ---A list of conditions, at least one has to pass.
 + `decline {array}` ---A list of conditions, if one failed then the check failes.

~~~
	condition: {
		accept: [
			{layer: 0, type: 'emptyOrZero'},
			{layer: 0, type: 'group', groups: [1], validator: validatorFuncion}
		],
		decline: [
			{layer: 1, type: 'notEmptyAndNotGroup', groups: [2, 3]}
		]
	}
~~~

There are 4 different condition types:

## Empty or zero

Check if a layer is empty or 0. This checks all `index` values in a given area.

### Data structure

 + `type {string} = 'emptyOrZero'` ---Set to 'emptyOrZero'.
 + `layer {number}` ---The layer which is checked.
 + `validator {function (map, tileX, tileY, x, y, w, h)}` ---Optional, a validator function to call for each tile.

## Group

Check if all tiles a in a give list of groups.

### Data structure

 + `type {string} = 'group'` ---Set to 'group'.
 + `layer {number}` ---The layer which is checked.
 + `groups {array}` ---A list of numbers, the groups to check for.
 + `validator {function (map, tileX, tileY, x, y, w, h)}` ---Optional, a validator function to call for each tile.

## Not empty and not group

Check if all tiles are not empty and not in a given group list.

### Data structure

 + `type {string} = 'notEmptyAndNotGroup'` ---Set to 'notEmptyAndNotGroup'.
 + `layer {number}` ---The layer which is checked.
 + `groups {array}` ---A list of numbers, the groups to check for.
 + `validator {function (map, tileX, tileY, x, y, w, h)}` ---Optional, a validator function to call for each tile.

## Not empty

Check if one of tiles is filled.

### Data structure

 + `type {string} = 'notEmpty'` ---Set to 'notEmpty'.
 + `layer {number}` ---The layer which is checked.
 + `validator {function (map, tileX, tileY, x, y, w, h)}` ---Optional, a validator function to call for each tile.

Back to [isometric documentation](../readme.md).