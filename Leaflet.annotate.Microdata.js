
// --- Implementation for building annnotations in Microdata Syntax

var SCHEMA_ORG = "http://schema.org/"

var Microdata = {
    /**
     * This is called via the "addInitHook" leaflet provides us, for each Leaflet item we translate.
     * This either annotates an element directly when it is added to the map or listens to the
     * event signifying us that Leaflet has completed the buildup of its DOM representation for the geodata.
     */
    annotate: function() {
        var target = this._getTargetDOMElement()
        // 1) Check if Leaflet already created the corresponding DOM Element
        if (!target) {
            // 1.1) Register listeners for when this is done
            this.on('add', function() { // Marker
                target = this._getTargetDOMElement()
                this._buildAnnotations(target)
            })
            this.on('open', function() { // Opening Popup
                target = this._getTargetDOMElement()
                this._buildAnnotations(target)
            })
            this.on('load', function(e) { // Image Overlay Element Available
                target = this._getTargetDOMElement()
                this._buildAnnotations(target)
            })
            this.on('close', function() { // Closing Popup
                var previousContainer = []
                this._findPopupContainerElement(this, previousContainer)
                this._container = previousContainer[0]
            })
        } else {
            // 1.2) Build annotations for all items we already know the DOM element
            this._buildAnnotations(target)
        }
        return this
    },
    _findPopupContainerElement: function(element, result) {
        var childNodes = element._container.childNodes
        for (var el in childNodes) {
            var element = childNodes[el]
            if (element.className.contains('leaflet-popup')) return element
        }
    },
    _findContainerElements: function(element, results) {
        if (element._container) {
            results.push(element._container)
        }
        if (element._layers) {
            for (var el in element._layers) {
                var layer = element._layers[el]
                this._findContainerElements(layer, results)
            }
        }
    },
    _findSVGGroupElements: function(element, results) {
        if (element._container) {
            if (element._container.localName === "g") results.push(element)
        }
        if (element._layers) {
            for (var el in element._layers) {
                var layer = element._layers[el]
                this._findSVGGroupElements(layer, results)
            }
        }
    },
    _buildPolygonArray: function(wgsCoordinates) {
        var array = []
        for (var l in wgsCoordinates) {
            array.push(wgsCoordinates[l]['lat'])
            array.push(wgsCoordinates[l]['lng'])
        }
        return array
    },
    _createMetaElement: function(key, value) {
        var el = document.createElement('meta')
            el.setAttribute(key, value)
        return el
    },
    _createContainerElement: function(key, value) {
        var el = document.createElement('div')
            el.setAttribute(key, value)
        return el
    },
    _buildAnnotations: function(targets) {

        if (Object.prototype.toString.call(targets) !== '[object Array]') {
            targets = [targets]
        }

        // Useful for debugging when adding support for new items, such as L.ImageOverlay here
        // if (this.hasOwnProperty("_image")) {
            // console.log("Bulding Image Overlay Annotations Parent", parentElement, "Has Lat/Lng Pair", hasLatLngValuePair, "Has Bounding Box", hasBoundingBox)
        // }

        var metadata = undefined
        var domObject = targets[0]
        var parentElement = domObject.parentNode
        var geoPropertyName = (this.options.hasOwnProperty('geoprop')) ? this.options.geoprop : "geo"
        var domId = (this.options.hasOwnProperty('domId')) ? this.options.domId : undefined
        var targetIsSVGGroup = (domObject.tagName === 'g') ? true : false
        var hasLatLngValuePair = this.hasOwnProperty('_latlng')
        var hasBoundingBox = this.hasOwnProperty('_bounds')
        var hasLayers = this.hasOwnProperty('_layers')
        var leafletId = this['_leaflet_id']

        if (!targetIsSVGGroup && this.options.hasOwnProperty('itemtype')) {
            // 1) Renders "Marker", "Popup" (Point Style) and "Image Overlay" (Bounding Box Style) Annotations into an ARTICLE and append the original element

            metadata = document.createElement('article')
            if (domId) metadata.setAttribute('id', domId)
            metadata.setAttribute('itemscope','')
            metadata.setAttribute('itemtype', 'http://schema.org/' + this.options.itemtype)
            metadata.setAttribute('data-internal-leaflet-id', leafletId)
            this._buildGenericProperties(metadata, this)
            // 1.1) Allow our graphic indicator values to be either representing a schema.org "GeoCoordinate" or a "Geo Shape" -> "box"
            var place = undefined
            if (hasLatLngValuePair && !hasBoundingBox) {
                place = this._buildGeoAnnotation("div", this, "point", geoPropertyName)
            } else if (hasBoundingBox) {
                place = this._buildGeoAnnotation("div", this, "box", geoPropertyName)
            } else {
                console.warn("Invalid argument provided: Neither a BoundingBox nor a Coordinate Pair could be detected to build a geographic annotation.")
            }
            // 1.2) Check if Annotation Build Up Has Succeed
            if (!place) {
                console.warn("Skipping semantic annotation of the following Leaflet item due to a previous error", this)
                return
            }
            // 1.3) Place the newly created Element into either a) its existing container or b) just append it to the overlay-pane DOM
            metadata.appendChild(place)
            metadata.appendChild(domObject)
            if (parentElement.className.indexOf("overlay-pane") == -1) { // If Parent DOM Element is NOT our Overlay Pane clear it up
                parentElement.innerHTML = ''
            }
            parentElement.appendChild(metadata)

        } else if (targetIsSVGGroup && this.options.hasOwnProperty('itemtype')) {
            // 2.) Renders HTML Elements as Annotations into SVG Metadata Element for GeoJSON or Circle Marker
            // console.log("Annotating SVG Geo Element", this.options.itemtype, hasLatLngValuePair, hasLayers, this)

            if (hasLayers) {
                // 2.1) Build annotations an SVG Element which is going to represent MANY LAYERS
                var groupElements = []
                this._findSVGGroupElements(this, groupElements)
                // console.log(this.options.itemtype, "SVG Layers, domId", domId, this, "SVG Geometry Leaflet Groups (possibly Polygon/Paths)", groupElements)
                for (var lg in groupElements) {
                    var element = groupElements[lg]
                    var containerElement = element._container
                    //console.log("   SVG Leaflet Geometry Group, LeafletID", element['_leaflet_id'], element)
                    metadata = document.createElement('metadata')
                    if (domId) metadata.setAttribute('id', domId)
                    metadata.setAttribute('itemscope','')
                    metadata.setAttribute('itemtype', 'http://schema.org/' + this.options.itemtype)
                    metadata.setAttribute('data-internal-leaflet-id', element['_leaflet_id'])
                    this._buildGenericProperties(metadata, this)
                    var place = this._buildGeoAnnotation('div', element, "shape", geoPropertyName)
                    metadata.appendChild(place)
                    containerElement.appendChild(metadata)
                }
                metadata = undefined // notes that metadata elements have been already appended to the DOM
                // ### Not Yet Further Implemented: TOOD: On a GeoJSON Feature (or Layer) there maybe GeoJSON "properties" to exploit
                /** var layerElements =  this._layers
                for  (var le in this._layers) {
                    var layerElement = this._layers[le]
                    var internalId = this._leaflet_id
                    var geometryType = layerElement.feature.geometry["type"]
                    if (layerElement.hasOwnProperty("feature")) { // ### 
                        console.log("  Loaded \"" + geometryType + "\" Feature (GeoJSON), LeafletID", internalId, layerElement.feature)
                    }
                } **/
            } else {
                // 2.2) Build annotations for an SVG Based Element (ONE WITHOUT MULTIPLE LAYERS)
                // console.log("Single SVG Element Annotations", this.options.itemtype, "SVG Element" + ", LeafletID", leafletId, this)
                metadata = document.createElement('metadata')
                if (domId) metadata.setAttribute('id', domId)
                metadata.setAttribute('itemscope','')
                metadata.setAttribute('itemtype', 'http://schema.org/' + this.options.itemtype)
                metadata.setAttribute('data-internal-leaflet-id', leafletId)
                this._buildGenericProperties(metadata, this)
                var place = this._buildGeoAnnotation("div", this, "point", geoPropertyName)
                metadata.appendChild(place)
            }
            if (metadata) domObject.appendChild(metadata)
        }
    },
    _buildGenericProperties: function(parentElement, object) {
        // Schema.org
        if (object.options.hasOwnProperty('title')) {
            this._appendMetaElementContent(parentElement, 'name', object.options.title)
        }
        if (object.options.hasOwnProperty('description')) {
            this._appendMetaElementContent(parentElement, 'description', object.options.description)
        }
        if (object.options.hasOwnProperty('url')) {
            this._appendMetaElementContent(parentElement, 'url', object.options.url)
        }
        if (object.options.hasOwnProperty('sameAs')) {
            this._appendMetaElementContent(parentElement, 'sameAs', object.options.sameAs)
        }
        if (object.options.hasOwnProperty('alternateName')) {
            this._appendMetaElementContent(parentElement, 'alternateName', object.options.alternateName)
        }
        if (object.options.hasOwnProperty('image')) {
            this._appendMetaElementContent(parentElement, 'image', object.options.image)
        }
        // Dublin Core Legacy Namespace: http://purl.org/dc/elements/1.1 "dc:xyz"
        // Without: Title, Description, Subject, Type and Coverage) and a Duplicate with Thing: sameAs == identifier
        if (object.options.hasOwnProperty('creator')) {
            this._appendMetaElementContent(parentElement, 'http://purl.org/dc/elements/1.1/creator', object.options.creator)
        }
        if (object.options.hasOwnProperty('contributor')) {
            this._appendMetaElementContent(parentElement, 'http://purl.org/dc/elements/1.1/contributor', object.options.contributor)
        }
        if (object.options.hasOwnProperty('publisher')) {
            this._appendMetaElementContent(parentElement, 'http://purl.org/dc/elements/1.1/publisher', object.options.publisher)
        }
        if (object.options.hasOwnProperty('published')) {
            this._appendMetaElementContent(parentElement, 'http://purl.org/dc/elements/1.1/date', object.options.published)
        }
        if (object.options.hasOwnProperty('identifier')) {
            this._appendMetaElementContent(parentElement, 'http://purl.org/dc/elements/1.1/identifier', object.options.identifier)
        }
        if (object.options.hasOwnProperty('rights')) {
            this._appendMetaElementContent(parentElement, 'http://purl.org/dc/elements/1.1/rights', object.options.rights)
        }
        if (object.options.hasOwnProperty('derivedFrom')) {
            this._appendMetaElementContent(parentElement, 'http://purl.org/dc/elements/1.1/source', object.options.derivedFrom)
        }
        if (object.options.hasOwnProperty('format')) {
            this._appendMetaElementContent(parentElement, 'http://purl.org/dc/elements/1.1/format', object.options.format)
        }
        if (object.options.hasOwnProperty('language')) {
            this._appendMetaElementContent(parentElement, 'http://purl.org/dc/elements/1.1/language', object.options.language)
        }
        // Terms Namespace http://purl.org/dc/terms/    "dcterms:xyz"
        if (object.options.hasOwnProperty('created')) {
            this._appendMetaElementContent(parentElement, 'http://purl.org/dc/terms/created', object.options.created)
        }
        if (object.options.hasOwnProperty('modified')) {
            this._appendMetaElementContent(parentElement, 'http://purl.org/dc/terms/modified', object.options.modified)
        }
    },
    _appendMetaElementContent: function(parent, elementName, elementTextContent) {
        var valueElement = this._createMetaElement('itemprop', elementName)
            valueElement.setAttribute('content', elementTextContent)
        parent.appendChild(valueElement)
    },
    _buildGeoAnnotation: function(element, object, geoType, geoPropertyName) {
        if (typeof element != "object") {
            element = document.createElement(element)
        }
        // console.log("Building Geo Annotation", object.options.itemtype, geoType, geoPropertyName)
        if (object.options.itemtype !== 'Person' && object.options.itemtype !== 'Organization' && object.options.itemtype !== 'Event'
            && object.options.itemtype !== 'Product' && object.options.itemtype !== 'IndividualProduct' && object.options.itemtype !== 'CreativeWork'
            && object.options.itemtype !== 'Sculpture' && object.options.itemtype !== 'Book' && object.options.itemtype !== 'Article'
            && object.options.itemtype !== 'Blog' && object.options.itemtype !== 'Comment' && object.options.itemtype !== 'Corporation'
            && object.options.itemtype !== 'GovernmentalOrganization' && object.options.itemtype !== 'EducationalOrganization'
            && object.options.itemtype !== 'NGO' && object.options.itemtype !== 'LocalBusiness') {
            // --- Here we assume the entity to annotate is a sub-type of Place (and therewith has the "geo"-property)
            element.setAttribute('itemprop', geoPropertyName)
            this._buildGeographicIndicators(element, geoType, object)

        } else if (geoPropertyName) {
            // --- Here we assume the entity to annotate is NOT a sub-type of Place (and therewith has NOT the "geo"-property)
            element.setAttribute('itemscope','')
            element.setAttribute('itemtype', 'http://schema.org/Place')
            element.setAttribute('itemprop', geoPropertyName)
            // the property container of a type can not be a meta element as such is not allowed to have children
            var geoElement = this._createContainerElement('itemprop', 'geo')
            this._buildGeographicIndicators(geoElement, geoType, object)
            element.appendChild(geoElement)

        } else {
            console.warn("Could not build up geo annotations for " + object.options.itemtype + " and an undefined \"geoproperty\" value ")
        }
        return element
    },
    _buildGeographicIndicators: function (element, type, object) {
        if (type === "shape") {
            element.setAttribute('itemtype', 'http://schema.org/GeoShape')
            element.setAttribute('itemscope', '')
            var polygon = this._createMetaElement('itemprop', 'polygon')
                polygon.setAttribute('content', this._buildPolygonArray(object._latlngs))
            element.appendChild(polygon)
        } else if (type === "point") {
            element.setAttribute('itemtype', 'http://schema.org/GeoCoordinates')
            element.setAttribute('itemscope', '')
            var latitude = this._createMetaElement('itemprop', 'latitude')
                latitude.setAttribute('content', object._latlng.lat)
            var longitude = this._createMetaElement('itemprop', 'longitude')
                longitude.setAttribute('content', object._latlng.lng)
            element.appendChild(latitude)
            element.appendChild(longitude)
        } else if (type === "box") {
            element.setAttribute('itemtype', 'http://schema.org/GeoShape')
            element.setAttribute('itemscope', '')
            var polygon = this._createMetaElement('itemprop', 'box')
                polygon.setAttribute('content', object._bounds._southWest.lat +"," + object._bounds._southWest.lng + " "
                    + object._bounds._northEast.lat + "," + object._bounds._northEast.lng)
            element.appendChild(polygon)
        } else {
            console.warn("Unsupported type of geographic value indication, currently supported are 'point', 'box' and 'polygon'")
        }
    }
}

