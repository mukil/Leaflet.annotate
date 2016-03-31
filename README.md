
## Leaflet.annnotate

A plugin for [LeafletJS](http://github.com/Leaflet/Leaflet) based web-maps allowing authors of geographical web maps to publish the contents of their web map as a structured, accessible and thus re-usable part of their HTML Document. We therefore currently rely on integrating the public [Schema.org vocabulary](http://schema.org) exposing the contents of our maps as an order-less list of distinct but _typed_ entities.

We furthermore aim to employ and revise the markup generated around core mapping elements (LeafletJS: Marker, Popup and Overlay) according to our investigations of the [Dublin Core Metadata Element Set](http://dublincore.org/documents/dcmi-terms/) and/or through relying on parts of the current [HTML Standard](https://html.spec.whatwg.org/multipage/semantics.html).

The envisioned application for revised markup in geographic web maps is (besides all third-party use cases enabled through providing structured data):<br/>A digital map legend interactively assisting users in analyzing the contents and the scope of so called ``map mashups''.

### Implementation Notes

To annotate SVG Elements we introduce a `metadata` Element next to the respective `path`. In practice both are often grouped within a `g` element. All Schema.org and Dublin Core based annotation values are attributes of a `meta` element.

Maps rendered in the **Internet Explorer** along with _VML_ is currently **not supported** when deploying Leaflet.annnotate.

At the moment all geographic annotations (of types which are not a sub-type of _Place_) are done through introducing an extra _Place_ element (and are not possible using just a _GeoShape_).

Curently all

### Terms Currently Supported

A Leaflet _Marker_, a _CircleMarker_ and at least a _GeoJSON File_ can be annotated in HTML with metadata trough passing one or all of the following _key:value_ pairs into the elements resp. `options' object during creation:

| Option   | Expected Value |
|----------|:-------------:|
| `itemtype` (Mandatory) | A Schema.org Type Name (URL conform String value, without spaces):<br/>"[Place](http://schema.org/Place)" (including all subtypes)<br/>"[CreativeWork](http://schema.org/CreativeWork)" (Article, Blog, Book, Comment, Sculpture),<br/>"[Person](http://schema.org/Person)"<br/>"[Organization](http://schema.org/Organization) (Corporation, EducationalOrganization, GovernmentalOrganization, NGO, LocalBusiness)"<br/>"[Product](http://schema.org/Product) (IndividualProduct)"<br/>"[Event](http://schema.org/Event)" |
| `geoprop` (Optional) | "geo" (default, valid for all subtypes of _Place_)<br/>"location" (_Organisation_)<br/>"contentLocation" (_CreativeWork_), "locationCreated" (_CreativeWork_)<br/>To be documented|

### Examples - Building anotations using the API

Annotating simple Leaflet Marker (IMG) representing all subtypes of [Place](http://schema.org/Place), in the following lines the [City](http://schema.org/City) of New York.
<pre>
var marker = L.marker([40.573112, -73.980740], { itemtype: 'City', title: 'New York City'})
</pre>

This also exposes your markers location values as machine readable [GeoCoordinates](http://schema.org/GeoCoordinates) values in HTML.

Annotating a simple Leaflet Circle Marker (SVG) as representing a [Creative Work](http://schema.org/CreativeWork), virtual Poem.
Automatically exposes this markers location value as machine readable [GeoCoordinates](http://schema.org/GeoCoordinates).
<pre>
var circleMarker = L.circleMarker([40.573112, -73.980740], { itemtype: 'CreativeWork', geoprop: 'locationCreated'
    title: 'The circle marker stating where this meta poem was created.'
})
</pre>

Annotating a group of geometries (SVG) representing all subtypes of an [Administrative Area](http://schema.org/AdministrativeArea), in this case the [Country](http://schema.org/Country) United States.
Exposes this polygons location values as machine readable [GeoShape](http://schema.org/GeoShape).
<pre>
var statesBoundaries = L.geoJson(response, { itemtype: 'Administrative Area',
    title: 'United States of America'
}).addTo(map)
// We must call annotate() explicitly on geographical Overlays such as this GeoJSON Layer
statesBoundaries.annotate()
</pre>

### Release History

0.3, *Upcoming*

 * Annotatables: Marker, CircleMarker, GeoJSON Layer (Popup, DivMarker)
 * Compatible with LeafletJS 0.7.3

Author:<br/>
Malte Reißig (2016

