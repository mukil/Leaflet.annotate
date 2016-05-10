
/**
The following custom Leaflet control is a friendly copy, based on the source code by Rene Rubalcava who published it on his blog.
URL: http://odoe.net/blog/custom-leaflet-control/
*/

/** The client side model where we keep all queried metadata annotations found in the current document.*/
var articleElements = []
var metaElements = []
var metadataElements = []
var annotatedElements = []
var typeCount = []

L.Control.AnnotationViewer = L.Control.extend({
    options: {
        // topright, topleft, bottomleft, bottomright
        position: 'topright',
        placeholder: 'Search...'
    },
    initialize: function (options /*{ data: {...}  }*/) {
        // constructor
        L.Util.setOptions(this, options)
        // build up client side model of annotated elements
        // this._buildElementTypes()
    },
    onAdd: function (map) {
        // happens after added to map
        var container = L.DomUtil.create('div', 'annotation-viewer search-container')
        this.a = L.DomUtil.create('a', 'leaflet-control-annotation-viewer')
        this.a.innerHTML = '<img src="readerView-Icon-decentblue-transparent.png" title="Launch Annotation Reader">'
        var renderAnnotationViewer = this._toggleAnnotationViewer
        var _context = this
        this.a.onclick = function(e) {
            renderAnnotationViewer(_context, container)
        }
        container.appendChild(this.a)
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
            if (this.input.value.length > 2) {
                var value = this.input.value
                var topics = this._findAnnotationsByName(value)
                this._renderResultItems(topics, this)
            }
        }
    },
    typeGroupSelected: function(e) {
        var topics = this._buildElementTypeInstances(e.target['data-type-uri'])
        this.results = document.querySelector('.list-group')
        this._renderResultItems(topics, this)
    },
    itemSelected: function(e) {
        L.DomEvent.preventDefault(e)
        var elem = e.target
        var value = elem.innerHTML
        var leafletId = elem.getAttribute('data-result-leaflet-id')
        var leafletElement = document.querySelector('[data-internal-leaflet-id="' + leafletId + '"]')
        this.input.value = elem.getAttribute('data-result-name')
        var coordinateValuePair = elem.getAttribute('data-geo-coordinates')
        // ### focus map to geo-coordinate value
        console.log("Annotated element selected:", leafletElement, "Focus", coordinateValuePair, this)
        if (typeof coordinateValuePair !== "undefined") {
            var lat = parseFloat(coordinateValuePair.split(":")[0])
            var lng = parseFloat(coordinateValuePair.split(":")[1])
            this._map.setView(L.latLng(lat, lng))
            if (this._map.getZoom() <= 7) {
                this._map.setZoom(this._map.getZoom() + 2)
            }
        }
        /** var feature =
        if (feature) this._map.fitBounds(feature.getBounds())*/
        this.results.innerHTML = ''
    },
    submit: function(e) {
        console.log("Submitted Query", e)
        L.DomEvent.preventDefault(e)
    },
    _renderResultItems: function(results, context) {
        this.results.innerHTML = ''
        if (results.length > 0) {
            var firstResult = results[0]
            this.results.innerHTML = '<span class="header">'+ results.length + 'x ' + firstResult.type+'</span>'
        }
        for (var r in results) {
            // console.log("Render Result List Item for Map Element", results[r].node, results[r]  )
            var a = L.DomUtil.create('a', 'list-group-item')
            a.href = ''
            a.title = 'Show \"' + results[r].name + '\" in map'
            a.setAttribute('data-result-parent-item-type', results[r].type)
            a.setAttribute('data-result-name', results[r].name)
            a.setAttribute('data-result-leaflet-id', results[r].leafletId)
            if (results[r].hasOwnProperty("center") && typeof results[r].center !== "undefined") {
                a.setAttribute('data-geo-coordinates', "" + results[r].center.lat + ":" + results[r].center.lng + "")
            }
            a.innerHTML = results[r].name //  + ' (' + results[r].type + ')'
            context.results.appendChild(a)
            L.DomEvent.addListener(a, 'click', context.itemSelected, context)
            L.DomEvent.disableClickPropagation(a)
            return a
        }
    },
    _toggleAnnotationViewer: function(context, container) {
        if (container.children.length === 1) {
            // re-build model of annotations
            context._buildElementTypes()
            // render annotation list dialog
            container.children[0].innerHTML = "X"
            for (var t in typeCount) {
                var typeName = t.slice(SCHEMA_ORG.length)
                var a = L.DomUtil.create('a', 'type-group-item')
                    a.href = '#' + typeName
                    a['data-type-uri'] = t
                    a.title = 'Show all items of type \"' + typeName + '\"'
                    a.innerHTML = typeCount[t].count
                container.appendChild(a)
                L.DomEvent.addListener(a, 'click', context.typeGroupSelected, context)
                L.DomEvent.disableClickPropagation(a)
                // return a
            }
            context.form = L.DomUtil.create('form', 'form', container)
            var group = L.DomUtil.create('div', 'form-group', context.form)
            context.input = L.DomUtil.create('input', 'form-control input-sm', group)
            context.input.type = 'text'
            context.input.placeholder = context.options.placeholder
            context.results = L.DomUtil.create('div', 'list-group', group)
            L.DomUtil.addClass(container, 'selected')
            L.DomEvent.addListener(context.input, 'keyup', context.keyup, context)
            L.DomEvent.addListener(context.form, 'submit', context.submit, context)
            L.DomEvent.disableClickPropagation(container)
        } else {
            container.children[0].innerHTML = '<img src="readerView-Icon-decentblue-transparent.png" title="Launch Annotation Reader">'
            var childElements = Array.from(container.children)
            for (var c in childElements) {
                console.log("AnnotationViewer Dialog Children", childElements[c])
                if (childElements[c].localName === "form" || childElements[c].className.indexOf('type-group-item') != -1) {
                    container.removeChild(childElements[c])
                }
            }
            L.DomUtil.removeClass(container, 'selected')
        }
    },
    _buildElementTypes: function() {
        // converts NodeList to Array
        articleElements = Array.from(document.querySelectorAll('article'))
        metaElements = Array.from(document.querySelectorAll('meta'))
        metadataElements = Array.from(document.querySelectorAll('metadata'))
        typeCount = []
        // unify annotated elements
        for (var el in articleElements) {
            var articleType = articleElements[el].getAttribute('itemtype')
            console.log("   AnnotationViewer identified element of type \"" + articleType.slice(SCHEMA_ORG.length) + "\"")
            annotatedElements.push(articleElements[el])
            this._countItemType(articleType)
        }
        for (var l in metadataElements) {
            var metadataType = metadataElements[l].getAttribute('itemtype')
            console.log("   AnnotationViewer identified element of type \"" + metadataType.slice(SCHEMA_ORG.length) + "\"")
            annotatedElements.push(metadataElements[l])
            this._countItemType(metadataType)
        }
        console.log("AnnotationViewer Found", metaElements.length, "annotations over",
            (articleElements.length + metadataElements.length), "elements overall (", articleElements.length,
                "article and", metadataElements.length, "metadata elements)")
    },
    _countItemType: function(typeName) {
        if (typeCount[typeName] === undefined){
            typeCount[typeName] = { "count": 1 }
        } else {
            typeCount[typeName] = { "count": typeCount[typeName].count + 1 }
        }
    },
    _buildElementTypeInstances: function(typeUri) {
        console.log("Fetching all instances in document of itemtype=" + typeUri)
        var results = []
        var typedElements = Array.from(document.querySelectorAll('[itemtype="'+typeUri+'"]'))
        for (var t in typedElements) {
            var elementAnnotations = Array.from(typedElements[t].children)
            var topic = { "name" : "Unknown", "type": typeUri.slice(SCHEMA_ORG.length),
                "node": typedElements[t], "leafletId": typedElements[t].getAttribute("data-internal-leaflet-id")}
            for (var l in elementAnnotations) {
                var metaProp = elementAnnotations[l].getAttribute("itemprop")
                // console.log("Meta Prop Name", metaProp)
                if (elementAnnotations[l].attributes.hasOwnProperty('content')) {
                    var content = elementAnnotations[l].getAttribute("content")
                    if (metaProp === "name") {
                        topic.name = content
                    } else if (metaProp === "http://purl.org/dc/terms/created") {
                        topic.created = new Date(content)
                    } else if (metaProp === "http://purl.org/dc/terms/modified") {
                        topic.modified = new Date(content)
                    } else if (metaProp === "http://purl.org/dc/terms/creator") {
                        topic.creator = content
                    } else if (metaProp === "http://purl.org/dc/terms/publisher") {
                        topic.publisher = content
                    } else if (metaProp === "description") {
                        topic.description = content
                    } else if (metaProp === "sameAs") {
                        topic.sameAs = content
                    } else if (metaProp === "url") {
                        topic.url = content
                    }
                    // ### TODO: Map the rest of our fifteen metadata terms
                } else if (metaProp === "geo" || metaProp === "location" || metaProp === "birthPlace" || metaProp === "deathPlace"
                    || metaProp === "contentLocation" || metaProp === "locationCreated" || metaProp === "homeLocation" || metaProp === "workLocation") {
                    topic.geoProp = metaProp
                    topic.center = this._getGeoCoordinates(elementAnnotations[l])
                    // console.log(" Item Located At ", topic.location)
                }
            }
            results.push(topic)
        }
        return results
    },
    _getGeoCoordinates: function(metaElement) {
        console.log("Fetching Coordinates, Geographic Reference Values", metaElement)
        var itemType = metaElement.getAttribute("itemtype")
        var values = []
        if (itemType === "http://schema.org/GeoCoordinates") {
            values = Array.from(metaElement.children)
        } else if (itemType === "http://schema.org/Place") {
            values = Array.from(metaElement.children[0].children)
        } else {
            console.warn("Focussing Geo Shape values or other itemtypes than Place and GeoCoordinates - NOT YET IMPLEMENTED")
            return undefined
        }
        var coordinates = {}
        for (var g in values) {
            var node = values[g]
            if (node.getAttribute("itemprop") === "latitude") {
                coordinates.lat = node.getAttribute("content")
            } else if (node.getAttribute("itemprop") === "longitude") {
                coordinates.lng = node.getAttribute("content")
            }
        }
        return coordinates
    },
    _findAnnotationsByName: function(query) {
        var results = []
        for (var l in metaElements) {
            var meta = metaElements[l]
            var metaProp = metaElements[l].getAttribute("itemprop")
            if (metaProp === "name") {
                var content = metaElements[l].getAttribute("content").toLowerCase()
                if (content.indexOf(query.toLowerCase()) != -1) {
                    meta.type = metaElements[l].parentNode.getAttribute("itemtype").slice(SCHEMA_ORG.length)
                    meta.name = metaElements[l].getAttribute("content")
                    results.push(meta)
                }
            }
        }
        return results
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
