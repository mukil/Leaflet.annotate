
## Leaflet.annnotate

A plugin for [LeafletJS](http://github.com/Leaflet/Leaflet) based web-maps allowing authors of geographical web maps to publish the contents of their web map as structured and accessible data. We therefore rely on integrating the public [Schema.org vocabulary](http://schema.org) exposing the contents of our maps as an unordered list of distinct and typed entities.

We furthermore aim to employ and revise the markup generated around the distinct entities (Marker, Popup and Overlay) according to our investigations of the [Dublin Core Metadata Element Set](http://dublincore.org/documents/dcmi-terms/) and/or through relying on parts of the current [HTML Standard](https://html.spec.whatwg.org/multipage/semantics.html).

My envisioned application for revised markup in geographic web maps is (besides all the nice side-effects coming with structured data):<br/>
An digital map legend interactively assisting users in analyzing the contents and the scope of so called ``map mashups''.

### Implementation Notes

To annotate SVG Elements we introduce a `metadata` Element next to the respective `path`. In practice both are often grouped within a `g` element.

Maps rendered in the _Internet Explorer_ along with _VML_ is currently _not supported_ when deploying Leaflet.annnotate.

### Terms Currently Supported

| HTML Marker   |      SVG Marker and Geometric Overlays      |  HTML Popups |
|----------|:-------------:|------:|
| Place, City (with GeoCoordinates) |  AdministrativeArea (with GeoShape)<br/>CreativeWork, Place (with GeoCoordinates) | None yet |

### Building Annotations

Annotating simple Leaflet Marker (IMG) representing a [Place](http://schema.org/Place) in the [City](http://schema.org/City) of New York.
Automatically exposes this markers location values as machine readable [GeoCoordinates](http://schema.org/GeoCoordinates).
<pre>
var marker = L.marker([40.573112, -73.980740], { itemtype: 'Place', title: 'New York City'})
</pre>

Annotating a simple Leaflet Circle Marker (SVG) as representing a [Creative Work](http://schema.org/CreativeWork), virtual Poem.
Automatically exposes this markers location value as machine readable [GeoCoordinates](http://schema.org/GeoCoordinates).
<pre>
var circleMarker = L.circleMarker([40.573112, -73.980740], { itemtype: 'CreativeWork'
    title: 'The circle marker locating this meta poem geographically.'
})
</pre>

Annotating a group of geometries (SVG) as representing the [Administrative Area](http://schema.org/AdministrativeArea) of the United States.
Exposes this polygons location values as machine readable [GeoShape](http://schema.org/GeoShape).
<pre>
var statesBoundaries = L.geoJson(response, { itemtype: 'Administrative Area',
    title: 'United States of America'
}).addTo(map)
// Geographical Overalys such as a GeoJSON Layer must be annotated explicitly
statesBoundaries.annotate()
</pre>

### Status

 * Proof of concept integrated with the Leaflet API

Author:
Malte Reißig, February, 08 2016

