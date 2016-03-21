
/** Extend Leaflets ILayer Interface about metadata for each asset */

/** L.ILayer.include({
    // ### http://schema.org/CreativeWork, e.g. Authors, Contributors or http://schema.org/Thing
    "setName": function(titleText) {                       // OpenLayers 3 Feature

    },
    "setAbout": function(subjectMatterHTML) {              // Thing, schema.org

    },
    "setIdentifier": function(uriUrnId) {                  // OpenLayers 3 Feature

    }
    "setAttribution": function(attributionHTML) {          // publisher?

    },
    "setDateCreated": function(createdAtTimestamp) {

    },
    "setDateLastModified": function(modifiedAtTimestamp) { // revision?

    },
    "setCoordinateReferenceSystemId": function(crsCode) {  // implicit?

    },
    "setSource": function(sourceEntity) {                  // OpenLayers 3

    },
    "setReadMoreHref": function(readMoreURL) {             // heplful but necessary?

    }
}) **/


L.readerPlugin = function(mapObject, options) {
	return new ReaderPlugin(mapObject, options)
}

/**
 *	This reads out the leaflet 0.7.x API
 *	and (yet) depends on the existence of jQuery 2.1.4.
 **/
function ReaderPlugin(mapObject, options) {	
	// Setup Plugin
	var map = mapObject
	// Re-Use DOM Element
	var containerElement = map.getContainer()
	// ### Introduce Toggle Button for Displaying Reading Panel
	// ### Display Reading panel
	show_reading_panel(containerElement, map)
	return {}
}

function show_reading_panel(container, map) {
    // Panel
    var $top = $('<div>')
        $top.addClass('inspection-panel')
    // Who
    var $who = $('<div>')
        $who.addClass('who')
    var $btn1 = $('<a>').on('click', lookup_who).text("Who contributed to this map?").addClass('button')
        $who.append($btn1)
    // What
    var $what = $('<div>')
        $what.addClass('what')
    var $btn2 = $('<a>').on('click', function(e) { lookup_what(map) }).text("What is on this map?").addClass('button')
        $what.append($btn2)
    // When
    var $when = $('<div>')
        $when.addClass('when')
    var $btn3 = $('<a>').on('click', function(e) { lookup_when(map) }).text("When is this map?").addClass('button')
        $when.append($btn3)
    // Inspect
    var $tiles = $('<div>')
        $tiles.addClass("tiles")
    var $tilesBtn = $('<a>').on('click', transform_tiles).text("Inspect Tiles").addClass('button')
        $tiles.append($tilesBtn)
    // 
    $top.append($who).append($what).append($when).append($tiles)
    $(container).append($top)
    // $(get_map_container()).attr('height', $('#map').height() - 125)
    console.log("Map Height", $(container).height(), "Inspection Panel Height", $top.height())
}

function show_who(results) {
    var $who = $('div.who')
    $('ul', 'div.who').remove()
    var $list = $('<ul>')
    for (el in results) {
        var $li = $('<li>').html('<b>' + results[el].key + ':</b> ' + results[el].value)
        $list.append($li)
    }
    $who.append($list)
}

function show_what(results) {
    var $who = $('div.what')
    $('ul', 'div.what').remove()
    var $list = $('<ul>')
    for (el in results) {
    	if (results[el].key.toLowerCase().includes("url")) {
    		var $li = $('<li>').html('<b>' + results[el].key + ':</b> <a href="' + results[el].value + '">'+results[el].value+'</a>')
    	} else {
    		var $li = $('<li>').html('<b>' + results[el].key + ':</b> ' + results[el].value)
    	}
        $list.append($li)
    }
    $who.append($list)
}

/** Checks the DOM for Author information **/
function lookup_who() {
    console.log("Looking up WHO ...")
    // 1) HTML Document Author
    var results = []
    var documentAuthorDOM = document.querySelector('[name="author"]')
    var documentAuthorValue = ""
    if (documentAuthorDOM && isNotEmpty(documentAuthorDOM.getAttribute("content"))) {
        documentAuthorValue = documentAuthorDOM.getAttribute("content")
        console.log("HTML Author:", documentAuthorValue)
        results.push({"key": "Document Author", "value" : documentAuthorValue})
    }
    // 2) HTML Article Attribution
    var articleAuthorDOM = document.querySelector('.author', '.credits', '.byline')
    var articleAuthorValue = ""
    if (articleAuthorDOM && isNotEmpty(articleAuthorDOM.textContent)) {
        articleAuthorValue = articleAuthorDOM.textContent
        console.log("Article Author:", articleAuthorValue)
        results.push({"key": "Article Author", "value" : articleAuthorValue})
    }
    // 3) Leaflet Map Attribution
    var mapAuthorDOM = document.querySelector('.leaflet-control-attribution')
    var mapAuthorValue = ""
    if (mapAuthorDOM && isNotEmpty(mapAuthorDOM.innerHTML)) {
        mapAuthorValue = mapAuthorDOM.innerHTML
        console.log("Map Author:", mapAuthorValue)
        results.push({"key": "Basemap Authors", "value" : mapAuthorValue})
    }
    show_who(results)
}

function transform_tiles() {
    var $tiles = $('.leaflet-layer .leaflet-tile-container img')
    console.log("Transform Tiles", $tiles)
    for (var t=0; t < $tiles.length; t++) {
        var styleValue = $($tiles[t]).attr("style")
        var transformationValue = $($tiles[t]).attr("transform")
        var transformValueStart = styleValue.indexOf("transform: ");
        var transformValueEnd = styleValue.indexOf(";", transformValueStart)
        var beforeValue = styleValue.slice(0, transformValueStart)
        var afterValue = styleValue.slice(transformValueStart+11, transformValueEnd)
        var myValue = "rotate3d(90, 15, 16, 45deg) " // skewX(30deg) skewY(15deg)
        // console.log("Tile Transform Value:", afterValue)
        $($tiles[t]).attr("style", "" + beforeValue + " transform: " + myValue +  afterValue + ";")
    }
}

function isNotEmpty(stringValue) {
    return (stringValue !== "") ? true : false
}

/** Inspects alls Leaflet Layers for basic information */
function lookup_what(map) {
	// Iterate over all existing Layer
	console.log("Looking up WHAT", map)
	var results = []
	// console.log("	Bounds, NE", map.getBounds()._northEast, " SW", map.getBounds()._southWest)
	// console.log("	Coordinate Reference System:", map.options.crs.code)	
	results.push({ "key": "Overall Bounds", "value": map.getBounds()})
	results.push({ "key": "Coordinate System", "value": map.options.crs.code})
	map.eachLayer(function(layer) {
		if (layer.hasOwnProperty("_tiles")) {
			results.push({ "key": "Basemap Provider", "value": layer.options.attribution })
			results.push({ "key": "Basemap URL", "value": layer._url })
		} else {
			console.log("	Layer", layer._url, " by ", layer.options.attribution)
			results.push({ "key": "Overlay URL", "value": layer._url })
		}
		
	})
    show_what(results)
}

function lookup_when(map) {
    console.log("Looking up WHEN", map.options)
}
