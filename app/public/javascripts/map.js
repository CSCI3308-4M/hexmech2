﻿var map = {};

/**
* authors Matt, Mackenzie, Michael, Max
* 
**/

map.settings = function (width, height)
{
    this._width = width;
    this._height = height;
    this._tiles = []; // of map.tile

    //functions
    this.getTileAt = map.getTileAt;
}

/**
* consturctor function for each of the tiles
* @param {x} the x position of the tile
* @param {y} the y position of the tile
**/

map.tile = function(x, y)
{
    // where is it - so the tile knows its own position
    this._x = x;
    this._y = y;

    // stuff about this tile
    this._resource = null;
    this._settlement = null;
    this._minerals = {};
    this._agriculture = {};

    // functions
    this.getLocation = map.getLocation;
    this.click = map.tileClick;
    this.draw = map.drawTile;
    this.toCube = map.toCube;
    this.getNeighbours = map.getNeighbours;
}

map.getTileAt = function (x, y)
{
    for (var i = 0; i < this._tiles.length; i++)
    {
        if (this._tiles[i]._x == x && this._tiles[i]._y == y)
            return this._tiles[i];
    }
}

map.toCube = function ()
{
    var x = this._x;
    var y = this._y;
    var z = -x-y
    return { x: x, y: y, z: z };
}
//commenting out this code since we dont need an html dialouge
/*map.tileClick = function ()
{
    var id = Math.random().toString().substring(3);

    var html = "<div title='You clicked' id='" + id + "' >"
             + "id: " + id + "<br />"
             + "resource: " + (this._resource || "") + "<br />"
             + "settlement: " + (this._settlement || "") + "<br />"
             + "</div>";

    $(html).dialog(
    {
        modal: true,
        close: function () { $(this).empty().remove(); },
        buttons: { "Close": function () { $(this).dialog("close"); } }
    });
}*/

/**
* Function to draw a tile at a given location
* @param {cartography} includes the cartography information to be used in the function
**/
map.drawTile = function (cartography)
{
    var hexTopLeft = this.getLocation(cartography);

    cartography.drawHexagon(hexTopLeft.x, hexTopLeft.y, this._resource._colour, 1);

    if(this._resource)
        cartography.drawSprite(hexTopLeft.x, hexTopLeft.y, this._resource.getSprite());
    if (this._settlement)
        cartography.drawSprite(hexTopLeft.x, hexTopLeft.y, this._settlement.getSprite());
}

/**
* Function to get the current location of the the hexagon
* @param {cartography} includes the cartography information to be used in the function
**/
map.getLocation = function (cartography)
{
    var hexTopLeft = {
        x: this._x * cartography._hexRectangleWidth + ((this._y % 2) * cartography._hexRadius),
        y: this._y * (cartography._sideLength + cartography._hexHeight)
    };
    return hexTopLeft;
}
