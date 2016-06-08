
## Leaflet.annnotate

A [LeafletJS](http://github.com/Leaflet/Leaflet) (0.7.x) extension for map makers facilitating the accessible publication of elements in geographical web maps. Using the functionality of this plugin will make the contents of your map more accessible for major search engine algorithms and other applications. Emplying Leaflet.annotate, in the end, will allow you to easily annotate elements in your map with the [Schema.org](http://schema.org) vocabulary and thus make them re-usable and independent items of information ("Things").

Leaflet.annotate can translate your geodata into "more meaningful" hypertext markup and thus has the potential to integrate elements of your geographical web map into the web of data. It frees you to write markup that is compliant with the latest of [Living HTML](https://html.spec.whatwg.org/multipage/semantics.html), [SVG Standard 1.1. 2nd Edition](https://www.w3.org/TR/SVG/) while integrating the general resource descriptions vocabularies Schema.org and the [Dublin Core Metadata Element Set](http://dublincore.org/documents/dces/) into your web map. Furthermore (as it defines an API) it allows developers to build all kinds of crazy things for all kinds of LeafletJS based geographical web maps. And no, this is not intended for helping you to annotate elements of your next "statistical geovisual analytics" or your next "big data geoweb map" app. It is intended to support web map making as an information organization practice.

Feedback and contributions are very welcome.<br/>
Cheers!

### API

The following API options are available on standard Leaflet *Marker*, *CircleMarker* and at least a *GeoJSON Layer*. All these three type of overlays can be annotated in valid standard markup trough passing one or all of the following _key:value_ pairs as additional `options' to the object during creation:

| Option Key   | Expected Value | Definition |
|----------|:-------------:|:-------------:|
| `itemtype` (Mandatory) | Text | Nearly any Schema.org type with a "spatial property" (allowing for stating a _Geo Coordinate_, _Geo Shape_ or _Place_) in its definition. For example you could use [City](http://schema.org/City) or [State](http://schema.org/State) but you could also declare a map element representing an [Organization](http://schema.org/Organization), a poem as [CreativeWork](http://schema.org/CreativeWork) or lets say an [Article](http://schema.org/Article) or [Comment](http://schema.org/Comment). Please see [schema.org](http://schema.org) type definitions to find out about all possible types and let me know if your case is not supported yet. | 
| `geoprop` (Optional) | Text | Name of Schema.org property to use for the geographical indicator value of type _Place_. Default is "geo", which is valid for Place and all its subtypes. Other valid values consequently would be "location" (_Organisation_), "contentLocation" (_CreativeWork_), "locationCreated" (_CreativeWork_), etc. |
| `title` <br/>(Optional) | Text | [name](http://schema.org/name) ([Thing](http://schema.org/Thing)), "The name of the item." |
| `description` (Optional) | Text | [description](http://schema.org/description) ([Thing](http://schema.org/Thing)), "A short description of the item." |
| `alternateName` (Optional) | Text | [alternateName](http://schema.org/alternateName) ([Thing](http://schema.org/Thing)), "An alias for the item." |
| `image` <br/>(Optional)| Text | [alternateName](http://schema.org/alternateName) ([Thing](http://schema.org/Thing)), "An image of the item." Currently this should be an URL. |
| `sameAs` (Optional) | Text | [sameAs](http://schema.org/sameAs) ([Thing](http://schema.org/Thing)), "URL of a reference Web page that unambiguously indicates the item's identity. E.g. the URL of the item's Wikipedia page, Freebase page, or official website." |
| `url` <br/>(Optional) | Text | [url](http://schema.org/url) ([Thing](http://schema.org/Thing)), "URL of the item." |
| `creator` (Optional) | Text | [creator](http://purl.org/dc/elements/1.1/creator) (Dublin Core), "An entity primarily responsible for making the resource. Typically, the name of a Creator should be used to indicate the entity (e.g. person, organisation or service)." |
| `contributor` (Optional) | Text | [contributor](http://purl.org/dc/elements/1.1/contributor) (Dublin Core), "An entity responsible for making contributions to the resource. Typically, the name of a Contributor should be used to indicate the entity (e.g. person, organisation or service)." |
| `publisher` (Optional) | Text | [publisher](http://purl.org/dc/elements/1.1/publisher) (Dublin Core), "An entity responsible for making the resource available. Typically, the name of a Contributor should be used to indicate the entity (e.g. person, organisation or service)." |
| `published` (Optional) | Text and Integers | [date](http://purl.org/dc/elements/1.1/date) (Dublin Core), "A point or period of time. May be used to express temporal information at any level of granularity. Recommended best practice is to use an encoding scheme, such as the [W3CDTF](http://www.w3.org/TR/NOTE-datetime) profile of ISO 8601." |
| `identifier` (Optional) | Text | [identifier](http://purl.org/dc/elements/1.1/identifier) (Dublin Core), "An unambiguous reference to the resource within a given context. Recommended best practice is to identify the resource by means of a string conforming to a formal identification system." |
| `rights` (Optional) | Text | [rights](http://purl.org/dc/elements/1.1/rights) (Dublin Core), "Information about rights held in and over the resource. Typically, rights information includes a statement about various property rights associated with the resource, including intellectual property rights." |
| `derivedFrom` (Optional) | Text | [source](http://purl.org/dc/elements/1.1/source) (Dublin Core), "A related resource from which the described resource is derived. The described resource may be derived from the related resource in whole or in part. Recommended best practice is to identify the related resource by means of a string conforming to a formal identification system." |
| `format` (Optional) | Text | [format](http://purl.org/dc/elements/1.1/format) (Dublin Core), "The file format, physical medium, or dimensions of the resource. Recommended best practice is to use a controlled vocabulary such as the list of Internet Media Types [MIME](http://www.iana.org/assignments/media-types/)." |
| `language` (Optional) | Text | [language](http://purl.org/dc/elements/1.1/language) (Dublin Core), "A language of the resource. Recommended best practice is to use a controlled vocabulary such as RFC 4646 [RFC4646](http://www.ietf.org/rfc/rfc4646.txt)." |
| `created` (Optional) | Text and Integers | [created](http://purl.org/dc/terms/created) (Dublin Core Term), "Date of creation of the resource. Recommended best practice is to use an encoding scheme, such as the [W3CDTF](http://www.w3.org/TR/NOTE-datetime) profile of ISO 8601." |
| `modified` (Optional) | Text and Integers | [modified](http://purl.org/dc/terms/modified) (Dublin Core Term), "Date on which the resource was changed.. Recommended best practice is to use an encoding scheme, such as the [W3CDTF](http://www.w3.org/TR/NOTE-datetime) profile of ISO 8601." |

Note: Contrary to the standard specification an option (`key`) can be annotated just once. For example currently this API does not enable you two specify two `alternateNames` for your map element.

### Examples - Building anotations using the API

Include the following script from this repository in your HTML file:
```
<script src="Leaflet.annotate.Microdata.js"></script>
```

After that, if you pass `itemtype` as an option to your map element during creation, it is configured for annotation. Annnotation will happen if you add the map element to your Leaflet `map` object.

Example1: Annotating a *Marker* as map element representing a `City` looks like this:
```
var marker = L.marker([40.573112, -73.980740], { itemtype: 'City', title: 'New York City'})
```
This also exposes your markers location values as machine readable [GeoCoordinates](http://schema.org/GeoCoordinates) values in HTML.

Example2: Annotating a *Circle Marker* (SVG) to represent a [Creative Work](http://schema.org/CreativeWork), a virtual Poem.
```
var circleMarker = L.circleMarker([40.573112, -73.980740], {
	itemtype: 'CreativeWork', geoprop: 'locationCreated'
    title: 'The circle marker stating where this meta poem was created.'
})
```
This too exposes this markers location value as machine readable [GeoCoordinates](http://schema.org/GeoCoordinates) but more specifically, it exposes the location as the _Place_ where the poem was written (`locationCreated`).

Example3: Annotating a group of geometries (SVG) which all represent the boundaries of one [Country](http://schema.org/Country), in this case the (formal) boundaries of the "Estados Unidos":
```
var statesBoundaries = L.geoJson(response, { itemtype: 'Country',
    title: 'Estados Unidos'
}).addTo(map)
// Note: Here we must call annotate() explicitly on geographical Overlays such as this GeoJSON Layer
statesBoundaries.annotate()
```

Note: Here an additional and explicit call of _annotate()_ is necessary.<br/>
This exposes the polygons location values (all GeoCoordinates of the boundaries) as a machine readable [GeoShape](http://schema.org/GeoShape).

### Background

The envisioned application for revised markup in geographic web maps is (besides all third-party use cases enabled through providing structured data):<br/>A digital map legend interactively assisting users in analyzing the contents and the scope of so called ``map mashups''.

Answers to the following questions are implemented in this extension:
- Which standard HTML Elements (Tags) match best to _structure_ HTML documents which are of composite nature, esp. regarding to many contributions from many people)? - Depends, but relying on `div` should "be the last resort".
- Which standad HTML Elements (Tags) match best for _annotating_ core elements of a geographic web map (like Marker, Layer, Popup, etc.)? - Depends, but for Markers and Popups and the current microdata implementation i chose `article`.
- Where and how to represent "multiple authors" in a single HTML document (while it is already safe to consider how to represent just a single author of a document in HTML "unspecified")? - Either completely relying on class names, as the HTML Standard does sugegst or through, e.g. using `meta` lements within the `body` of the document in conjunction with microdata and terms of a well supported vocabulary.
- Where and how to represent `datetime` on variously authored fragements in HTML? - [W3CDTF](https://www.w3.org/TR/NOTE-datetime)
- Which HTML Markup Extension Syntax to implement first? - [Microdata](https://www.w3.org/TR/microdata/)
- Which RDF Vocabulary is widely used (could be considererd "well supported") and extensible for us? - [Schema.org](http://schema.org/version/2.2/)

### Implementation Notes

To annotate SVG Elements we introduce a `metadata` Element next to the respective `path`. In practice both are often grouped within a `g` element. All Schema.org and Dublin Core based annotation values are attributes of a `meta` element.

Maps rendered in the **Internet Explorer** along with _VML_ is currently **not supported** when deploying Leaflet.annnotate. HTML `canvas` based rendering is also not supported, in fact, a `canvas` based approach is exactly the opposite of (HTML) markup (Elements) representing elements of geographical web maps.

At the moment all geographic annotations (of types which are not a sub-type of _Place_) are done through introducing an extra _Place_ element (and are not possible using just a _GeoShape_).

### Release History

0.3, *Upcoming*

 * Annotatable Leaflet Items: UI Layers (Marker, Popup), Vector Layers (CircleMarker), Other Layers (GeoJSON)
 * Compatible with the latest stable LeafletJS Release: 0.7.7
 * Most probably also compatible from at least all versions of 0.7.3 and upwards

License: [FreeBSD License](https://www.freebsd.org/copyright/freebsd-license.html)

Author:<br/>
(C) Malte Reißig (2016)

