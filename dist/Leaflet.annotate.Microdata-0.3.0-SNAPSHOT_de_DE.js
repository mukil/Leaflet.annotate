
(function() {


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
        if (target) {
            // 1.1) Build annotations for all items we already know the DOM element
            this._buildAnnotations(target)
        } else {
            // 1.2) Register listeners for when this is done
            this.on('add', function() { // Marker
                target = this._getTargetDOMElement()
                this._buildAnnotations(target)
            })
            this.on('open', function() { // Opening Popup
                target = this._getTargetDOMElement()
                this._buildAnnotations(target)
            })
            this.on('load', function(e) { // When Image Overlay Element is Available
                target = this._getTargetDOMElement()
                this._buildAnnotations(target)
            })
            this.on('close', function() { // Closing Popup
                var previousContainer = []
                this._findPopupContainerElement(this, previousContainer)
                this._container = previousContainer[0]
            })
        }
        return this
    },
    _findPopupContainerElement: function(element, result) {
        var childNodes = element._container.childNodes
        for (var el in childNodes) {
            var element = childNodes[el]
            if (element.className.indexOf('leaflet-popup') != -1) return element
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
    _createMetaElement: function(key, value, namespaceSVG) {
        var el = undefined
        if (namespaceSVG) {
            el = el = document.createElement('desc')
            el.setAttribute(key, value)
        } else {
            el = document.createElement('meta')
            el.setAttribute(key, value)
        }
        return el
    },
    _createSVGTitleElement: function(key, value) {
        var el = document.createElement('title')
            el.setAttribute(key, value)
            el.innerText = value
        return el
    },
    _createGroupingElement: function(elementName, key, value) {
        var el = document.createElement(elementName)
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
        var domId = (this.options.hasOwnProperty('domId')) ? this.options.domId : undefined
        var targetIsSVGGroup = (domObject.tagName === 'g') ? true : false
        var hasLatLngValuePair = this.hasOwnProperty('_latlng')
        var hasBoundingBox = this.hasOwnProperty('_bounds')
        var hasLayers = this.hasOwnProperty('_layers')
        var leafletId = this['_leaflet_id']
        // Useful for debugging when adding support for new items, such as L.ImageOverlay here
        // console.log("Bulding Overlay Annotations Parent", parentElement, "Has Lat/Lng Pair", hasLatLngValuePair, "Has Bounding Box", hasBoundingBox, this)
        // 1) Annotating "Marker", "Popup" (Point Style) and "Image Overlay" into a new ARTICLE element
        if (!targetIsSVGGroup && this.options.hasOwnProperty('itemtype')) {
            metadata = this._buildAnnotationsContainer('article', domId, leafletId)
            this._buildGenericProperties(metadata, this, targetIsSVGGroup)
            var placeAnnotation = undefined
            if (hasLatLngValuePair && !hasBoundingBox) {
                placeAnnotation = this._buildGeoAnnotation('div', this, 'point', geoPropertyName, targetIsSVGGroup)
            } else if (hasBoundingBox) {
                placeAnnotation = this._buildGeoAnnotation('div', this, 'box', geoPropertyName, targetIsSVGGroup)
            } else {
                console.log("Invalid argument provided: Neither a BoundingBox nor a Coordinate Pair could be detected to build a geographic annotation.")
                console.warn("Skipping semantic annotation of the following Leaflet item due to a previous error", this)
                return
            }
            // Place the newly created Element into either ...
            // a) its existing container
            metadata.appendChild(placeAnnotation)
            metadata.appendChild(domObject)
            // Note: If Parent DOM Element is NOT the "Overlay" or "Marker" Pane clear it up. ### Double check this for all Leaflet items we annotate
            if (parentElement.className.indexOf("overlay-pane") == -1 && parentElement.className.indexOf("marker-pane") == -1) {
                parentElement.innerHTML = ''
            }
            // b) .. or just append it to the overlay-pane DOM
            parentElement.appendChild(metadata)
            this.options._annotated = true
        // 2.) Annotations into SVG Metadata Element, currently just for geoJSON or circleMarker overlays
        } else if (targetIsSVGGroup && this.options.hasOwnProperty('itemtype')) {
            if (hasLayers) {
                // 2.1) Build annotations an SVG Element which is going to represent MANY LAYERS
                var groupElements = []
                this._findSVGGroupElements(this, groupElements)
                for (var lg in groupElements) {
                    var element = groupElements[lg]
                    var containerElement = element._container
                    var place = this._buildGeoAnnotation('g', element, 'shape', geoPropertyName, targetIsSVGGroup)
                    // console.log("   SVG Leaflet Geometry Group, LeafletID", element['_leaflet_id'], element)
                    metadata = this._buildAnnotationsContainer('metadata', domId, element['_leaflet_id'])
                    this._buildGenericProperties(metadata, this, targetIsSVGGroup)
                    metadata.appendChild(place)
                    containerElement.appendChild(metadata)
                }
                metadata = undefined // notes that metadata elements have been already appended to the DOM
            } else {
                // 2.2) Build annotations for an SVG Based Element (ONE WITHOUT MULTIPLE LAYERS)
                // console.log("Single SVG Element Annotations", this.options.itemtype, "SVG Element" + ", LeafletID", leafletId, this)
                var place = this._buildGeoAnnotation('g', this, 'point', geoPropertyName, targetIsSVGGroup)
                metadata = this._buildAnnotationsContainer('metadata', domId, leafletId)
                this._buildGenericProperties(metadata, this, targetIsSVGGroup)
                metadata.appendChild(place)
            }
            if (metadata) {
                domObject.appendChild(metadata)
                this.options._annotated = true
            }
        }
    },
    _buildAnnotationsContainer: function(elementName, domId, leafletId) {
        var article = document.createElement(elementName)
        if (domId) article.setAttribute('id', domId)
        article.setAttribute('itemscope','')
        article.setAttribute('itemtype', 'http://schema.org/' + this.options.itemtype)
        article.setAttribute('data-internal-leaflet-id', leafletId)
        return article
    },
    _buildGenericProperties: function(parentElement, object, namespaceSVG) {
        // Maps Leaflet.annotate options to Schema.org and Dublin Core Element Names
        if (object.options.hasOwnProperty('title')) {
            this._appendMetaItempropContent(parentElement, 'name', object.options.title, namespaceSVG)
        }
        if (object.options.hasOwnProperty('description')) {
            this._appendMetaItempropContent(parentElement, 'description', object.options.description, namespaceSVG)
        }
        if (object.options.hasOwnProperty('url')) {
            this._appendMetaItempropContent(parentElement, 'url', object.options.url, namespaceSVG)
        }
        if (object.options.hasOwnProperty('sameAs')) {
            this._appendMetaItempropContent(parentElement, 'sameAs', object.options.sameAs, namespaceSVG)
        }
        if (object.options.hasOwnProperty('alternateName')) {
            this._appendMetaItempropContent(parentElement, 'alternateName', object.options.alternateName, namespaceSVG)
        }
        if (object.options.hasOwnProperty('image')) {
            this._appendMetaItempropContent(parentElement, 'image', object.options.image, namespaceSVG)
        }
        // Dublin Core Legacy Namespace: http://purl.org/dc/elements/1.1 "dc:xyz"
        // Without: Title, Description, Subject, Type and Coverage) and a Duplicate with Thing: sameAs == identifier
        if (object.options.hasOwnProperty('creator')) {
            this._appendMetaNameContent(parentElement, 'http://purl.org/dc/elements/1.1/creator', object.options.creator, namespaceSVG)
        }
        if (object.options.hasOwnProperty('contributor')) {
            this._appendMetaNameContent(parentElement, 'http://purl.org/dc/elements/1.1/contributor', object.options.contributor, namespaceSVG)
        }
        if (object.options.hasOwnProperty('publisher')) {
            this._appendMetaNameContent(parentElement, 'http://purl.org/dc/elements/1.1/publisher', object.options.publisher, namespaceSVG)
        }
        if (object.options.hasOwnProperty('published')) {
            this._appendMetaNameContent(parentElement, 'http://purl.org/dc/elements/1.1/date', object.options.published, namespaceSVG)
        }
        if (object.options.hasOwnProperty('identifier')) {
            this._appendMetaNameContent(parentElement, 'http://purl.org/dc/elements/1.1/identifier', object.options.identifier, namespaceSVG)
        }
        if (object.options.hasOwnProperty('rights')) {
            this._appendMetaNameContent(parentElement, 'http://purl.org/dc/elements/1.1/rights', object.options.rights, namespaceSVG)
        }
        if (object.options.hasOwnProperty('derivedFrom')) {
            this._appendMetaNameContent(parentElement, 'http://purl.org/dc/elements/1.1/source', object.options.derivedFrom, namespaceSVG)
        }
        if (object.options.hasOwnProperty('format')) {
            this._appendMetaNameContent(parentElement, 'http://purl.org/dc/elements/1.1/format', object.options.format, namespaceSVG)
        }
        if (object.options.hasOwnProperty('language')) {
            this._appendMetaNameContent(parentElement, 'http://purl.org/dc/elements/1.1/language', object.options.language, namespaceSVG)
        }
        // Terms Namespace http://purl.org/dc/terms/    "dcterms:xyz"
        if (object.options.hasOwnProperty('created')) {
            this._appendMetaNameContent(parentElement, 'http://purl.org/dc/terms/created', object.options.created, namespaceSVG)
        }
        if (object.options.hasOwnProperty('modified')) {
            this._appendMetaNameContent(parentElement, 'http://purl.org/dc/terms/modified', object.options.modified, namespaceSVG)
        }
    },
    _appendMetaNameContent: function(parent, elementName, elementTextContent, namespaceSVG) {
        var valueElement = this._createMetaElement('name', elementName, namespaceSVG)
            valueElement.setAttribute('content', elementTextContent, namespaceSVG)
        parent.appendChild(valueElement)
    },
    _appendMetaItempropContent: function(parent, elementName, elementTextContent, namespaceSVG) {
        var valueElement = undefined
        if (elementName === 'name' && namespaceSVG) {
            valueElement = this._createSVGTitleElement(elementName, elementTextContent)
        } else {
            valueElement = this._createMetaElement('itemprop', elementName, namespaceSVG)
            valueElement.setAttribute('content', elementTextContent)
        }
        if (valueElement) parent.appendChild(valueElement)
    },
    _buildGeoAnnotation: function(element, object, geoType, geoPropertyName, namespaceSVG) {
        if (typeof element != 'object') {
            element = document.createElement(element)
        }
        // console.log("Building Geo Annotation", object.options.itemtype, geoType, geoPropertyName)
        // --- Here we know the entity to annotate has the "geo"-property
        if (hasGeoProperty(object.options.itemtype)) {
            element.setAttribute('itemprop', geoPropertyName)
            this._buildGeographicIndicators(element, geoType, object, namespaceSVG)
        // --- Here we know that the type has a property defined which can handle a "Place" as its value
        // --- ### Also allow for geographic annotation with not only Place but, e.g its subtypes, like 
        // --- "AdministrativeArea" or other types "GeoShape", "GeoCoordinate" or simply "Text"
        } else if (isValidPlaceProperty(geoPropertyName)) {
            element.setAttribute('itemscope','')
            element.setAttribute('itemtype', 'http://schema.org/Place')
            element.setAttribute('itemprop', geoPropertyName)
            var geoElement = this._createGroupingElement(element.localName, 'itemprop', 'geo')
            this._buildGeographicIndicators(geoElement, geoType, object, namespaceSVG)
            element.appendChild(geoElement)

        } else {
            console.warn("Could not build up geo annotations for " + object.options.itemtype + " and an undefined \"geoproperty\" value ")
        }
        return element
    },
    _buildGeographicIndicators: function (element, type, object, namespaceSVG) {
        if (type === "shape") {
            element.setAttribute('itemtype', 'http://schema.org/GeoShape')
            element.setAttribute('itemscope', '')
            var polygon = this._createMetaElement('itemprop', 'polygon', namespaceSVG)
                polygon.setAttribute('content', this._buildPolygonArray(object._latlngs))
            element.appendChild(polygon)
        } else if (type === "point") {
            element.setAttribute('itemtype', 'http://schema.org/GeoCoordinates')
            element.setAttribute('itemscope', '')
            var latitude = this._createMetaElement('itemprop', 'latitude', namespaceSVG)
                latitude.setAttribute('content', object._latlng.lat)
            var longitude = this._createMetaElement('itemprop', 'longitude', namespaceSVG)
                longitude.setAttribute('content', object._latlng.lng)
            element.appendChild(latitude)
            element.appendChild(longitude)
        } else if (type === "box") {
            element.setAttribute('itemtype', 'http://schema.org/GeoShape')
            element.setAttribute('itemscope', '')
            var polygon = this._createMetaElement('itemprop', 'box', namespaceSVG)
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
        if (this.options._annotated) {
            this._icon = this._icon.parentNode
        }
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
        if (this.options._annotated) {
            this._container = this._container.parentNode
        }
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

// ---- Image Overlay ---- //
L.ImageOverlay.include(Microdata)
L.ImageOverlay.addInitHook(function () { this.annotate() })
L.ImageOverlay.include({
    _getTargetDOMElement: function() {
        if (this.hasOwnProperty('_image')) { // Image Overlay Container is initialized
            return this._image
        }
    }
})


// --- An optimized version of an schema validation tool for building
// --- dialogs allowing the annotation of web map elements.

// TODO: Intangible Subtypes. Products and Actions probably not.
// If you extend this list please make sure each type is listed only once.

var validItemTypesDe = {
    "Organization": { "label": "Organisation", "validProperties": { "areaServed": [], "foundingLocation": [], "hasPOS": [], "location": [] } },
        "Airline": { "label": "Fluglinie", "validProperties": { "areaServed": [], "foundingLocation": [], "hasPOS": [], "location": [] } },
        "Corporation": { "label": "Konzern", "validProperties": { "areaServed": [], "foundingLocation": [], "hasPOS": [], "location": [] } },
        "EducationalOrganization": { "label": "Bildungsorganisation", "validProperties": { "areaServed": [], "foundingLocation": [], "hasPOS": [], "location": [] } },
            "CollegeOrUniversity": { "label": "Hochschule oder Universität", "validProperties": { "areaServed": [], "foundingLocation": [], "hasPOS": [], "location": [] } },
            "ElementarySchool": { "label": "Grundschule", "validProperties": { "areaServed": [], "foundingLocation": [], "hasPOS": [], "location": [] } },
            "HighSchool": { "label": "Oberschule", "validProperties": { "areaServed": [], "foundingLocation": [], "hasPOS": [], "location": [] } },
            "MiddleSchool": { "label": "Mittlere Schule", "validProperties": { "areaServed": [], "foundingLocation": [], "hasPOS": [], "location": [] } },
            "Preschool": { "label": "Vorschule", "validProperties": { "areaServed": [], "foundingLocation": [], "hasPOS": [], "location": [] } },
            "School": { "label": "Schule", "validProperties": { "areaServed": [], "foundingLocation": [], "hasPOS": [], "location": [] } },
        "GovernmentalOrganization": { "label": "Regierungsorganisation", "validProperties": { "areaServed": [], "foundingLocation": [], "hasPOS": [], "location": [] } },
        "MedicalOrganization": { "label": "Gesundheitsorganisation", "validProperties": { "areaServed": [], "foundingLocation": [], "hasPOS": [], "location": [] } },
        "NGO": { "label": "Nicht-Regierungs Organisation", "validProperties": { "areaServed": [], "foundingLocation": [], "hasPOS": [], "location": [] } },
        "PerformingGroup": { "label": "Künstlergruppe", "validProperties": { "areaServed": [], "foundingLocation": [], "hasPOS": [], "location": [] } },
        "SportsOrganization": { "label": "Sport Organisation", "validProperties": { "areaServed": [], "foundingLocation": [], "hasPOS": [], "location": [] } },

    "CreativeWork": { "label": "Werk", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "Article": { "label": "Artikel", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "Blog": { "label": "Blog", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "Book": { "label": "Buch", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "Clip": { "label": "Clip", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "Comment": { "label": "Kommentar", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "Conversation": { "label": "Unterhaltung", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "CreativeWorkSeason": { "label": "Werk Staffel", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "CreativeWorkSeries": { "label": "Werk Serie", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "DataCatalog": { "label": "Datenkatalog", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "Dataset": { "label": "Datensatz", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "DigitalDocument": { "label": "Digitales Dokument", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "Episode": { "label": "Episode", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "Game": { "label": "Spiel", "validProperties":  { "contentLocation": [], "locationCreated": [], "spatialCoverage": [], "gameLocation": [] } },
        "MediaObject": { "label": "Medieninhalt", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [], "regionsAllowed": [] } },
        "AudioObject": { "label": "Audioinhalt", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [], "regionsAllowed": [] } },
        "ImageObject": { "label": "Bildinhalt", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [], "regionsAllowed": [] } },
        "Map": { "label": "Karte", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "Movie": { "label": "Film", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "MusicComposition": { "label": "Musikalische Komposition", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "MusicPlaylist": { "label": "Playliste", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "MusicRecording": { "label": "Musikalische Aufnahme", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "Painting": { "label": "Gemaltes Bild", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "Photograph": { "label": "Photographie", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "PublicationIssue": { "label": "Veröffentlichung Nr.", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "PublicationVolume": { "label": "Veröffentlichung Band", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "Question": { "label": "Frage", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "Recipe": { "label": "Rezept", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "Review": { "label": "Rezension", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "Sculpture": { "label": "Skulptur", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "Series": { "label": "Serie", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "SoftwareApplication": { "label": "Software Anwendung", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "TVSeason": { "label": "TV Staffel", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "TVSeries": { "label": "TV Serie", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "SoftwareSourceCode": { "label": "Software Quellcode", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "VisualArtwork": { "label": "Visuelles Kunstwerk", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "WebPage": { "label": "Webpage", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "WebSite": { "label": "Webseite", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },

    "Person": { "label": "Person", "validProperties": { "birthPlace": [], "deathPlace": [], "hasPOS": [], "homeLocation": [], "workLocation": [] } },

    "Intangible": { "label": "Immateriell", "validProperties": {} },
        "AlignmentObject": { "label": "Ausrichtung", "validProperties": {} },
        "Audience": { "label": "Zielgruppe", "validProperties": { "geographicArea": [ "AdministrativeArea" ] } },
        "BedDetails": { "label": "Bettendetails", "validProperties": {} },
        "Brand": { "label": "Marke", "validProperties": {} },
        "BroadcastChannel": { "label": "Sender", "validProperties": {} },
        "BusTrip": { "label": "Busreise", "validProperties": { "arrivalBusStop": [ "BusStop", "BusStation" ], "departureBusStop": [ "BusStop", "BusStation" ] } },
        "ComputerLanguage": { "label": "Computersprache", "validProperties": {} },
        "DataFeedItem": { "label": "Element eines Datenfeeds", "validProperties": {} },
        "Demand": { "label": "Nachfrage", "validProperties": { "areaServed": [ "AdministrativeArea", "GeoShape", "Place", "Text" ], "availableAtOrFrom": [], "eligibleRegion": [ "GeoShape", "Place", "Text" ], "ineligibleRegion": [ "GeoShape", "Place", "Text" ] } },

        "DigitalDocumentPermission": { "label": "Berechtigung für ein digitales Dokument", "validProperties": {} },
        "EntryPoint": { "label": "Einstiegspunkt", "validProperties": {} },

        "Enumeration": { "label": "Aufzählung", "validProperties": {} },
        "Flight": { "label": "Flug", "validProperties": {} },
        "GameServer": { "label": "Game Server", "validProperties": {} },
        "Invoice": { "label": "Rechnung", "validProperties": {} },
        "ItemList": { "label": "Listenelement", "validProperties": {} },

        "JobPosting": { "label": "Stellenangebot", "validProperties": { "jobLocation": [] } },

        "Language": { "label": "Sprache", "validProperties": {} },
        "Offer": { "label": "Angebot", "validProperties": {} },
        "Order": { "label": "Bestellung", "validProperties": {} },
        "OrderItem": { "label": "Bestelltes Element", "validProperties": {} },
        "ParcelDelivery": { "label": "Paketlieferung", "validProperties": {} },
        "Permit": { "label": "Erlaubnis", "validProperties": {} },
        "ProgramMembership": { "label": "Mitgliedschaft Rabattkarte", "validProperties": {} },
        "PropertyValueSpecification": { "label": "Grundstückswert Spezifikation", "validProperties": {} },
        "Quantity": { "label": "Menge", "validProperties": {} },
        "Rating": { "label": "Bewertung", "validProperties": {} },
        "Reservation": { "label": "Reservierung", "validProperties": {} },
        "Role": { "label": "Rolle", "validProperties": {} },
        "Seat": { "label": "Sitz", "validProperties": {} },
        "Service": { "label": "Dienstleistung", "validProperties": {} },
        "ServiceChannel": { "label": "Service Channel", "validProperties": {} },
        "StructuredValue": { "label": "Strukturierter Wert", "validProperties": {} },
        "Ticket": { "label": "Ticket", "validProperties": {} },
        "TrainTrip": { "label": "Zugreise", "validProperties": { "arivalStation": ["TrainStation"], "departureStation": ["TrainStation"] } },


    "Action": { "label": "Aktion", "validProperties": { "location": [] } },

    "Event": { "label": "Event", "validProperties": { "location": [] } },

    "ExerciseAction": { "label": "Fitnessübung", "validProperties": { "fromLocation": [], "toLocation": [] } },
    "MoveAction": { "label": "Move Action", "validProperties": { "fromLocation": [], "toLocation": [] } },
    "TransferAction": { "label": "Transfer Action", "validProperties": { "fromLocation": [], "toLocation": [] } },

    "RentalCarReservation": { "label": "Mietwagenreservierung", "validProperties": { "dropoffLocation": [], "pickupLocation": [] } },

    "ContactPoint": { "label": "Anlaufstelle", "validProperties": { "areaServed": [] } },
    "Place": { "label": "Platz", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
        "Accommodation": { "label": "Unterbringung", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
        "AdministrativeArea": { "label": "Administrative Einheit", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "City": { "label": "Stadt", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "Country": { "label": "Land", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "State": { "label": "Bundesland", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
        "CivicStructure": { "label": "Öffentlicher Ort", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "Airport": { "label": "Flughafen", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "Aquarium": { "label": "Aquarium", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "Beach": { "label": "Strand", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "Bridge": { "label": "Brücke", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "BusStation": { "label": "ZOB", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "BusStop": { "label": "Bushaltestelle", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "Campground": { "label": "Zeltplatz", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "Cemetery": { "label": "Friedhof", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "Crematorium": { "label": "Krematorium", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "EventVenue": { "label": "Veranstaltungsort", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "FireStation": { "label": "Feuerwehr", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "GovernmentBuilding": { "label": "Regierungsgebäude", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "Hospital": { "label": "Krankenhaus", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "MovieTheater": { "label": "Kino", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "Museum": { "label": "Museum", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "MusicVenue": { "label": "Konzerthalle", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "Park": { "label": "Park", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "ParkingFacility": { "label": "Parkplatz", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "PerformingArtsTheater": { "label": "Theater", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "PlaceOfWorship": { "label": "Gedenkstätte", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "Playground": { "label": "Spielplatz", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "PoliceStation": { "label": "Polizeirevier", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "RVPark": { "label": "RVPark", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "StadiumOrArena": { "label": "Stadion oder Arena", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "SubwayStation": { "label": "U-Bahn Station", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "TaxiStand": { "label": "Taxi Stand", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "TrainStation": { "label": "Zughaltestelle", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "Zoo": { "label": "Zoo", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
        "LandmarksOrHistoricalBuildings": { "label": "Sehenswürdigkeit oder Historisches Gebäude", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
        "Landform": { "label": "Landart", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "BodyOfWater": { "label": "Wasser", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "Continent": { "label": "Kontinent", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "Mountain": { "label": "Berg", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "Volcano": { "label": "Vulkan", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
        "LocalBusiness": { "label": "Unternehmen", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "AnimalShelter": { "label": "Tierheim", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "AutomotiveBusiness": { "label": "Autohandel", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "ChildCare": { "label": "Kinderbetreuung", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "Dentist": { "label": "Zahnarzt", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "DryCleaningOrLaundry": { "label": "Waschsalon", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "EmergencyService": { "label": "Notdienst", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "EmploymentAgency": { "label": "Arbeitsagentur", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "EntertainmentBusiness": { "label": "Unterhaltungsgeschäft", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "AdultEntertainment": { "label": "Nur für Erwachsene", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "AmusementPark": { "label": "Erlebnispark", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "ArtGallery": { "label": "Gallerie", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "Casino": { "label": "Casino", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "ComedyClub": { "label": "Comedy Club", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "NightClub": { "label": "Nachtclub", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "FinancialService": { "label": "Finanzdienstleister", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "AccountingService": { "label": "Buchhaltung", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "AutomatedTeller": { "label": "Geldautomat", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "BankOrCreditUnion": { "label": "Bank or Kreditwirtschaft", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "InsuranceAgency": { "label": "Versicherungsgesellschaft", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "FoodEstablishment": { "label": "Lebensmittelgeschäft", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "Bakery": { "label": "Bäckerei", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "BarOrPub": { "label": "Kneipe", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "Brewery": { "label": "Brauerei", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "CafeOrCoffeeShop": { "label": "Kaffee", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "FastFoodRestaurant": { "label": "Imbiss", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "IceCreamShop": { "label": "Eiskaffee", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "Restaurant": { "label": "Restaurant", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "Winery": { "label": "Weingeschäft", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "Distillery": { "label": "Distille", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "GovernmentOffice": { "label": "Regierungsbüro", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "PostOffice": { "label": "Post", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "HealthAndBeautyBusiness": { "label": "Gesundheits und Beauty Geschäft", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "HomeAndConstructionBusiness": { "label": "Haus und Heimwerkerdienst", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "Electrician": { "label": "Elektriker", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "GeneralContractor": { "label": "General Contractor", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "HVACBusiness": { "label": "Heiz- und Kühlsysteme", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "HousePainter": { "label": "Maler", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "Locksmith": { "label": "Schlosserei", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "MovingCompany": { "label": "Umzugsfirma", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "Plumber": { "label": "Klempner", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "RoofingContractor": { "label": "Dachdecker", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "InternetCafe": { "label": "Internet Café", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "LegalService": { "label": "Rechtsberatung", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "Attorney": { "label": "Anwalt", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "Notary": { "label": "Notar", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "Library": { "label": "Bücherei", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "LodgingBusiness": { "label": "Herberge", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "ProfessionalService": { "label": "Professioneller Dienst", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "RadioStation": { "label": "Radiostation", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "RealEstateAgent": { "label": "Immobilienmakler", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "RecyclingCenter": { "label": "Wertstoffhof", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "SelfStorage": { "label": "Mietlager", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "ShoppingCenter": { "label": "Einkaufszentrum", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "SportsActivityLocation": { "label": "Sporthalle", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "BowlingAlley": { "label": "Bowlingbahn", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "ExerciseGym": { "label": "Fitnessstudio", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "HealthClub": { "label": "Fitnesscenter", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "PublicSwimmingPool": { "label": "Schwimmbad", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "SkiResort": { "label": "Ski Resort", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "SportsClub": { "label": "Sportverein", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "TennisComplex": { "label": "Tennishalle", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "Store": { "label": "Geschäft", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "AutoPartsStore": { "label": "Autoteilehandel", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "BikeStore": { "label": "Fahrradhandel", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "BookStore": { "label": "Buchhandel", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "ClothingStore": { "label": "Kleiderhandel", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "ComputerStore": { "label": "Computerhandel", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "ConvenienceStore": { "label": "Mini-Markt", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "DepartmentStore": { "label": "Kaufhaus", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "ElectronicsStore": { "label": "Electronikfachhandel", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "Florist": { "label": "Florist", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "FurnitureStore": { "label": "Möbelgeschäft", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "GardenStore": { "label": "Gartenhandel", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "GroceryStore": { "label": "Lebensmittelgeschäft", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "HardwareStore": { "label": "Baumarkt", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "HobbyShop": { "label": "Hobby Shop", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "HomeGoodsStore": { "label": "Hauswarenhandel", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "JewelryStore": { "label": "Juwelier", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "LiquorStore": { "label": "Schnapsladen", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "MensClothingStore": { "label": "Herrenausstatter", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "MobilePhoneStore": { "label": "Mobilfunkgeschäft", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "MovieRentalStore": { "label": "Videothek", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "MusicStore": { "label": "Plattenladen", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "OfficeEquipmentStore": { "label": "Bürohandel", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "OutletStore": { "label": "Outlet Store", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "PawnShop": { "label": "Leihaus", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "PetStore": { "label": "Tierhandlung", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "ShoeStore": { "label": "Schuhgeschäft", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "SportingGoodsStore": { "label": "Sportladen", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "TireShop": { "label": "Reifenhandel", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "ToyStore": { "label": "Spielzeuggeschäft", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "WholesaleStore": { "label": "Heimwerkermarkt", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "TelevisionStation": { "label": "Fernsehstation", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "TourstInformationCenter": { "label": "Touristen Info", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "TravelAgency": { "label": "Reisebüro", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
        "Residence": { "label": "Residenz", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
        "TouristAttraction": { "label": "Touristen Attraktion", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } }
}

function isValidItemTypeName(typeName) {
    return (validItemTypesDe.hasOwnProperty(typeName))
}

function isValidItemTypeProperty(typeName, geoPropertyName) {
    if (validItemTypesDe.hasOwnProperty(typeName)) {
        var itemType = validItemTypesDe[typeName]
        var props = itemType.validProperties
        for (var pidx in props) {
            if (pidx === geoPropertyName) return true
        }
    }
    return false
}

// This is a duplicate of all Place types in validItemTypes as these all have a "geo" property.
var validPlaceTypes = {
    "Place": { "label": "Place", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
        "Accommodation": { "label": "Accommodation", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
        "AdministrativeArea": { "label": "Administrative Area", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "City": { "label": "City", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "Country": { "label": "Country", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "State": { "label": "State", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
        "CivicStructure": { "label": "Civic Structure", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "Airport": { "label": "Airport", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "Aquarium": { "label": "Aquarium", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "Beach": { "label": "Beach", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "Bridge": { "label": "Bridge", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "BusStation": { "label": "Bus Station", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "BusStop": { "label": "Bus Stop", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "Campground": { "label": "Campground", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "Cemetery": { "label": "Cemetery", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "Crematorium": { "label": "Crematorium", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "EventVenue": { "label": "Event Venue", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "FireStation": { "label": "Fire Station", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "GovernmentBuilding": { "label": "Government Building", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "Hospital": { "label": "Hospital", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "MovieTheater": { "label": "Movie Theater", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "Museum": { "label": "Museum", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "MusicVenue": { "label": "Music Venue", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "Park": { "label": "Park", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "ParkingFacility": { "label": "Parking Facility", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "PerformingArtsTheater": { "label": "Performing Arts Theater", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "PlaceOfWorship": { "label": "Place of Worship", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "Playground": { "label": "Playground", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "PoliceStation": { "label": "Police Station", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "RVPark": { "label": "RVPark", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "StadiumOrArena": { "label": "Stadium or Arena", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "SubwayStation": { "label": "Subway Station", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "TaxiStand": { "label": "Taxi Stand", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "TrainStation": { "label": "Train Station", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "Zoo": { "label": "Zoo", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
        "LandmarksOrHistoricalBuildings": { "label": "Landmarks or Historical Buildings", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
        "Landform": { "label": "Landform", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "BodyOfWater": { "label": "Body of Water", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "Continent": { "label": "Continent", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "Mountain": { "label": "Mountain", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "Volcano": { "label": "Volcano", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
        "LocalBusiness": { "label": "Local Business", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "AnimalShelter": { "label": "Animal Shelter", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "AutomotiveBusiness": { "label": "Automotive Business", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "ChildCare": { "label": "Child Care", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "Dentist": { "label": "Dentist", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "DryCleaningOrLaundry": { "label": "Dry, Cleaning Or Laundry", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "EmergencyService": { "label": "Emergency Service", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "EmploymentAgency": { "label": "Employment Agency", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "EntertainmentBusiness": { "label": "Entertainment Business", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "AdultEntertainment": { "label": "Adult Entertainment", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "AmusementPark": { "label": "Amusement Park", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "ArtGallery": { "label": "Art Gallery", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "Casino": { "label": "Casino", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "ComedyClub": { "label": "Comedy Club", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "NightClub": { "label": "Night Club", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "FinancialService": { "label": "Financial Service", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "AccountingService": { "label": "Accounting Service", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "AutomatedTeller": { "label": "Automated Teller", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "BankOrCreditUnion": { "label": "Bank or Credit Union", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "InsuranceAgency": { "label": "Insurance Agency", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "FoodEstablishment": { "label": "Food Establishment", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "Bakery": { "label": "Bakery", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "BarOrPub": { "label": "Bar or Pub", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "Brewery": { "label": "Brewery", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "CafeOrCoffeeShop": { "label": "Cafe or Coffee Shop", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "FastFoodRestaurant": { "label": "Fast Food Restaurant", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "IceCreamShop": { "label": "Ice Cream Shop", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "Restaurant": { "label": "Restaurant", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "Winery": { "label": "Winery", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "Distillery": { "label": "Distillery", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "GovernmentOffice": { "label": "Government Office", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "PostOffice": { "label": "Post Office", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "HealthAndBeautyBusiness": { "label": "Health and Beauty Business", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "HomeAndConstructionBusiness": { "label": "Home and Construction Business", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "Electrician": { "label": "Electrician", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "GeneralContractor": { "label": "General Contractor", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "HVACBusiness": { "label": "HVAC Business", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "HousePainter": { "label": "House Painer", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "Locksmith": { "label": "Locksmith", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "MovingCompany": { "label": "Moving Company", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "Plumber": { "label": "Plumber", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "RoofingContractor": { "label": "Roofing Contractor", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "InternetCafe": { "label": "Internet Cafe", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "LegalService": { "label": "Legal Service", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "Attorney": { "label": "Attorney", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "Notary": { "label": "Notary", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "Library": { "label": "Library", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "LodgingBusiness": { "label": "Lodging Business", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "ProfessionalService": { "label": "Professional Service", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "RadioStation": { "label": "Radio Station", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "RealEstateAgent": { "label": "Real Estate Agent", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "RecyclingCenter": { "label": "Recycling Center", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "SelfStorage": { "label": "Self Storage", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "ShoppingCenter": { "label": "Shopping Center", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "SportsActivityLocation": { "label": "Sports Activity Location", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "BowlingAlley": { "label": "Bowling Alley", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "ExerciseGym": { "label": "Exercise Gym", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "HealthClub": { "label": "Health Club", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "PublicSwimmingPool": { "label": "Public Swimming Pool", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "SkiResort": { "label": "Ski Resort", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "SportsClub": { "label": "Sports Club", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "TennisComplex": { "label": "Tennis Complex", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "Store": { "label": "Store", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "AutoPartsStore": { "label": "Auto Parts Store", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "BikeStore": { "label": "Bike Store", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "BookStore": { "label": "Book Store", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "ClothingStore": { "label": "Clothing Store", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "ComputerStore": { "label": "Computer Store", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "ConvenienceStore": { "label": "Convenience Store", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "DepartmentStore": { "label": "Department Store", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "ElectronicsStore": { "label": "Electronics Store Service", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "Florist": { "label": "Florist", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "FurnitureStore": { "label": "Furniture Store", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "GardenStore": { "label": "Garden Store", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "GroceryStore": { "label": "Grocery Store", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "HardwareStore": { "label": "Hardware Store", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "HobbyShop": { "label": "Hobby Shop", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "HomeGoodsStore": { "label": "Home Goods Store", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "JewelryStore": { "label": "Jewelry Store", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "LiquorStore": { "label": "Liquor Store", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "MensClothingStore": { "label": "Mens Clothing Store", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "MobilePhoneStore": { "label": "Mobile Phone Store", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "MovieRentalStore": { "label": "Movie Rental Store", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "MusicStore": { "label": "Music Store", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "OfficeEquipmentStore": { "label": "Office Equipment Store", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "OutletStore": { "label": "Outlet Store", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "PawnShop": { "label": "Pawn Shop", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "PetStore": { "label": "Pet Store", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "ShoeStore": { "label": "Shoe Store", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "SportingGoodsStore": { "label": "Sporting Goods Store", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "TireShop": { "label": "Tire Shop", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "ToyStore": { "label": "Toy Store", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
                "WholesaleStore": { "label": "Wholesale Store", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "TelevisionStation": { "label": "Television Station", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "TourstInformationCenter": { "label": "Tourst Information Center", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
            "TravelAgency": { "label": "Travel Agency", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
        "Residence": { "label": "Residence", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
        "TouristAttraction": { "label": "Tourist Attraction", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } }
}

function hasGeoProperty(typeName) {
    return (validPlaceTypes.hasOwnProperty(typeName))
}

// ### Add itemtype names representing valid values for each of this prop.
var validPlaceProperties = {
    "areaServed": {},
    "availableAtOrFrom": {},
    "birthPlace": {},
    "containedInPlace": {},
    "containsPlace": {},
    "contentLocation": {},
    "deathPlace": {},
    "dropoffLocation": {},
    "eligibleRegion": {},
    "exerciseCourse": {},
    "foodEstablishment": {},
    "foundingLocation": {},
    "fromLocation": {},
    "gameLocation": {},
    "geo": {},
    "geographicArea": {},
    "hasPOS": {},
    "homeLocation": {},
    "ineligibleRegion": {},
    "jobLocation": {},
    "location": {},
    "locationCreated": {},
    "pickupLocation": {},
    "regionsAllowed": {},
    "serviceLocation": {},
    "spatialCoverage": {},
    "toLocation": {},
    "workLocation": {}
}

function isValidPlaceProperty(geoPropertyName) {
    return (validPlaceProperties.hasOwnProperty(geoPropertyName))
}


})()
