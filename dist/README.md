
## Leaflet.annnotate

An extension of the [LeafletJS](http://github.com/Leaflet/Leaflet) (0.7.x) standard API facilitating the publication of information in geographical web maps with advanced _accessibility_. Employing _Leaflet.annotate_, in the end, will allow you to markup elements in your map with the [Schema.org](http://schema.org) vocabulary and thus publish them as independent and (potentially) addressable items of information ("Things").

Once you annotate your items, _Leaflet.annotate_ automatically translates all semantic and spatial attributes as information readable in the web of data. It frees you to write markup that is compliant with the latest of [Living HTML](https://html.spec.whatwg.org/multipage/semantics.html), [SVG Standard 1.1. 2nd Edition](https://www.w3.org/TR/SVG/) while integrating general resource descriptions vocabularies like Schema.org and the [Dublin Core Metadata Element Set](http://dublincore.org/documents/dces/). 

Furthermore (as it defines an API) it allows developers to build all kinds of crazy things, e.g. assistive dialogs to read and analyse the contents of your map, re-usable across all LeafletJS based geographical web maps. And no, this is not intended to help you annotate elements of your next "statistical geovisual analytics" or your next "big data geoweb map" app. It is intended to support web map making as an information organization practice.

## Overview: This Leaflet plugin consists of two components

### 1. Schema.org Microdata Syntax Implementation

Advances the markup of your geographic web map according to standards and the geospatial domain present in the public Schema.org vocabulary. This makes your web map accessible. This implementation hooks into the standard LeafletJS API enabling you to improve your markup when using _Marker_, _CircleMarker_ or _GeoJSON_ elements from Leaflet. To use it include the following script tag in your HTML document:

```
<script src="Leaflet.annotate.Microdata.js"></script>
```

To annotate single map elements please check out the API documentation below. Basically your LeafletJS standard `options` object now can handle a simple `itemtype`. The plugin expects the value of such an itemtype be the name of a Schema.org type, e.g. _City_, or _Organisation_. All itemtypes which allow (by their type definition) you the expression of a property with a geographical extent or location as their value/s, are supported.

### 2. Markup Viewer - A new Leaflet Control

The AnnotationViewer is a new user dialog aimed at improving the experience for users who want to reading and interpretate the contents of your geographic web map systematically.

The following script included in this repository ships it (Icon: `?`) to your document:

```
<script src="Leaflet.annotate.Viewer.js"></script>
```

And to use this control you must explicitly add it to your map, like any other custom Leaflet Control.

```
map.addControl(L.control.annotationViewer())
```

Feedback and contributions are very welcome.<br/>
Cheers!

### API

The following API options are available on standard Leaflet *Marker*, *CircleMarker*, *ImageOverlay*, *Popup* and at least a *GeoJSON Layer*. All these three type of overlays can be annotated in valid standard markup trough passing one or all of the following _key:value_ pairs as additional `options' to the object during creation:

| Option Key   | Expected Value | Metadata Element Key and Definition |
|----------|:-------------:|:-------------:|
| `itemtype` (Mandatory) | Text | Nearly any Schema.org type with a "spatial property" (allowing for stating a _Geo Coordinate_, _Geo Shape_ or _Place_) in its definition. For example you could use [City](http://schema.org/City) or [State](http://schema.org/State) here. If you declare a schema type which is no subtype of Place, like e.g. [Organization](http://schema.org/Organization), [CreativeWork](http://schema.org/CreativeWork), [Article](http://schema.org/Article) or [Comment](http://schema.org/Comment) please make sure you set the `geoprop` option. Please see [schema.org](http://schema.org) type definitions to find out about all possible types and let me know if your case is not supported yet. | 
| `geoprop` (Optional) | Text | Name of Schema.org property to use for the geographical expression. Default is "geo", which is valid for _Place_ and all its subtypes. Other valid values consequently would be "location" (for _Organisation_) or "contentLocation" and "locationCreated" (for _CreativeWork_). |
| `title` <br/>(Optional) | Text | [name](http://schema.org/name) ([Thing](http://schema.org/Thing)), "The name of the item." |
| `description` (Optional) | Text | [description](http://schema.org/description) ([Thing](http://schema.org/Thing)), "A short description of the item." |
| `alternateName` (Optional) | Text | [alternateName](http://schema.org/alternateName) ([Thing](http://schema.org/Thing)), "An alias for the item." |
| `image` <br/>(Optional)| Text | [image](http://schema.org/image) ([Thing](http://schema.org/Thing)), "An image of the item." Currently this should be an URL. |
| `sameAs` (Optional) | Text | [sameAs](http://schema.org/sameAs) ([Thing](http://schema.org/Thing)), "URL of a reference Web page that unambiguously indicates the item's identity. E.g. the URL of the item's Wikipedia page, Freebase page, or official website." |
| `url` <br/>(Optional) | Text | [url](http://schema.org/url) ([Thing](http://schema.org/Thing)), "URL of the item." |
| `identifier` (Optional) | Text | [identifier](http://purl.org/dc/elements/1.1/identifier) (Dublin Core), "An unambiguous reference to the resource within a given context. Recommended best practice is to identify the resource by means of a string conforming to a formal identification system." |
| `domId` (Optional) | Text | Allows you to set the DOM ID for the annotation container element (either *article*, or *metadata*). Note: Leaflet must translate some geodata, esp. MultiPolygon GeoJSON files into multiple HTML elements. On such map elements you _must not_ use/set this property as it would invalidate the HTML document. |
| `creator` (Optional) | Text | [creator](http://purl.org/dc/elements/1.1/creator) (Dublin Core), "An entity primarily responsible for making the resource. Typically, the name of a Creator should be used to indicate the entity (e.g. person, organisation or service)." |
| `contributor` (Optional) | Text | [contributor](http://purl.org/dc/elements/1.1/contributor) (Dublin Core), "An entity responsible for making contributions to the resource. Typically, the name of a Contributor should be used to indicate the entity (e.g. person, organisation or service)." |
| `publisher` (Optional) | Text | [publisher](http://purl.org/dc/elements/1.1/publisher) (Dublin Core), "An entity responsible for making the resource available. Typically, the name of a Contributor should be used to indicate the entity (e.g. person, organisation or service)." |
| `rights` (Optional) | Text | [rights](http://purl.org/dc/elements/1.1/rights) (Dublin Core), "Information about rights held in and over the resource. Typically, rights information includes a statement about various property rights associated with the resource, including intellectual property rights." |
| `derivedFrom` (Optional) | Text | [source](http://purl.org/dc/elements/1.1/source) (Dublin Core), "A related resource from which the described resource is derived. The described resource may be derived from the related resource in whole or in part. Recommended best practice is to identify the related resource by means of a string conforming to a formal identification system." |
| `format` (Optional) | Text | [format](http://purl.org/dc/elements/1.1/format) (Dublin Core), "The file format, physical medium, or dimensions of the resource. Recommended best practice is to use a controlled vocabulary such as the list of Internet Media Types [MIME](http://www.iana.org/assignments/media-types/)." |
| `language` (Optional) | Text | [language](http://purl.org/dc/elements/1.1/language) (Dublin Core), "A language of the resource. Recommended best practice is to use a controlled vocabulary such as RFC 4646 [RFC4646](http://www.ietf.org/rfc/rfc4646.txt)." |
| `created` (Optional) | Text and Integers | [created](http://purl.org/dc/terms/created) (Dublin Core Term), "Date of creation of the resource. Recommended best practice is to use an encoding scheme, such as the [W3CDTF](http://www.w3.org/TR/NOTE-datetime) profile of ISO 8601." |
| `modified` (Optional) | Text and Integers | [modified](http://purl.org/dc/terms/modified) (Dublin Core Term), "Date on which the resource was changed.. Recommended best practice is to use an encoding scheme, such as the [W3CDTF](http://www.w3.org/TR/NOTE-datetime) profile of ISO 8601." |
| `published` (Optional) | Text and Integers | [date](http://purl.org/dc/elements/1.1/date) (Dublin Core), "A point or period of time. May be used to express temporal information at any level of granularity. Recommended best practice is to use an encoding scheme, such as the [W3CDTF](http://www.w3.org/TR/NOTE-datetime) profile of ISO 8601." |

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

Answers to the following questions are implemented in this extension:
- Which standard HTML Elements (Tags) match best to _structure_ HTML documents of composite nature, esp. regarding to many contributions from many people? - That depends, of course, but relying on `div` should "be the last resort" so iused `article`.
- Which standad HTML Elements (Tags) match best for _annotating_ core elements of a geographic web map (like Marker, Layer, Popup, etc.)? - Depends, but for Markers and Popups and the current microdata implementation i chose `article`.
- Where and how to represent _multiple authors_ in a single HTML document? - Either completely relying on class names (suggestion of HTML Standard) or through using an markup extenension mechanism and relying on terms of an already established metadata vocabulary., e.g. using `meta` elements within `article` elements or trough integrating metadata in the `microdata` syntax.
- Where and how to represent `datetime` on variously authored fragements in HTML? - [W3CDTF](https://www.w3.org/TR/NOTE-datetime)
- Which HTML Markup Extension Syntax to implement? - [Microdata](https://www.w3.org/TR/microdata/), because the metadata is rendered inline.
- Which metadata vocabularies are widely used and therefore could be considererd "well supported"? - [Schema.org](http://schema.org/version/2.2/), [Dublin Core Metadata Element Set]()
- Which metadata vocabulary is open and extensible for us? - [Schema.org](http://schema.org/version/2.2/)

### Implementation Notes

To annotate SVG Elements we introduce a `metadata` Element next to the respective `path`. In practice both are often grouped within a `g` element. All Schema.org and Dublin Core based annotation values are attributes of a `meta` element.

Maps rendered in the **Internet Explorer** along with _VML_ are currently **not supported** when deploying Leaflet.annnotate. HTML `canvas` based rendering is also not supported, in fact, a `canvas` based approach for rendering geographic we maps is exactly the opposite of how Leaflet.annotate tries to representing geographical web maps in HTML.

### Release History

0.3, *Upcoming*

0.3-RC, Aug 24, 2016 (Release Candidate)

 * Annotatable Leaflet Items: UI Layers (Marker, Popup), Vector Layers (CircleMarker), Other Layers (GeoJSON, ImageOverlay)
 * Compatible with the latest stable LeafletJS Release: 0.7.7
 * Most probably also compatible from at least all versions of 0.7.3 and upwards

License: [FreeBSD License](https://www.freebsd.org/copyright/freebsd-license.html)

Author:<br/>
(C) Malte Reißig (2016)

