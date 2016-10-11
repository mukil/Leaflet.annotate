
var tileLayerURL = 'https://api.tiles.mapbox.com/v4/maltwisney.91ae9b43/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFsdHdpc25leSIsImEiOiJlODg3M2M5YzFhY2Y2NWMzMmE0Nzk1YWNjMWYwN2U0ZCJ9.b_4gukx7cUR4-spxHbj_Kw'
var map, tileLayer, statesBoundaries, newYorkCityMarker, poemMarker, bernieSanders, googleInc, featureGroup;

function setup_map() {

	map = L.map('map')
	tileLayer = L.tileLayer(tileLayerURL, {
		maxZoom: 12, minZoom: 2,
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
		'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
		'Imagery © <a href="http://mapbox.com">Mapbox</a>',
		id: 'mapbox.light'
	})

	newYorkCityMarker = L.marker([40.573112, -73.980740], { itemtype: 'City', title: 'New York City Center', domId: 'nyc'})
		.bindPopup("Coney Island - NYC", {
			itemtype: 'Article', title: 'Quiet Coney Island', geoprop: 'contentLocation',
			description: 'New York Today - Good Morning on this springlike Wednesday.',
			url: 'http://www.nytimes.com/2016/03/09/nyregion/new-york-today-coney-island-off-season.html?_r=0'
		}).openPopup()
	poemMarker = L.circleMarker([40.573112, -73.980740], { itemtype: 'CreativeWork', geoprop: 'locationCreated', // geoprop: 'contentLocation',
		title: 'The circle marker indicating geographically where this meta poem was conceived.'
	})
	bernieSanders = L.circleMarker([44.478344, -73.213295], { itemtype: 'Person',
		geoprop: 'workLocation', title: 'Bernie Sanders.',
		description: 'Running for the White House, USA - Democratic Presidential Candidate 2016',
		sameAs: 'https://www.wikidata.org/wiki/Q359442'
	})
	googleInc = L.circleMarker([37.422436, -122.084057], { itemtype: 'Organization', title: 'Google Inc', geoprop: 'location' })
	featureGroup = L.featureGroup([newYorkCityMarker, poemMarker, bernieSanders, googleInc])
	tileLayer.addTo(map)
	featureGroup.addTo(map)

	$.getJSON('test-geometries/admin0_poly.json', function(response) {
		statesBoundaries = L.geoJson(response, {
			itemtype: 'Country', title: 'Charmingly Inaccurate - United States of America',
			description: 'A caricature of the lower 48 United States, this linework set is recognizable and friendly, but not concerned with such stuffy notions as “cartographic accuracy.” It’s that friend you have who’s always embellishing his stories. You never mind his lying, though, because the exaggerations make things more fun. Go ahead, enjoy the story your map is telling. (Version 1.1)', creator: 'Daniel P. Huffmann', publisher: 'Daniel P. Huffmann',
			published: '10/04/2013', modified: '10/04/2013', created: '3/24/2013', rights: 'Public Domain',
			derivedFrom: 'Derived from a 1920 broadside map entitled “The Rights of the People—Women are People: Suffrage Victory Map.” Equal Suffrage League of Virginia Papers, Acc. 22002, Library of Virginia.',
			url: 'https://github.com/mapsam/project-linework/tree/master/linework-sets/charmingly-inaccurate'
		}).addTo(map)
		statesBoundaries.annotate()
	})
	
	map.setView(newYorkCityMarker._latlng, 4)

	// --- Defused Work in Progress  ---
	// L.readerPlugin(map)
	map.addControl(L.control.annotationViewer())

	// --- Layout Helpers ---
	$('#map').css('height', window.innerHeight + 'px')
	$(window).resize(function(e) { $('#map').css('height', window.innerHeight + 'px') })
	// --- Debug Helpers
	// map.on('click', function(e) { console.log("Map Clicked", e.latlng) })
	// setTimeout(function(e){  map.removeLayer(statesBoundaries) }, 5000) */

	var imageUrl = 'http://www.lib.utexas.edu/maps/historical/newark_nj_1922.jpg',
		imageBounds = [[40.712216, -74.22655], [40.773941, -74.12544]];

	L.imageOverlay(imageUrl, imageBounds, {"itemtype": "CreativeWork", "geoprop": "contentLocation"}).addTo(map);

	function adjust_map_view() {
		var evt = document.createEvent('UIEvents')
		evt.initUIEvent('resize', true, false, window,0)
		window.dispatchEvent(evt)
	}

	adjust_map_view()

}
