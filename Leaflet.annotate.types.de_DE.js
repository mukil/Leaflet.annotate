
/** -----
    Assistant for building dialogs managing annotation of web map elements.
    List of valid 'itemtype' values with a display label in English and their resp. 'geoprop' values. ------ **/

// Model: { Type Name (key) : Type Label (English), validProperties: [ "Valid property names for the type" ] }

    var validItemTypesEn = [

        {
            "Organization": "Organisation",
            "validProperties": { "areaServed": [], "foundingLocation": [], "hasPOS": [], "location": [] }
        },



        {
            "CreativeWork": "Künstlerische Arbeit",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "Article": "Artikel",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "Blog": "Blog",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "Book": "Buch",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "Clip": "Clip",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "Comment": "Kommentar",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "Conversation": "Konversation",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "CreativeWorkSeason": "Künstlerische Arbeit (Staffel)",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "CreativeWorkSeries": "Künstlerische Arbeit (Folge)",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "DataCatalog": "Verzeichnis",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "Dataset": "Datensatz",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "DigitalDocument": "Digitales Dokument",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "Episode": "Episode",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "Game": "Spiel",
            "validProperties":  { "contentLocation": [], "locationCreated": [], "spatialCoverage": [], "gameLocation": [] }
        },
        {
            "MediaObject": "Medieninhalt",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [], "regionsAllowed": [] }
        },
        {
            "AudioObject": "Audiodatei",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [], "regionsAllowed": [] }
        },
        {
            "ImageObject": "Bilddatei",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [], "regionsAllowed": [] }
        },
        {
            "Map": "Karte",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "Movie": "Film",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "MusicComposition": "Musikalische Komposition",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "MusicPlaylist": "Playlist",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "MusicRecording": "Musikaufnahme",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "Painting": "Gemälde",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "Photograph": "Fotographie",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "PublicationIssue": "Publication Issue",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "PublicationVolume": "Publication Volume",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "Question": "Frage",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "Recipe": "Rezept",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "Review": "Rezension",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "Sculpture": "Skulptur",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "Series": "Serie",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "SoftwareApplication": "Software Anwendung",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "TVSeason": "TV Staffel",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "TVSeries": "TV Serie",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "SoftwareSourceCode": "Software Quellcode",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "VisualArtwork": "Visuelles Kunstwerk",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "WebPage": "Webpage",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "WebSite": "Webseite",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },



        {
            "Person": "Person",
            "validProperties": { "birthPlace": [], "deathPlace": [], "hasPOS": [], "homeLocation": [], "workLocation": [] }
        },
        {
            "JobPosting": "Stellenangebot",
            "validProperties": { "jobLocation": [] }
        },



        {
            "Action": "Aktion",
            "validProperties": { "location": [] }
        },
        {
            "Event": "Event",
            "validProperties": { "location": [] }
        },
        {
            "ExerciseAction": "Exercise Action",
            "validProperties": { "fromLocation": [], "toLocation": [] }
        },
        {        
            "MoveAction": "Move Action",
            "validProperties": { "fromLocation": [], "toLocation": [] }
        },
        {
            "TransferAction": "Transfer Action",
            "validProperties": { "fromLocation": [], "toLocation": [] }
        },
        {
            "ServiceChannel": "Service Channel",
            "validProperties":  { "serviceLocation": [] }
        },
        {
            "RentalCarReservation": "Mietwagen Reservierung",
            "validProperties": { "dropoffLocation": [], "pickupLocation": [] }
        },
        {
            "Demand": "Nachfrage",
            "validProperties": { "areaServed": [], "availableAtOrFrom": [], "eligibleRegion": [], "ineligibleRegion": [] }
        },
        {
            "Offer": "Angebot",
            "validProperties": { "areaServed": [], "availableAtOrFrom": [], "eligibleRegion": [], "ineligibleRegion": [] }
        },
        {
            "Service": "Dienstleistung",
            "validProperties": { "areaServed": [] }
        },
        {
            "ContactPoint": "Anlaufpunkt",
            "validProperties": { "areaServed": [] }
        },

        // --- All types of Place --- //

        {
            "Place": "Ort",
            "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] }
        },
        {
            "Accommodation": "Unterbringung",
            "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] }
        },
        {
            "AdministrativeArea": "Administrative Einheit",
            "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] }
        },
        {
            "City": "Stadt",
            "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] }
        },
        {
            "Country": "Land",
            "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] }
        },
        {
            "State": "Bundesland",
            "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] }
        },
        {
            "CivicStructure": "Öffentliches Gebäude",
            "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] }
        },
        {
            "Airport": "Flughafen",
            "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] }
        },
        {
            "Aquarium": "Aquarium",
            "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] }
        },
        {
            "Beach": "Strand",
            "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] }
        },
        {
            "Bridge": "Brücke",
            "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] }
        },
        {
            "BusStation": "ZOB",
            "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] }
        },
        {
            "BusStop": "Bushaltestelle",
            "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] }
        },
        {
            "Campground": "Campingplatz",
            "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] }
        },
        {
            "Cemetery": "Friedhof",
            "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] }
        },
        {
            "LandmarksOrHistoricalBuildings": "Landmarks or Historical Buildings",
            "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] }
        },
        {
            "Landform": "Landform",
            "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] }
        },
        {
            "LocalBusiness": "Geschäft",
            "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] }
        },
        {
            "Residence": "Residenz",
            "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] }
        },
        {
            "TouristAttraction": "Touristenattraktion",
            "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] }
        }
]
