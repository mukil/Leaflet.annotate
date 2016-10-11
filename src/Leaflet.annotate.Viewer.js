
/**
 * The following custom Leaflet control is a friendly copy, based on the source code
 * by Rene Rubalcava who published it on his blog (http://odoe.net/blog/custom-leaflet-control/).
 */

var SCHEMA_ORG = "http://schema.org/"

// --- Client Side Model of all nodes annotated in the current DOM ---- //
var articleElements = []
var metaElements = []
var metadataElements = []
var annotatedElements = []
var typeCount = []

// --- Implementation of a Search and Navigation Control based on all annotated elements ---- //
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
        // this._buildAnnotatedElementsCache()
    },
    onAdd: function (map) {
        // happens after added to map
        var container = L.DomUtil.create('div', 'annotation-viewer search-container')
        this.a = L.DomUtil.create('a', 'leaflet-control-annotation-viewer')
        this.a.innerHTML = '<img src="css/readerView-Icon-decentblue-transparent.png" title="Launch Annotation Reader">'
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
                var topics = this._searchAnnotationsByName(value)
                this._renderResultItems(topics, this)
            }
        }
    },
    typeGroupSelected: function(e) {
        var topics = this._buildTypeSearchResults(e.target['data-type-uri'])
        this.results = document.querySelector('.list-group')
        this._renderResultItems(topics, this)
    },
    itemSelected: function(e) {
        L.DomEvent.preventDefault(e)
        // update our result list gui
        var elem = e.target
        var value = elem.innerHTML
        var leafletId = elem.getAttribute('data-result-list-id')
        var annotatedMapElements = Array.from(document.querySelectorAll('[data-internal-leaflet-id="'+leafletId+'"]'))
        var coordinateValuePairs = undefined
        this.input.value = elem.getAttribute('data-result-name')
        // search for geo coordinate pairs in our markup
        for (var ael in annotatedMapElements) {
            var metaElement = annotatedMapElements[ael]
            coordinateValuePairs = this._getCoordinatesOfFirstGeoChildProperty(metaElement)
            if (coordinateValuePairs) break
        }
        // focus elements if coordinate values were found
        if (!coordinateValuePairs || coordinateValuePairs.coordinates.length >= 3) {
            console.warn("Unsupported Coordinate Value Pair", coordinateValuePairs.coordinates,
                "currently just buonding box (2 values) or a Point (1 value) are supported")
        } else if (coordinateValuePairs.coordinates.length === 1) {
            var coords = coordinateValuePairs.coordinates[0]
            this._map.panTo(L.latLng(coords.lat, coords.lng))
        } else if (coordinateValuePairs.coordinates.length === 2) {
            var firstCoords = coordinateValuePairs.coordinates[0]
            var secondCoords = coordinateValuePairs.coordinates[1]
            var boundingBox = L.latLngBounds(firstCoords, secondCoords)
            this._map.fitBounds(boundingBox)
        }
        this._renderItemInfoFields(annotatedMapElements)
        // this.results.innerHTML = ''
    },
    submit: function(e) {
        console.log("Submitted Query", e)
        L.DomEvent.preventDefault(e)
    },
    _renderItemInfoFields: function(annotatedMapElements) {
        console.log("Show Metadata for Map Element", annotatedMapElements)
        var annotationViewerArea = document.querySelector('div.form-group')
        var details = document.querySelector('div.metadata-group')
        var listArea = document.querySelector('div.list-group')
        if (details == null && annotatedMapElements[0].childNodes.length > 0) {
            // show details ### refactor
            details = L.DomUtil.create('div', 'metadata-group', annotationViewerArea)
            var containerHeight = (window.innerHeight - 35)
            var listHeight = (containerHeight / 2)
            listArea.setAttribute("style", "height:" + (listHeight - 35) + "px")
            details.setAttribute("style", "height: " + listHeight + "px; min-height: " + listHeight + "px")
            L.DomEvent.addListener(details, 'wheel', function(e) {
                // and prevent map from scroll-zooming
                console.log("WheelScroll", e)
                L.DomEvent.preventDefault(e)
                L.DomEvent.stopPropagation(e)
            })
            L.DomEvent.addListener(details, 'drag', function(e) {
                // and prevent map from scroll-zooming
                L.DomEvent.preventDefault(e)
                L.DomEvent.stopPropagation(e)
            })
        }
        details.innerHTML = ""
        var datasourceUrl = undefined
        var itemType = annotatedMapElements[0].getAttribute("itemtype")
        if (itemType) {
            var itemLabel = itemType.substr(SCHEMA_ORG.length)
            var typeField = this._createSpanInfoField('Type', itemLabel)
            details.appendChild(typeField)
            details.appendChild(document.createElement("br"))
        }
        for (var cidx in annotatedMapElements[0].childNodes) {
            var annotation = annotatedMapElements[0].childNodes[cidx]
            if (annotation.attributes && annotation.attributes.hasOwnProperty('content')) {
                var keyName = annotation.getAttribute("name")
                var keyPropertyName = annotation.getAttribute("itemprop")
                var value = annotation.getAttribute("content")
                var field = undefined
                if (keyName === "http://purl.org/dc/terms/created") {
                    field = this._createSpanInfoField('Created', new Date(value))
                } else if (keyName === "http://purl.org/dc/terms/modified") {
                    field = this._createSpanInfoField('Modified', new Date(value))
                } else if (keyName === "http://purl.org/dc/elements/1.1/date") {
                    field = this._createSpanInfoField('Published', new Date(value))
                } else if (keyName === "http://purl.org/dc/elements/1.1/creator") {
                    field = this._createSpanInfoField('Creator', value)
                } else if (keyName === "http://purl.org/dc/elements/1.1/contributor") {
                    field = this._createSpanInfoField('Contributor', value)
                } else if (keyName === "http://purl.org/dc/elements/1.1/publisher") {
                    field = this._createSpanInfoField('Publisher', value)
                } else if (keyName === "http://purl.org/dc/elements/1.1/rights") {
                    field = this._createSpanInfoField('Usage Rights', value)
                } else if (keyName === "http://purl.org/dc/elements/1.1/source") {
                    field = this._createSpanInfoField('Source', value)
                // ### image, sameAs, alternateName
                } else if (keyPropertyName === "url") {
                    datasourceUrl = value
                } else if (keyPropertyName === "description") {
                    field = this._createSpanInfoField(undefined, '<p>' + value + '</p>')
                }
                //
                if (field) {
                    details.appendChild(field)
                    details.appendChild(document.createElement("br"))
                }
            }
        }
        if (datasourceUrl) {
            field = document.createElement("a")
            field.text = "Browse Source"
            field.setAttribute("href", datasourceUrl)
            field.setAttribute("class", "metadata-field datasource")
            field.setAttribute("title", "Visit the source of information for this web map element")
            details.appendChild(field)
        }
    },
    _createSpanInfoField: function(label, value) {
        field = document.createElement("div")
        field.setAttribute("class", "metadata-field")
        if (label) {
            var labelElement = document.createElement("span")
                labelElement.setAttribute("class", "header")
                labelElement.innerHTML = label
            field.appendChild(labelElement)
        }
        var valueElement = document.createElement("span")
            valueElement.setAttribute("class", "value")
            valueElement.innerHTML = value
        field.appendChild(valueElement)
        return field
    },
    _renderResultItems: function(topics, context) {
        var containerHeight = (window.innerHeight - 35)
        var listHeight = (containerHeight - 35)
        var details = document.querySelector('div.metadata-group')
        if (details != null) {
            listHeight = listHeight - (containerHeight / 2)
        }
        context.containerRef.setAttribute("style", "height:" + containerHeight + "px")
        context.results.setAttribute("style", "height:" + listHeight + "px")
        context.results.innerHTML = ''
        // write out list header
        if (topics.length > 0) {
            var firstResult = topics[0]
            if (firstResult.type) {
                context.results.innerHTML = '<span class="header">'+ topics.length + 'x ' + firstResult.type+'</span>'
            } else {
                context.results.innerHTML = '<span class="header">'+ topics.length + ' items found</span>'
            }
        }
        // write out list elements
        for (var r in topics) {
            var topic = topics[r]
            var a = L.DomUtil.create('a', 'list-group-item')
            a.href = ''
            a.title = 'Focus \"' + topic.name + '\" (' +  topic.leafletId +') in map'
            a.setAttribute('data-result-parent-item-type', topic.type)
            a.setAttribute('data-result-name', topic.name)
            a.setAttribute('data-result-list-id', topic.leafletId)
            a.innerHTML = topic.name //  + ' (' + results[r].type + ')'
            context.results.appendChild(a)
            L.DomEvent.addListener(a, 'click', context.itemSelected, context)
            L.DomEvent.disableClickPropagation(a)
        }
        // prevening map interactions on scrollwheel on annotation viewers result list
        L.DomEvent.addListener(context.results, 'wheel', function(e) {
            if (e.target.className.indexOf("list-group-item") != -1) { // Scroll list element manually
                e.target.parentNode.scrollTop += e.deltaY
            }
            // and prevent map from scroll-zooming
            L.DomEvent.preventDefault(e)
            L.DomEvent.stopPropagation(e)
        }, context)
    },
    _toggleAnnotationViewer: function(context, container) {
        if (container.children.length === 1) {
            // re-build model of annotations
            context._buildAnnotatedElementsCache()
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
            }
            context.form = L.DomUtil.create('form', 'form', container)
            var group = L.DomUtil.create('div', 'form-group', context.form)
            context.input = L.DomUtil.create('input', 'form-control input-sm', group)
            context.input.type = 'text'
            context.input.placeholder = context.options.placeholder
            context.input.focus()
            context.results = L.DomUtil.create('div', 'list-group', group)
            context.containerRef = container
            L.DomUtil.addClass(container, 'selected')
            L.DomEvent.addListener(context.input, 'keyup', context.keyup, context)
            L.DomEvent.addListener(context.form, 'submit', context.submit, context)
        } else {
            container.children[0].innerHTML = '<img src="css/readerView-Icon-decentblue-transparent.png" title="Launch Annotation Reader">'
            var childElements = Array.from(container.children)
            for (var c in childElements) {
                if (childElements[c].localName === "form" || childElements[c].className.indexOf('type-group-item') != -1) {
                    container.removeChild(childElements[c])
                }
            }
            L.DomUtil.removeClass(container, 'selected')
        }
    },
    _buildAnnotatedElementsCache: function() {
        // converts NodeList to Array
        articleElements = Array.from(document.querySelectorAll('article'))
        metaElements = Array.from(document.querySelectorAll('meta'))
        metadataElements = Array.from(document.querySelectorAll('metadata'))
        typeCount = []
        // unify annotated elements
        for (var el in articleElements) {
            var articleType = articleElements[el].getAttribute('itemtype')
            // ### just count unique elements
            annotatedElements.push(articleElements[el])
            this._countTypeInstances(articleType)
        }
        for (var l in metadataElements) {
            var metadataType = metadataElements[l].getAttribute('itemtype')
            // ### just count unique elements
            annotatedElements.push(metadataElements[l])
            this._countTypeInstances(metadataType)
        }
        console.log("Repopulating Annotated Elements Cache, Found", metaElements.length, "annotations over",
            (articleElements.length + metadataElements.length), "elements overall (", articleElements.length,
                "article and", metadataElements.length, "metadata elements)")
    },
    _countTypeInstances: function(typeName) {
        if (typeCount[typeName] === undefined){
            typeCount[typeName] = { "count": 1 }
        } else {
            typeCount[typeName] = { "count": typeCount[typeName].count + 1 }
        }
    },
    _buildTypeSearchResults: function(typeUri) {
        var results = []
        var typedElements = Array.from(document.querySelectorAll('[itemtype="'+typeUri+'"]'))
        for (var t in typedElements) {
            var elementAnnotations = Array.from(typedElements[t].children)
            var topic = { "name" : "No name given", "type": typeUri.slice(SCHEMA_ORG.length),
                "node": typedElements[t], "leafletId": typedElements[t].getAttribute("data-internal-leaflet-id")}
            for (var l in elementAnnotations) {
                var metaElement = elementAnnotations[l]
                var metaPropValue = metaElement.getAttribute("itemprop")
                var metaPropName = metaElement.getAttribute("name")
                // console.log("Meta Prop Name", metaPropValue)
                if (metaElement.attributes.hasOwnProperty('content')) {
                    var content = metaElement.getAttribute("content")
                    if (metaPropValue === "name" && content.length > 0) {
                        topic.name = content
                    } else if (metaPropValue === "sameAs") {
                        topic.sameAs = content
                    } else if (metaPropValue === "url") {
                        topic.url = content
                    } else if (metaPropValue === "identifier") {
                        // #### topic.identifier
                    }
                }
            }
            this._addToResults(results, topic)
        }
        return results
    },
    _getCoordinatesOfFirstGeoChildProperty: function(metaElement) {
        var elementAnnotations = Array.from(metaElement.children)
        for (var el in elementAnnotations) {
            var childElement = elementAnnotations[el]
            var metaPropValue = childElement.getAttribute("itemprop")
            var topic = {}
            if (metaPropValue === "geo" || metaPropValue === "location" || metaPropValue === "birthPlace" || metaPropValue === "deathPlace"
                || metaPropValue === "contentLocation" || metaPropValue === "locationCreated" || metaPropValue === "homeLocation" || metaPropValue === "workLocation") {
                topic.property = metaPropValue
                topic.coordinates = this._parseGeoCoordinateValuePairs(childElement)
                return topic
            }
        }
    },
    /** Parses the various geo coordinates values from a semantic marked up ("geo" item) */
    _parseGeoCoordinateValuePairs: function(metaElement) {
        var itemType = metaElement.getAttribute("itemtype")
        var values = []
        if (itemType === "http://schema.org/GeoCoordinates") {
            values = Array.from(metaElement.children)
        } else if (itemType === "http://schema.org/Place") {
            values = Array.from(metaElement.children[0].children) // ## do we wanna start guessing?
        } else {
            console.warn("Focussing Geo Shape values or other itemtypes than Place and GeoCoordinates - NOT YET IMPLEMENTED")
        }
        // Parse and collect the Geo Coordinate Pair (from children with itemprop="longitude", and itemprop="latitude")
        var coordinates = []
        var coordPair = {}
        for (var g in values) {
            var node = values[g]
            var metaPropValue = node.getAttribute("itemprop")
            if (metaPropValue === "latitude") {
                coordPair.lat = node.getAttribute("content")
            } else if (metaPropValue === "longitude") {
                coordPair.lng = node.getAttribute("content")
            }
        }
        if (coordPair.hasOwnProperty("lat") && coordPair.hasOwnProperty("lng")) {
            coordinates.push(coordPair)
            return coordinates
        }
        // Parse and collect all Bounding Box Coordinates (from all children with itemprop="box")
        for (var g in values) {
            var node = values[g]
            var metaPropValue = node.getAttribute("itemprop")
            if (metaPropValue === "box") {
                var boundingBoxValue = node.getAttribute("content")
                var southEast = boundingBoxValue.split(" ")[0]
                var northWest = boundingBoxValue.split(" ")[1]
                coordinates.push({"lat": southEast.split(",")[0], "lng" : southEast.split(",")[1]})
                coordinates.push({"lat": northWest.split(",")[0], "lng" : northWest.split(",")[1]})
            }
        }
        return coordinates
    },
    _searchAnnotationsByName: function(query) {
        var results = []
        for (var l in metaElements) {
            var meta = metaElements[l]
            var metaPropValue = meta.getAttribute("itemprop")
            var metaName = meta.getAttribute("name")
            if (metaPropValue === "name" || metaPropValue === "description" || metaName === "http://purl.org/dc/elements/1.1/creator") {
                var content = meta.getAttribute("content")
                if (content.toLowerCase().indexOf(query.toLowerCase()) != -1) {
                    meta.type = meta.parentNode.getAttribute("itemtype").slice(SCHEMA_ORG.length)
                    meta.name = content
                    // ### use URL, sameAs and identifier for building up unique resultsets
                    meta.leafletId = meta.parentNode.getAttribute("data-internal-leaflet-id")
                }
            }
            this._addToResults(results, meta)
        }
        return results
    },
    // ### TODO: getAnnotatedURLValue, getAnnotatedSameAsValue, getAnnotatedIdentifierValue
    _addToResults: function(resultset, item) {
        // add just if leafletId, identifier, sameAs or urls do not match
        for (var r in resultset) {
            var result = resultset[r]
            if (result.leafletId === item.leafletId) return
            if (result.hasOwnProperty("url") && item.hasOwnProperty("url")) {
                if (result["url"] === item["url"]) return
            }
            if (result.hasOwnProperty("identifier") && item.hasOwnProperty("identifier")) {
                if (result["identifier"] === item["identifier"]) return
            }
            if (result.hasOwnProperty("sameAs") && item.hasOwnProperty("sameAs")) {
                if (result["sameAs"] === item["sameAs"]) return
            }
        }
        // console.log("Adding", item, "to resultset", resultset)
        resultset.push(item)
    }
})

L.control.annotationViewer = function(id, options) {
  return new L.Control.AnnotationViewer(id, options);
}
