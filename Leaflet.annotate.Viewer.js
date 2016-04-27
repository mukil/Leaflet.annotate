
/**
The following custom control is a friendly copy, based on the source code by Rene Rubalcava who published it on his blog.
URL: http://odoe.net/blog/custom-leaflet-control/
*/

/** The client side model where we keep all queried metadata annotations found in the current document.*/
var articleElements = []
var metaElements = []
var metadataElements = []
var annotatedElements = []

L.Control.AnnotationViewer = L.Control.extend({
    options: {
        // topright, topleft, bottomleft, bottomright
        position: 'topright',
        placeholder: 'Search...'
    },
    initialize: function (options /*{ data: {...}  }*/) {
        // constructor
        L.Util.setOptions(this, options)
        // converts NodeList to Array
        articleElements = Array.prototype.slice.call(document.querySelectorAll('article'))
        metaElements = Array.prototype.slice.call(document.querySelectorAll('meta'))
        metadataElements = Array.prototype.slice.call(document.querySelectorAll('metadata'))
        // build up client side model of annotated elements
        this._buildElementTypes()
    },
    _buildElementTypes: function() {
        // unify annotated elements
        for (var el in articleElements) {
            if (typeof articleElements[el] === "object") { // Iterating NodeList
                var articleType = articleElements[el].getAttribute('itemtype')
                console.log("   AnnotationViewer identified element of type \"", articleType.slice(SCHEMA_ORG.length) + "\"")
                annotatedElements.push(articleElements[el])
            }
        }
        for (var l in metadataElements) {
            if (typeof metadataElements[l] === "object") { // Iterating NodeList
                var metadataType = metadataElements[l].getAttribute('itemtype')
                console.log("   AnnotationViewer identified element of type \"", metadataType.slice(SCHEMA_ORG.length) + "\"")
                annotatedElements.push(metadataElements[l])
            }
        }
        console.log("AnnotationViewer Found", metaElements.length, "annotations over",
            (articleElements.length + metadataElements.length), "elements overall (", articleElements.length,
                "article and", metadataElements.length, "metadata elements)")
    },
    onAdd: function (map) {
        // happens after added to map
        var container = L.DomUtil.create('div', 'annotation-viewer search-container')
        this.form = L.DomUtil.create('form', 'form', container)
        var group = L.DomUtil.create('div', 'form-group', this.form)
        this.input = L.DomUtil.create('input', 'form-control input-sm', group)
        this.input.type = 'text'
        this.input.placeholder = this.options.placeholder
        this.results = L.DomUtil.create('div', 'list-group', group)
        L.DomEvent.addListener(this.input, 'keyup', function() {
            console.log("Searching", this.input.value)
        }, this)
        L.DomEvent.addListener(this.form, 'submit', this.submit, this)
        L.DomEvent.disableClickPropagation(container)
        return container
    },
    onRemove: function (map) {
        // when removed
        L.DomEvent.removeListener(this._input, 'keyup', this.keyup, this)
        L.DomEvent.removeListener(form, 'submit', this.submit, this)
    },
    keyup: function(e) {
        if (e.keyCode === 38 || e.keyCode === 40) {
            // do nothing
        } else {
            this.results.innerHTML = ''
            if (this.input.value.length > 2) {
                var value = this.input.value
                var results = _.take(_.filter(this.options.data, function(x) {
                  return x.feature.properties.park.toUpperCase().indexOf(value.toUpperCase()) > -1
                }).sort(sortParks), 10)
                _.map(results, function(x) {
                  var a = L.DomUtil.create('a', 'list-group-item')
                  a.href = ''
                  a.setAttribute('data-result-name', x.feature.properties.park)
                  a.innerHTML = x.feature.properties.park
                  this.results.appendChild(a)
                  L.DomEvent.addListener(a, 'click', this.itemSelected, this)
                  return a
                }, this)
            }
        }
    },
    itemSelected: function(e) {
        L.DomEvent.preventDefault(e)
        var elem = e.target
        var value = elem.innerHTML
        this.input.value = elem.getAttribute('data-result-name')
        var feature = _.find(this.options.data, function(x) {
            return x.feature.properties.park === this.input.value
        }, this)
        if (feature) {
            this._map.fitBounds(feature.getBounds())
        }
        this.results.innerHTML = ''
    },
    submit: function(e) {
        console.log("Submitted Query", e)
        L.DomEvent.preventDefault(e)
    }
})

L.control.annotationViewer = function(id, options) {
  return new L.Control.AnnotationViewer(id, options);
}

/**
From here on the code is (nearly) completely outdated but parts of it may become
useful again if we want to inspects all Leaflet objects (and not only our annotations)
making up the current map on display.
*/

L.readerPlugin = function(mapObject, options) {
    return new ReaderPlugin(mapObject, options)
}

/**
 *  This reads out the leaflet 0.7.x API
 *  and (yet) depends on the existence of jQuery 2.1.4.
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
    // console.log("    Bounds, NE", map.getBounds()._northEast, " SW", map.getBounds()._southWest)
    // console.log("    Coordinate Reference System:", map.options.crs.code)
    results.push({ "key": "Overall Bounds", "value": map.getBounds()})
    results.push({ "key": "Coordinate System", "value": map.options.crs.code})
    map.eachLayer(function(layer) {
        if (layer.hasOwnProperty("_tiles")) {
            results.push({ "key": "Basemap Provider", "value": layer.options.attribution })
            results.push({ "key": "Basemap URL", "value": layer._url })
        } else {
            console.log("   Layer", layer._url, " by ", layer.options.attribution)
            results.push({ "key": "Overlay URL", "value": layer._url })
        }
    })
    show_what(results)
}

function lookup_when(map) {
    console.log("Looking up WHEN", map.options)
}
