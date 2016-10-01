
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
    _createMetaElement: function(key, value) {
        var el = document.createElement('meta')
            el.setAttribute(key, value)
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
            this._buildGenericProperties(metadata, this)
            var placeAnnotation = undefined
            if (hasLatLngValuePair && !hasBoundingBox) {
                placeAnnotation = this._buildGeoAnnotation('div', this, 'point', geoPropertyName)
            } else if (hasBoundingBox) {
                placeAnnotation = this._buildGeoAnnotation('div', this, 'box', geoPropertyName)
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
                    //console.log("   SVG Leaflet Geometry Group, LeafletID", element['_leaflet_id'], element)
                    metadata = this._buildAnnotationsContainer('metadata', domId, element['_leaflet_id'])
                    this._buildGenericProperties(metadata, this)
                    var place = this._buildGeoAnnotation('g', element, 'shape', geoPropertyName)
                    metadata.appendChild(place)
                    containerElement.appendChild(metadata)
                }
                metadata = undefined // notes that metadata elements have been already appended to the DOM
            } else {
                // 2.2) Build annotations for an SVG Based Element (ONE WITHOUT MULTIPLE LAYERS)
                // console.log("Single SVG Element Annotations", this.options.itemtype, "SVG Element" + ", LeafletID", leafletId, this)
                metadata = this._buildAnnotationsContainer('metadata', domId, leafletId)
                this._buildGenericProperties(metadata, this)
                var place = this._buildGeoAnnotation('g', this, 'point', geoPropertyName)
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
    _buildGenericProperties: function(parentElement, object) {
        // Maps Leaflet.annotate options to Schema.org and Dublin Core Element Names
        if (object.options.hasOwnProperty('title')) {
            this._appendMetaItempropContent(parentElement, 'name', object.options.title)
        }
        if (object.options.hasOwnProperty('description')) {
            this._appendMetaItempropContent(parentElement, 'description', object.options.description)
        }
        if (object.options.hasOwnProperty('url')) {
            this._appendMetaItempropContent(parentElement, 'url', object.options.url)
        }
        if (object.options.hasOwnProperty('sameAs')) {
            this._appendMetaItempropContent(parentElement, 'sameAs', object.options.sameAs)
        }
        if (object.options.hasOwnProperty('alternateName')) {
            this._appendMetaItempropContent(parentElement, 'alternateName', object.options.alternateName)
        }
        if (object.options.hasOwnProperty('image')) {
            this._appendMetaItempropContent(parentElement, 'image', object.options.image)
        }
        // Dublin Core Legacy Namespace: http://purl.org/dc/elements/1.1 "dc:xyz"
        // Without: Title, Description, Subject, Type and Coverage) and a Duplicate with Thing: sameAs == identifier
        if (object.options.hasOwnProperty('creator')) {
            this._appendMetaNameContent(parentElement, 'http://purl.org/dc/elements/1.1/creator', object.options.creator)
        }
        if (object.options.hasOwnProperty('contributor')) {
            this._appendMetaNameContent(parentElement, 'http://purl.org/dc/elements/1.1/contributor', object.options.contributor)
        }
        if (object.options.hasOwnProperty('publisher')) {
            this._appendMetaNameContent(parentElement, 'http://purl.org/dc/elements/1.1/publisher', object.options.publisher)
        }
        if (object.options.hasOwnProperty('published')) {
            this._appendMetaNameContent(parentElement, 'http://purl.org/dc/elements/1.1/date', object.options.published)
        }
        if (object.options.hasOwnProperty('identifier')) {
            this._appendMetaNameContent(parentElement, 'http://purl.org/dc/elements/1.1/identifier', object.options.identifier)
        }
        if (object.options.hasOwnProperty('rights')) {
            this._appendMetaNameContent(parentElement, 'http://purl.org/dc/elements/1.1/rights', object.options.rights)
        }
        if (object.options.hasOwnProperty('derivedFrom')) {
            this._appendMetaNameContent(parentElement, 'http://purl.org/dc/elements/1.1/source', object.options.derivedFrom)
        }
        if (object.options.hasOwnProperty('format')) {
            this._appendMetaNameContent(parentElement, 'http://purl.org/dc/elements/1.1/format', object.options.format)
        }
        if (object.options.hasOwnProperty('language')) {
            this._appendMetaNameContent(parentElement, 'http://purl.org/dc/elements/1.1/language', object.options.language)
        }
        // Terms Namespace http://purl.org/dc/terms/    "dcterms:xyz"
        if (object.options.hasOwnProperty('created')) {
            this._appendMetaNameContent(parentElement, 'http://purl.org/dc/terms/created', object.options.created)
        }
        if (object.options.hasOwnProperty('modified')) {
            this._appendMetaNameContent(parentElement, 'http://purl.org/dc/terms/modified', object.options.modified)
        }
    },
    _appendMetaNameContent: function(parent, elementName, elementTextContent) {
        var valueElement = this._createMetaElement('name', elementName)
            valueElement.setAttribute('content', elementTextContent)
        parent.appendChild(valueElement)
    },
    _appendMetaItempropContent: function(parent, elementName, elementTextContent) {
        var valueElement = this._createMetaElement('itemprop', elementName)
            valueElement.setAttribute('content', elementTextContent)
        parent.appendChild(valueElement)
    },
    _buildGeoAnnotation: function(element, object, geoType, geoPropertyName) {
        if (typeof element != 'object') {
            element = document.createElement(element)
        }
        // console.log("Building Geo Annotation", object.options.itemtype, geoType, geoPropertyName)
        // --- Here we know the entity to annotate has the "geo"-property
        if (hasGeoProperty(object.options.itemtype)) {
            element.setAttribute('itemprop', geoPropertyName)
            this._buildGeographicIndicators(element, geoType, object)
        // --- Here we know that the type has a property defined which can handle a "Place" as its value
        // --- ### Also allow for geographic annotation with not only Place but, e.g its subtypes, like
        // --- "AdministrativeArea" or other types "GeoShape", "GeoCoordinate" or simply "Text"
        } else if (isValidPlaceProperty(geoPropertyName)) {
            element.setAttribute('itemscope','')
            element.setAttribute('itemtype', 'http://schema.org/Place')
            element.setAttribute('itemprop', geoPropertyName)
            var geoElement = this._createGroupingElement(element.localName, 'itemprop', 'geo')
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

var validItemTypesEn = {
    "Organization": { "label": "Organization", "validProperties": { "areaServed": [], "foundingLocation": [], "hasPOS": [], "location": [] } },
        "Airline": { "label": "Airline", "validProperties": { "areaServed": [], "foundingLocation": [], "hasPOS": [], "location": [] } },
        "Corporation": { "label": "Corporation", "validProperties": { "areaServed": [], "foundingLocation": [], "hasPOS": [], "location": [] } },
        "EducationalOrganization": { "label": "Educational Organization", "validProperties": { "areaServed": [], "foundingLocation": [], "hasPOS": [], "location": [] } },
            "CollegeOrUniversity": { "label": "College or University", "validProperties": { "areaServed": [], "foundingLocation": [], "hasPOS": [], "location": [] } },
            "ElementarySchool": { "label": "Elementary School", "validProperties": { "areaServed": [], "foundingLocation": [], "hasPOS": [], "location": [] } },
            "HighSchool": { "label": "High School", "validProperties": { "areaServed": [], "foundingLocation": [], "hasPOS": [], "location": [] } },
            "MiddleSchool": { "label": "Middle School", "validProperties": { "areaServed": [], "foundingLocation": [], "hasPOS": [], "location": [] } },
            "Preschool": { "label": "Preschool", "validProperties": { "areaServed": [], "foundingLocation": [], "hasPOS": [], "location": [] } },
            "School": { "label": "School", "validProperties": { "areaServed": [], "foundingLocation": [], "hasPOS": [], "location": [] } },
        "GovernmentalOrganization": { "label": "Governmental Organization", "validProperties": { "areaServed": [], "foundingLocation": [], "hasPOS": [], "location": [] } },
        "MedicalOrganization": { "label": "Medical Organization", "validProperties": { "areaServed": [], "foundingLocation": [], "hasPOS": [], "location": [] } },
        "NGO": { "label": "Non-Governmental Organization", "validProperties": { "areaServed": [], "foundingLocation": [], "hasPOS": [], "location": [] } },
        "PerformingGroup": { "label": "Performing Group", "validProperties": { "areaServed": [], "foundingLocation": [], "hasPOS": [], "location": [] } },
        "SportsOrganization": { "label": "Sports Organization", "validProperties": { "areaServed": [], "foundingLocation": [], "hasPOS": [], "location": [] } },

    "CreativeWork": { "label": "Creative Work", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "Article": { "label": "Article", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "Blog": { "label": "Blog", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "Book": { "label": "Book", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "Clip": { "label": "Clip", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "Comment": { "label": "Comment", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "Conversation": { "label": "Conversation", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "CreativeWorkSeason": { "label": "Creative Work Season", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "CreativeWorkSeries": { "label": "Creative Work Series", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "DataCatalog": { "label": "Data Catalog", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "Dataset": { "label": "Dataset", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "DigitalDocument": { "label": "Digital Document", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "Episode": { "label": "Episode", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "Game": { "label": "Game", "validProperties":  { "contentLocation": [], "locationCreated": [], "spatialCoverage": [], "gameLocation": [] } },
        "MediaObject": { "label": "Media Object", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [], "regionsAllowed": [] } },
        "AudioObject": { "label": "Audio Object", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [], "regionsAllowed": [] } },
        "ImageObject": { "label": "Image Object", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [], "regionsAllowed": [] } },
        "Map": { "label": "Map", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "Movie": { "label": "Movie", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "MusicComposition": { "label": "Music Composition", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "MusicPlaylist": { "label": "Music Playlist", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "MusicRecording": { "label": "Music Recording", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "Painting": { "label": "Painting", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "Photograph": { "label": "Photograph", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "PublicationIssue": { "label": "Publication Issue", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "PublicationVolume": { "label": "Publication Volume", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "Question": { "label": "Question", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "Recipe": { "label": "Recipe", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "Review": { "label": "Review", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "Sculpture": { "label": "Sculpture", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "Series": { "label": "Series", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "SoftwareApplication": { "label": "Software Application", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "TVSeason": { "label": "TV Season", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "TVSeries": { "label": "TV Series", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "SoftwareSourceCode": { "label": "Software Source Code", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "VisualArtwork": { "label": "Visual Artwork", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "WebPage": { "label": "Webpage", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },
        "WebSite": { "label": "Website", "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] } },

    "Person": { "label": "Person", "validProperties": { "birthPlace": [], "deathPlace": [], "hasPOS": [], "homeLocation": [], "workLocation": [] } },

    "Intangible": { "label": "Intangible", "validProperties": {} },
        "AlignmentObject": { "label": "Alignment Object", "validProperties": {} },
        "Audience": { "label": "Audience", "validProperties": { "geographicArea": [ "AdministrativeArea" ] } },
        "BedDetails": { "label": "Bed Details", "validProperties": {} },
        "Brand": { "label": "Brand", "validProperties": {} },
        "BroadcastChannel": { "label": "Broadcast Channel", "validProperties": {} },
        "BusTrip": { "label": "Bus Trip", "validProperties": { "arrivalBusStop": [ "BusStop", "BusStation" ], "departureBusStop": [ "BusStop", "BusStation" ] } },
        "ComputerLanguage": { "label": "Computer Language", "validProperties": {} },
        "DataFeedItem": { "label": "Data Feed Item", "validProperties": {} },
        "Demand": { "label": "Demand", "validProperties": { "areaServed": [ "AdministrativeArea", "GeoShape", "Place", "Text" ], "availableAtOrFrom": [], "eligibleRegion": [ "GeoShape", "Place", "Text" ], "ineligibleRegion": [ "GeoShape", "Place", "Text" ] } },

        "DigitalDocumentPermission": { "label": "Digital Document Permission", "validProperties": {} },
        "EntryPoint": { "label": "Entry Point", "validProperties": {} },

        "Enumeration": { "label": "Enumeration", "validProperties": {} },
        "Flight": { "label": "Flight", "validProperties": {} },
        "GameServer": { "label": "Game Server", "validProperties": {} },
        "Invoice": { "label": "Invoice", "validProperties": {} },
        "ItemList": { "label": "Item List", "validProperties": {} },

        "JobPosting": { "label": "Job Posting", "validProperties": { "jobLocation": [] } },

        "Language": { "label": "Language", "validProperties": {} },
        "Offer": { "label": "Offer", "validProperties": {} },
        "Order": { "label": "Order", "validProperties": {} },
        "OrderItem": { "label": "Order Item", "validProperties": {} },
        "ParcelDelivery": { "label": "Parcel Delivery", "validProperties": {} },
        "Permit": { "label": "Permit", "validProperties": {} },
        "ProgramMembership": { "label": "Program Membership", "validProperties": {} },
        "PropertyValueSpecification": { "label": "Property Value Specification", "validProperties": {} },
        "Quantity": { "label": "Quantity", "validProperties": {} },
        "Rating": { "label": "Rating", "validProperties": {} },
        "Reservation": { "label": "Reservation", "validProperties": {} },
        "Role": { "label": "Role", "validProperties": {} },
        "Seat": { "label": "Seat", "validProperties": {} },
        "Service": { "label": "Service", "validProperties": {} },
        "ServiceChannel": { "label": "Service Channel", "validProperties": {} },
        "StructuredValue": { "label": "Structured Value", "validProperties": {} },
        "Ticket": { "label": "Ticket", "validProperties": {} },
        "TrainTrip": { "label": "Train Trip", "validProperties": { "arivalStation": ["TrainStation"], "departureStation": ["TrainStation"] } },


    "Action": { "label": "Action", "validProperties": { "location": [] } },

    "Event": { "label": "Event", "validProperties": { "location": [] } },

    "ExerciseAction": { "label": "Excercise Action", "validProperties": { "fromLocation": [], "toLocation": [] } },
    "MoveAction": { "label": "Move Action", "validProperties": { "fromLocation": [], "toLocation": [] } },
    "TransferAction": { "label": "Transfer Action", "validProperties": { "fromLocation": [], "toLocation": [] } },

    "RentalCarReservation": { "label": "Rental Car Reservation", "validProperties": { "dropoffLocation": [], "pickupLocation": [] } },

    "ContactPoint": { "label": "Contact Point", "validProperties": { "areaServed": [] } },
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

function isValidItemTypeName(typeName) {
    return (validItemTypesEn.hasOwnProperty(typeName))
}

function isValidItemTypeProperty(typeName, geoPropertyName) {
    if (validItemTypesEn.hasOwnProperty(typeName)) {
        var itemType = validItemTypesEn[typeName]
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