// ---- Simple Marker ---- //
var superMarkerOnRemove = L.Marker.prototype.onRemove
L.Marker.include(Microdata)
L.Marker.addInitHook(function () { this.annotate() })
L.Marker.include({
    _getTargetDOMElement: function() {
        return this._icon
    },
    onRemove: function(map) {
        this._icon = this._icon.parentNode
        superMarkerOnRemove.call(this, map)
    }
})

// ---- Circle Marker ---- //
L.CircleMarker.include(Microdata)
L.CircleMarker.addInitHook(function () { this.annotate() })
L.CircleMarker.include({
    _getTargetDOMElement: function() {
        var results = []
        this._findContainerElements(this, results)
        return results.length > 0 ? results[0] : null
    }

})

// ---- Popup Item ---- //
L.Popup.include(Microdata)
L.Popup.addInitHook(function () { this.annotate() })
var superPopupOnRemove = L.Popup.prototype.onRemove
L.Popup.include({
    _getTargetDOMElement: function() {
        if (this.hasOwnProperty('_container')) { // Popup Container is initialized
            return this._container
        }
    },
    onRemove: function(map) {
        this._container = this._container.parentNode
        superPopupOnRemove.call(this, map)
    }
})

// ---- Layer Group (GeoJSON Layer) ---- //
L.LayerGroup.include(Microdata)
L.LayerGroup.addInitHook(function () {  this.annotate() })
L.LayerGroup.include({
    _getTargetDOMElement: function() {
        var results = []
        this._findContainerElements(this, results)
        return results.length > 0 ? results[0] : null
    }
})

// ---- Layer Group (GeoJSON Layer) ---- //
L.ImageOverlay.include(Microdata)
L.ImageOverlay.addInitHook(function () { this.annotate() })
L.ImageOverlay.include({
    _getTargetDOMElement: function() {
        if (this.hasOwnProperty('_image')) { // Image Overlay Container is initialized
            return this._image
        }
    }
})
