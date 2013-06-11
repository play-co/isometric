# Tile settings

All images within the isometric grid are defined in the `tileSettings` which is an option
for the constructor of the `Isometric` class.

The tiles are devided into groups. Within each `group` there are `index` values. The `index`
is based on the part of the tile which is filled. There are three types of groups with
different `index` values:

+ Lines which use 3x3 bits.
+ Areas which use 2x2 bits.
+ Items which can use an arbritrairy index value.

Data structure

The tile settings data structure is an array, each entry is a group and one entry can be used
the define the selection tiles used as a cursor.

### The cursor object:

 + `cursorYes {string}` ---Path to the cursor displayed if drawing is accepted.
 + `cursorNo {string}` ---Path to the cursor displayed if drawing is denied.

### A group object:

 + `group {number}` ---The group identifier.
 + `images {array}` ---An array of objects representing the images of the group with the following structure:
  + `index {number}` ---The index of the image
  + `url {string|array} ---The url or a list of urls.
  + `flipX {boolean}` ---Flip the image horizontal.
  + `flipY {boolean}` ---Flip the image vertical.
 + `x {numner}` ---Optional, the relative x-position of the image within the tile.
 + `y {number}` ---Optional, the relative y-position of the image within the tile.
 + `z {array}` ---Optional, first index is relative z-index in the tile, second is maximum layer z-index multiplied with this value.
 + `width {number}` ---The width of the image.
 + `height {number}` ---The height of the image.

### Tile z-index

Each tile image is assigned a z-index value ascending from the left top to the right bottom of the screen.
To control the depth sort you add a value to this default value. The z-index array of an image has two elements:
the relative z-index within a tile or the z-index of a layer.
If you have a layer which contains both moving objects and roads then you should increase the z-index values of
the items which are not flat on the ground by the maximum z value of a layer to ensure that all moving objects
are always rendered on top of the roads.

### Binairy operations

When items are drawn on the map an `or` operation is used. The `index` of represends the contents of the tile.
With an `or` operation it's easy to add tiles:

## 3x3 Bit index

The following table shows road tiles organized byte a 3x3 bit `index` value:

<table>
	<tr>
		<th>Image</th>
		<th>Decimal</th>
		<th>Binairy</th>
	</tr>
	<tr>
		<td><img src="doc/demoRoad16.png" width="45" height="36"/></td>
		<td>16</td>
		<td>00001000000</td>
	</tr>
	<tr>
		<td><img src="doc/demoRoad18.png" width="45" height="36"/></td>
		<td>18</td>
		<td>01001000000</td>
	</tr>
	<tr>
		<td><img src="doc/demoRoad24.png" width="45" height="36"/></td>
		<td>24</td>
		<td>00011000000</td>
	</tr>
	<tr>
		<td><img src="doc/demoRoad26.png" width="45" height="36"/></td>
		<td>26</td>
		<td>01011000000</td>
	</tr>
	<tr>
		<td><img src="doc/demoRoad48.png" width="45" height="36"/></td>
		<td>48</td>
		<td>00001100000</td>
	</tr>
	<tr>
		<td><img src="doc/demoRoad50.png" width="45" height="36"/></td>
		<td>50</td>
		<td>01001100000</td>
	</tr>
	<tr>
		<td><img src="doc/demoRoad56.png" width="45" height="36"/></td>
		<td>56</td>
		<td>00011100000</td>
	</tr>
	<tr>
		<td><img src="doc/demoRoad58.png" width="45" height="36"/></td>
		<td>58</td>
		<td>01011100000</td>
	</tr>
	<tr>
		<td><img src="doc/demoRoad144.png" width="45" height="36"/></td>
		<td>144</td>
		<td>00001001000</td>
	</tr>
	<tr>
		<td><img src="doc/demoRoad146.png" width="45" height="36"/></td>
		<td>146</td>
		<td>01001001000</td>
	</tr>
	<tr>
		<td><img src="doc/demoRoad152.png" width="45" height="36"/></td>
		<td>152</td>
		<td>00011001000</td>
	</tr>
	<tr>
		<td><img src="doc/demoRoad154.png" width="45" height="36"/></td>
		<td>154</td>
		<td>01011001000</td>
	</tr>
	<tr>
		<td><img src="doc/demoRoad176.png" width="45" height="36"/></td>
		<td>176</td>
		<td>00001101000</td>
	</tr>
	<tr>
		<td><img src="doc/demoRoad178.png" width="45" height="36"/></td>
		<td>178</td>
		<td>01001101000</td>
	</tr>
	<tr>
		<td><img src="doc/demoRoad184.png" width="45" height="36"/></td>
		<td>184</td>
		<td>00011101000</td>
	</tr>
	<tr>
		<td><img src="doc/demoRoad186.png" width="45" height="36"/></td>
		<td>186</td>
		<td>01011101000</td>
	</tr>
</table>

~~~
exports = [
	{
		group: 1,
		images: [
			{index: 16, url: 'resources/images/demoRoad16.png', blockEvents: true},
			{index: 18, url: 'resources/images/demoRoad18.png', blockEvents: true},
			{index: 24, url: 'resources/images/demoRoad24.png', blockEvents: true},
			{index: 26, url: 'resources/images/demoRoad26.png', blockEvents: true},
			{index: 48, url: 'resources/images/demoRoad48.png', blockEvents: true},
			{index: 50, url: 'resources/images/demoRoad50.png', blockEvents: true},
			{index: 56, url: 'resources/images/demoRoad56.png', blockEvents: true},
			{index: 58, url: 'resources/images/demoRoad58.png', blockEvents: true},
			{index: 144, url: 'resources/images/demoRoad144.png', blockEvents: true},
			{index: 146, url: 'resources/images/demoRoad146.png', blockEvents: true},
			{index: 152, url: 'resources/images/demoRoad152.png', blockEvents: true},
			{index: 154, url: 'resources/images/demoRoad154.png', blockEvents: true},
			{index: 176, url: 'resources/images/demoRoad176.png', blockEvents: true},
			{index: 178, url: 'resources/images/demoRoad178.png', blockEvents: true},
			{index: 184, url: 'resources/images/demoRoad184.png', blockEvents: true},
			{index: 186, url: 'resources/images/demoRoad186.png', blockEvents: true}
		],
		x: 0,
		y: 0,
		z: [0, 0],
		width: 150,
		height: 120
	},
]
~~~

## 2x2 Bit index

The following table shows road tiles organized byte a 2x2 bit `index` value:

<table>
	<tr>
		<th>Image</th>
		<th>Decimal</th>
		<th>Binairy</th>
	</tr>
	<tr>
		<td><img src="doc/demoGround0.png" width="45" height="36"/></td>
		<td>0</td>
		<td>0000</td>
	</tr>
	<tr>
		<td><img src="doc/demoGround1.png" width="45" height="36"/></td>
		<td>1</td>
		<td>0001</td>
	</tr>
	<tr>
		<td><img src="doc/demoGround2.png" width="45" height="36"/></td>
		<td>1</td>
		<td>0010</td>
	</tr>
	<tr>
		<td><img src="doc/demoGround3.png" width="45" height="36"/></td>
		<td>1</td>
		<td>0011</td>
	</tr>
	<tr>
		<td><img src="doc/demoGround4.png" width="45" height="36"/></td>
		<td>1</td>
		<td>0100</td>
	</tr>
	<tr>
		<td><img src="doc/demoGround5.png" width="45" height="36"/></td>
		<td>1</td>
		<td>0101</td>
	</tr>
	<tr>
		<td><img src="doc/demoGround6.png" width="45" height="36"/></td>
		<td>1</td>
		<td>0110</td>
	</tr>
	<tr>
		<td><img src="doc/demoGround7.png" width="45" height="36"/></td>
		<td>1</td>
		<td>0111</td>
	</tr>
	<tr>
		<td><img src="doc/demoGround8.png" width="45" height="36"/></td>
		<td>1</td>
		<td>1000</td>
	</tr>
	<tr>
		<td><img src="doc/demoGround9.png" width="45" height="36"/></td>
		<td>1</td>
		<td>1001</td>
	</tr>
	<tr>
		<td><img src="doc/demoGround10.png" width="45" height="36"/></td>
		<td>1</td>
		<td>1010</td>
	</tr>
	<tr>
		<td><img src="doc/demoGround11.png" width="45" height="36"/></td>
		<td>1</td>
		<td>1011</td>
	</tr>
	<tr>
		<td><img src="doc/demoGround12.png" width="45" height="36"/></td>
		<td>1</td>
		<td>1100</td>
	</tr>
	<tr>
		<td><img src="doc/demoGround13.png" width="45" height="36"/></td>
		<td>1</td>
		<td>1101</td>
	</tr>
	<tr>
		<td><img src="doc/demoGround14.png" width="45" height="36"/></td>
		<td>1</td>
		<td>1110</td>
	</tr>
	<tr>
		<td><img src="doc/demoGround15.png" width="45" height="36"/></td>
		<td>1</td>
		<td>1111</td>
	</tr>
</table>

~~~
exports = [
	{
		group: 1,
		images: [
			{index: 0, url: 'resources/images/demoGround0.png', blockEvents: true},
			{index: 1, url: 'resources/images/demoGround0.png', blockEvents: true},
			{index: 2, url: 'resources/images/demoGround0.png', blockEvents: true},
			{index: 3, url: 'resources/images/demoGround0.png', blockEvents: true},
			{index: 4, url: 'resources/images/demoGround0.png', blockEvents: true},
			{index: 5, url: 'resources/images/demoGround0.png', blockEvents: true},
			{index: 6, url: 'resources/images/demoGround0.png', blockEvents: true},
			{index: 7, url: 'resources/images/demoGround0.png', blockEvents: true},
			{index: 8, url: 'resources/images/demoGround0.png', blockEvents: true},
			{index: 9, url: 'resources/images/demoGround0.png', blockEvents: true},
			{index: 10, url: 'resources/images/demoGround0.png', blockEvents: true},
			{index: 11, url: 'resources/images/demoGround0.png', blockEvents: true},
			{index: 12, url: 'resources/images/demoGround0.png', blockEvents: true},
			{index: 13, url: 'resources/images/demoGround0.png', blockEvents: true},
			{index: 14, url: 'resources/images/demoGround0.png', blockEvents: true},
			{index: 15, url: 'resources/images/demoGround0.png', blockEvents: true}
		],
		x: 0,
		y: 0,
		z: [0, 0],
		width: 150,
		height: 120
	},
]
~~~