
// --- Implementation for building annnotations in Microdata Syntax

var Microdata = {
    annotate: function() {
        var target = this._getTargetDOMElement()
        if (!target) {
            this.on('add', function() { // Marker
                target = this._getTargetDOMElement()
                this._buildAnnotations(target)
            })
            this.on('open', function() { // Opening Popup
                target = this._getTargetDOMElement()
                this._buildAnnotations(target)
            })
            this.on('close', function() { // Closing Popup
                var previousContainer = []
                this._findPopupContainerElement(this, previousContainer)
                this._container = previousContainer[0]
            })
        } else {
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
    _buildAnnotations: function(targets) {

        if (Object.prototype.toString.call(targets) !== '[object Array]') {
            targets = [targets]
        }

        var metadata = undefined
        var domObject = targets[0]
        var parentElement = domObject.parentNode
        var geoPropertyName = (this.options.hasOwnProperty('geoprop')) ? this.options.geoprop : "geo"
        var isSVGGroup = (domObject.tagName === 'g') ? true : false
        var hasLatLngValuePair = (this.hasOwnProperty('_latlng')) ? true : false
        var hasLayers = (this.hasOwnProperty('_layers')) ? true : false
        var leafletId = this['_leaflet_id']

        if (!isSVGGroup && this.options.hasOwnProperty('itemtype')) {

            // --- Renders Simple Marker Annotations into an ARTICLE and appends the original element

            metadata = document.createElement('article')
            metadata.setAttribute('itemscope','')
            metadata.setAttribute('itemtype', 'http://schema.org/' + this.options.itemtype)
            metadata.setAttribute('data-internal-leaflet-id', leafletId)
            this._buildGenericProperties(metadata, this)
            var place = this._buildGeoAnnotation("meta", this, "point", geoPropertyName)
            metadata.appendChild(place)
            metadata.appendChild(domObject)
            parentElement.innerHTML = ''
            parentElement.appendChild(metadata)
            // For closing popups (removing from DOM) we need to tell our object which is its new (uppermost) container
            // this._container = metadata

        } else if (isSVGGroup && this.options.hasOwnProperty('itemtype')) {
            // --- Renders HTML Elements as Annotations into SVG Metadata Element for GeoJSON or Circle Marker
            // console.log("Annotating SVG Geo Element", this.options.itemtype, hasLatLngValuePair, hasLayers, this)

            if (hasLayers) { // build annotations on many elements
                var groupElements = []
                this._findSVGGroupElements(this, groupElements)
                console.log(this.options.itemtype, "SVG Layers, LeafletID", leafletId, this, "SVG Geometry Leaflet Groups (possibly Polygon/Paths)", groupElements)
                for (var lg in groupElements) {
                    var element = groupElements[lg]
                    var containerElement = element._container
                    console.log("   SVG Leaflet Geometry Group, LeafletID", element['_leaflet_id'], element)
                    metadata = document.createElement('metadata')
                    metadata.setAttribute('itemscope','')
                    metadata.setAttribute('itemtype', 'http://schema.org/' + this.options.itemtype)
                    metadata.setAttribute('data-internal-leaflet-id', element['_leaflet_id'])
                    this._buildGenericProperties(metadata, this)
                    var place = this._buildGeoAnnotation('meta', element, "shape", geoPropertyName)
                    metadata.appendChild(place)
                    containerElement.appendChild(metadata)
                }
                metadata = undefined // notes that metadata elements have been already appended to the DOM
                // ### Some GeoJSON Feature/Layer Debug Experimentals maybe there are GeoJSON "properties" to exploit
                var layerElements =  this._layers
                for (var le in this._layers) {
                    var layerElement = this._layers[le]
                    var internalId = this._leaflet_id
                    var geometryType = layerElement.feature.geometry["type"]
                    if (layerElement.hasOwnProperty("feature")) console.log("  Loaded GeoJSON " + geometryType + " Feature, LeafletID", internalId, layerElement.feature)
                }
            } else { // build annotations for a single element
                console.log(this.options.itemtype, "SVG Element" + ", LeafletID", leafletId, this)
                metadata = document.createElement('metadata')
                metadata.setAttribute('itemscope','')
                metadata.setAttribute('itemtype', 'http://schema.org/' + this.options.itemtype)
                metadata.setAttribute('data-internal-leaflet-id', leafletId)
                this._buildGenericProperties(metadata, this)
                var place = this._buildGeoAnnotation("meta", this, "point", geoPropertyName)
                metadata.appendChild(place)
            }
            if (metadata) domObject.appendChild(metadata)
        }
    },
    _buildGenericProperties: function(parentElement, object) {
        if (object.options.hasOwnProperty('title')) {
            _appendMetaElementContent(parentElement, 'name', object.options.title)
        }
        if (object.options.hasOwnProperty('description')) {
            _appendMetaElementContent(parentElement, 'description', object.options.description)
        }
        if (object.options.hasOwnProperty('url')) {
            _appendMetaElementContent(parentElement, 'url', object.options.url)
        }
        if (object.options.hasOwnProperty('sameAs')) {
            _appendMetaElementContent(parentElement, 'sameAs', object.options.sameAs)
        }
        if (object.options.hasOwnProperty('alternateName')) {
            _appendMetaElementContent(parentElement, 'alternateName', object.options.alternateName)
        }
        if (object.options.hasOwnProperty('image')) {
            _appendMetaElementContent(parentElement, 'image', object.options.image)
        }
    },
    _appendMetaElementContent: function(parent, elementName, elementTextContent) {
        var valueElement = this._createMetaElement('itemprop', elementName)
            valueElement.setAttribute('content', elementTextContent)
        parent.appendChild(url)
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

            // --- We assume the entity to annotate is a sub-type of Place (and therewith has the "geo"-property)
            element.setAttribute('itemprop', geoPropertyName)
            this._buildGeographicIndicators(element, geoType, object)

        } else if (geoPropertyName) {

            // --- We assume the entity to annotate is NOT a sub-type of Place (and therewith has NOT the "geo"-property)
            element.setAttribute('itemscope','')
            element.setAttribute('itemtype', 'http://schema.org/Place')
            element.setAttribute('itemprop', geoPropertyName)
            var geoElement = this._createMetaElement('itemprop', 'geo')
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
            var polygon = this._createMetaElement('itemprop', 'polygon')
                polygon.setAttribute('content', this._buildPolygonArray(object._latlngs))
            element.appendChild(polygon)
        } else if (type === "point") {
            element.setAttribute('itemtype', 'http://schema.org/GeoCoordinates')
            var latitude = this._createMetaElement('itemprop', 'latitude')
                latitude.setAttribute('content', object._latlng.lat)
            var longitude = this._createMetaElement('itemprop', 'longitude')
                longitude.setAttribute('content', object._latlng.lng)
            element.appendChild(latitude)
            element.appendChild(longitude)
        } else {
            throw new Error("Unsupported type of geographic value indication")
        }
    }
}

// --- Leaflet Item Wrapper

L.Marker.include(Microdata)
L.Marker.include({
    _getTargetDOMElement: function() {
        return this._icon
    }
})
L.Marker.addInitHook(function () {
    this.annotate()
})

L.CircleMarker.include(Microdata)
L.CircleMarker.include({
    _getTargetDOMElement: function() {
        var results = []
        this._findContainerElements(this, results)
        return results.length > 0 ? results[0] : null
    }
})
L.CircleMarker.addInitHook(function () {
    this.annotate()
})

L.Popup.include(Microdata)
L.Popup.include({
    _getTargetDOMElement: function() {
        if (this.hasOwnProperty('_container')) { // Popup Container is initialized
            return this._container
        }
    }
})
L.Popup.addInitHook(function () {
    this.annotate()
})

L.LayerGroup.include(Microdata)
L.LayerGroup.include({
    _getTargetDOMElement: function() {
        var results = []
        this._findContainerElements(this, results)
        return results.length > 0 ? results[0] : null
    }
})
L.LayerGroup.addInitHook(function () {
    this.annotate()
})
