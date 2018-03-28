var tileLayerURL = 'https://api.tiles.mapbox.com/v4/maltwisney.0985a8f8/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFsdHdpc25leSIsImEiOiJlODg3M2M5YzFhY2Y2NWMzMmE0Nzk1YWNjMWYwN2U0ZCJ9.b_4gukx7cUR4-spxHbj_Kw'

var map, tileLayer, featureGroup
var sculptureMarkerOptions = { weight: 2, opacity: 0.6, fillColor: "#a9a9a9", fillOpacity: 0.2, lineCap: 'square', color : "#8f1414" }

function setup_map() {

	map = L.map('map')

	tileLayer = L.tileLayer(tileLayerURL, {
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
		'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
		'Imagery © <a href="http://mapbox.com">Mapbox</a>',
		id: 'mapbox.light'
	})
	tileLayer.addTo(map)

	map.setView(L.latLng([48.8518, 2.3391]), 13)

	// --- Defused Work in Progress  ---
	// L.readerPlugin(map)
	// map.addControl(L.control.annotationViewer())

	// --- Layout Helpers ---
	$('#map').css('height', window.innerHeight + 'px')
	$(window).resize(function(e) { $('#map').css('height', window.innerHeight + 'px') })

	featureGroup = L.featureGroup().addTo(map)

	// --- Map Data Setup
	wd.load_public_sculptures_in_paris(function(sculpturesInParis) {
		console.log("Wikidata SPARQL Query Successfull", sculpturesInParis)
		for (var scidx in sculpturesInParis.results.bindings) {
			var wikidataSculptureData = sculpturesInParis.results.bindings[scidx]
			if (wikidataSculptureData.coord && wikidataSculptureData.image) {
				var sculpture = create_sculpture_map_element(wikidataSculptureData)
				sculpture.addTo(featureGroup)
			}
		}
	}, function(error) {
		console.warn("Wikidata SPARQL Query FAILED", error)
	})

	map.on('zoomend', function(event) {
		var newLevel = event.target._zoom
		if (newLevel > 16) {
			console.log('Map Zoom Level Changed', newLevel, "New Circle Marker Radius", 10)
			featureGroup.eachLayer(function (layer) { layer.setRadius(10) })
		} else if (newLevel > 15) {
			console.log('Map Zoom Level Changed', newLevel, "New Circle Marker Radius", 7)
			featureGroup.eachLayer(function (layer) { layer.setRadius(7) })
		} else if (newLevel > 14) {
			console.log('Map Zoom Level Changed', newLevel, "New Circle Marker Radius", 4)
			featureGroup.eachLayer(function (layer) { layer.setRadius(4) })
		} else if (newLevel <= 14) {
			console.log('Map Zoom Level Changed', newLevel, "New Circle Marker Radius", 3)
			featureGroup.eachLayer(function (layer) { layer.setRadius(4) })
		}
	})

	function create_sculpture_map_element(wikidataSculptureData) {
		// L.circleMarker
		var geosparqlPoint = wikidataSculptureData.coord.value.substr(6)
			geosparqlPoint = geosparqlPoint.substr(0, geosparqlPoint.length - 1)
		var coordinates = L.latLng(geosparqlPoint.split(" ")[1], geosparqlPoint.split(" ")[0])
		var photo = wikidataSculptureData.image
		var yearCreated = wikidataSculptureData.AnneeCreation
		var createur = wikidataSculptureData.createur
		var popupSourceLink = 'Source: <a target="_blank" '
			+ 'href="'+wikidataSculptureData.item.value+'" title="Opens page in new window">Wikidata</a>'
		var popupTitle = wikidataSculptureData.title.value
		var popupSubtitle = ''
		var photoValueHTTPS = photo.value.replace("http://", "https://")
		if (yearCreated) popupSubtitle += 'Annee Creation: '+ yearCreated.value
		if (yearCreated && createur) popupSubtitle += ', '
		if (createur) popupSubtitle += createur.value
		var popupContent = '<h3>' + popupTitle + '</h3>' + popupSubtitle + '<p><img src="'+photoValueHTTPS+'"><br/>'+popupSourceLink+'</p>'
		var sculpture = L.circleMarker(coordinates, sculptureMarkerOptions).setRadius(3)
			.bindPopup(popupContent, { keepInView: true, className: 'sculpture-photo', maxWidth: "auto"})
		L.Util.setOptions(sculpture, { alt: "Place of a sculpture named " + popupTitle, itemtype: 'Photograph', geoprop: 'contentLocation', url: photoValueHTTPS, title: 'Picture of ' + popupTitle })
		return sculpture
		/** L.Marker: var sculpture = L.marker(coordinates, { title: wikidataSculptureData.title.value,
				itemtype: 'CreativeWork', geoprop: 'contentLocation'
		}).bindPopup(popupContent, { keepInView: true, className: 'sculpture-photo', maxWidth: "auto"})**/
		/** L.ImageOveraly: imageBounds = [[40.712216, -74.22655], [40.773941, -74.12544]]; */
		// L.imageOverlay(imageUrl, imageBounds, {"itemtype": "CreativeWork", "geoprop": "contentLocation"}).addTo(map); */
	}

	function adjust_map_view() {
		var evt = document.createEvent('UIEvents')
		evt.initUIEvent('resize', true, false, window,0)
		window.dispatchEvent(evt)
	}

	adjust_map_view()

}

