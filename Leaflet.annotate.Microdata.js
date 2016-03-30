
// --- Implementation for building annnotations in Microdata Syntax

var Microdata = {
    annotate: function() {
        var target = this._getTargetDOMElement()
        if (!target) {
            // console.log("Leaflet Entity Not Yet Wrapped for Annotations", this)
            // Catchs Markers when Added
            this.on('add', function() {
                target = this._getTargetDOMElement()
                this._buildAnnotations(target)
            })
        } else {
            this._buildAnnotations(target)
        }
        return this
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

        var data = null
        var domObject = targets[0]
        var isSVGGroup = (domObject.tagName === 'g') ? true : false
        var parentElement = domObject

        if ((this.options.itemtype === 'Place' || this.options.itemtype === 'City'
             || this.options.itemtype === 'State' || this.options.itemtype === 'Country'
             || this.options.itemtype === 'AdministrativeArea' || this.options.itemtype === 'LocalBusiness'
             || this.options.itemtype === 'Residence' || this.options.itemtype === 'CivicStructure' || this.options.itemtype === 'Landform'
             || this.options.itemtype === 'TouristAttraction' ) && !isSVGGroup) {
            // --- Renders Simple Marker Annotations into an ARTICLE and appends the original element

            console.log(this.options.itemtype, "HTML Point, LeafletID", leafletId, this)
            var parent = domObject.parentNode
            var metadata = document.createElement('article')
                metadata.setAttribute('data-internal-leaflet-id', leafletId)
                this._buildGeoAnnotation(metadata, geoPropertyName, this)
                metadata.appendChild(domObject)
                parent.innerHTML = ''
                parent.appendChild(metadata)

        } else if (isSVGGroup) {
            // --- Renders HTML Elements as Annotations into SVG Metadata Element for GeoJSON or Circle Marker

            var geoType = (this.options.hasOwnProperty('geotype')) ? this.options.geotype : "point"
            var hasLatLngValuePair = (this.hasOwnProperty('_latlng')) ? true : false
            var hasLayers = (this.hasOwnProperty('_layers')) ? true : false
            var leafletId = this['_leaflet_id']
            var geoPropertyName = (this.options.hasOwnProperty('geoprop')) ? this.options.geoprop : "geo"
            var metadata = undefined

            // console.log("Annotating SVG Geo Element", this.options.itemtype, hasLatLngValuePair, hasLayers, this)

            if (hasLayers) { // build annotations on many elements

                // Layers are not "just a Place" but typed more specific
                if ((this.options.itemtype === 'City' || this.options.itemtype === 'State' || this.options.itemtype === 'Country'
                     || this.options.itemtype === 'AdministrativeArea' || this.options.itemtype === 'LocalBusiness'
                     || this.options.itemtype === 'Residence' || this.options.itemtype === 'CivicStructure'
                     || this.options.itemtype === 'Landform' || this.options.itemtype === 'TouristAttraction')) {
                    var groupElements = []
                    this._findSVGGroupElements(this, groupElements)
                    console.log(this.options.itemtype, "SVG Shape, LeafletID", leafletId, this, "SVG Geometry Leaflet Groups (possibly Polygon/Paths)", groupElements)
                    for (var lg in groupElements) {
                        var element = groupElements[lg]
                        var containerElement = element._container
                        console.log("   SVG Leaflet Geometry Group, LeafletID", element['_leaflet_id'], element)
                        metadata = document.createElement('metadata')
                        metadata.setAttribute('itemscope','')
                        metadata.setAttribute('itemtype', 'http://schema.org/' + this.options.itemtype)
                        metadata.setAttribute('data-internal-leaflet-id', element['_leaflet_id'])
                        var name = this._createMetaElement('itemprop', 'name')
                            name.setAttribute('content', this.options.title)
                        metadata.appendChild(name)
                        this._buildGeoAnnotation(metadata, geoPropertyName, element, "shape")
                        containerElement.appendChild(metadata)
                    }
                    metadata = undefined // notes that metadata elements have been already appended to the DOM
                    // Some GeoJSON Feature/Layer Debug Experimentals
                    var layerElements =  this._layers
                    for (var le in this._layers) {
                        var layerElement = this._layers[le]
                        var internalId = this._leaflet_id
                        var geometryType = layerElement.feature.geometry["type"]
                        if (layerElement.hasOwnProperty("feature")) console.log("  Loaded GeoJSON " + geometryType + " Feature, LeafletID", internalId, layerElement.feature)
                    }
                }

            } else { // build annotations for a single element

                console.log(this.options.itemtype, "SVG " + geoType + ", LeafletID", leafletId, this)

                if (this.options.itemtype === 'Place') {    // Direct Pin-Point location, just a ``Place'' with a simple "geo" property (GeoCoordinates)
                    metadata = document.createElement('metadata')
                    metadata.setAttribute('data-internal-leaflet-id', leafletId)
                    var name = this._createMetaElement("itemprop", "name")
                        name.setAttribute('content', this.options.title)
                    metadata.appendChild(name)
                    this._buildGeoAnnotation(metadata, geoPropertyName, this)
                } else if (this.options.itemtype !== 'undefined') {  // Indirect Pin-Point location, a simple ``Place'' in given geo-property (geoprop) (GeoCoordinates)
                    metadata = document.createElement('metadata')
                    metadata.setAttribute('itemscope','')
                    metadata.setAttribute('itemtype', 'http://schema.org/' + this.options.itemtype)
                    metadata.setAttribute('data-internal-leaflet-id', leafletId)
                    var name = this._createMetaElement("itemprop", "name")
                        name.setAttribute('content', this.options.title)
                    var place = this._buildGeoAnnotation("meta", geoPropertyName, this, geoType)
                    metadata.appendChild(name)
                    metadata.appendChild(place)
                }
            }
            // ### if not already available in the DOM
            if (metadata) domObject.appendChild(metadata)
        }
    },
    _buildGeoAnnotation: function(element, schemaPropertyName, object, geoType) {
        if (typeof element != "object") {
            element = document.createElement(element)
        }
        element.setAttribute('itemscope','')
        element.setAttribute('itemtype', 'http://schema.org/Place')
        var geoElement = this._createMetaElement('itemprop', schemaPropertyName)
            if (geoType === "shape") {
                geoElement.setAttribute('itemtype', 'http://schema.org/GeoShape')
                var polygon = this._createMetaElement('itemprop', 'polygon')
                    polygon.setAttribute('content', this._buildPolygonArray(object._latlngs))
                geoElement.appendChild(polygon)
            } else {
                geoElement.setAttribute('itemtype', 'http://schema.org/GeoCoordinates')
                var latitude = this._createMetaElement('itemprop', 'latitude')
                    latitude.setAttribute('content', object._latlng.lat)
                var longitude = this._createMetaElement('itemprop', 'longitude')
                    longitude.setAttribute('content', object._latlng.lng)
                geoElement.appendChild(latitude)
                geoElement.appendChild(longitude)
            }
        element.appendChild(geoElement)
        return element
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

/** L.SVG.addInitHook({
    console.log("SVG.addInitHook", this)
}) **/

// var superPathInitialize = L.Path.prototype.initialize
/** L.Path.addInitHook({
    console.log("Path.addInitHook", this)
}) **/
