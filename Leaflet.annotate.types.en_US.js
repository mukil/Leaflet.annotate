
/** -----
    Assistant for building dialogs managing annotation of web map elements.
    List of valid 'itemtype' values with a display label in English and their resp. 'geoprop' values. ------ **/

// Model: { Type Name (key) : Type Label (English), validProperties: [ "Valid property names for the type" ] }

    var validItemTypesEn = [

        {
            "Organization": "Organization",
            "validProperties": { "areaServed": [], "foundingLocation": [], "hasPOS": [], "location": [] }
        },



        {
            "CreativeWork": "Creative Work",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "Article": "Article",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "Blog": "Blog",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "Book": "Book",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "Clip": "Clip",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "Comment": "Comment",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "Conversation": "Conversation",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "CreativeWorkSeason": "Creative Work Season",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "CreativeWorkSeries": "Creative Work Series",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "DataCatalog": "Data Catalog",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "Dataset": "Dataset",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "DigitalDocument": "Digital Document",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "Episode": "Episode",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "Game": "Game",
            "validProperties":  { "contentLocation": [], "locationCreated": [], "spatialCoverage": [], "gameLocation": [] }
        },
        {
            "MediaObject": "Media Object",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [], "regionsAllowed": [] }
        },
        {
            "AudioObject": "Audio Object",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [], "regionsAllowed": [] }
        },
        {
            "ImageObject": "Image Object",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [], "regionsAllowed": [] }
        },
        {
            "Map": "Map",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "Movie": "Movie",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "MusicComposition": "Music Composition",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "MusicPlaylist": "Music Playlist",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "MusicRecording": "Music Recording",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "Painting": "Painting",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "Photograph": "Photograph",
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
            "Question": "Question",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "Recipe": "Recipe",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "Review": "Review",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "Sculpture": "Sculpture",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "Series": "Series",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "SoftwareApplication": "Software Application",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "TVSeason": "TV Season",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "TVSeries": "TV Series",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "SoftwareSourceCode": "Software Source Code",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "VisualArtwork": "Visual Artwork",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "WebPage": "Webpage",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },
        {
            "WebSite": "Website",
            "validProperties": { "contentLocation": [], "locationCreated": [], "spatialCoverage": [] }
        },



        {
            "Person": "Person",
            "validProperties": { "birthPlace": [], "deathPlace": [], "hasPOS": [], "homeLocation": [], "workLocation": [] }
        },
        {
            "JobPosting": "Job Posting",
            "validProperties": { "jobLocation": [] }
        },



        {
            "Action": "Action",
            "validProperties": { "location": [] }
        },
        {
            "Event": "Event",
            "validProperties": { "location": [] }
        },
        {
            "ExerciseAction": "Excercise Action",
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
            "RentalCarReservation": "Rental Car Reservation",
            "validProperties": { "dropoffLocation": [], "pickupLocation": [] }
        },
        {
            "Demand": "Demand",
            "validProperties": { "areaServed": [], "availableAtOrFrom": [], "eligibleRegion": [], "ineligibleRegion": [] }
        },
        {
            "Offer": "Offer",
            "validProperties": { "areaServed": [], "availableAtOrFrom": [], "eligibleRegion": [], "ineligibleRegion": [] }
        },
        {
            "Service": "Service",
            "validProperties": { "areaServed": [] }
        },
        {
            "ContactPoint": "Contact Point",
            "validProperties": { "areaServed": [] }
        },

        // --- All types of Place --- //

        {
            "Place": "Place",
            "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] }
        },
        {
            "Accommodation": "Accommodation",
            "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] }
        },
        {
            "AdministrativeArea": "Administrative Area",
            "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] }
        },
        {
            "City": "City",
            "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] }
        },
        {
            "Country": "Country",
            "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] }
        },
        {
            "State": "State",
            "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] }
        },
        {
            "CivicStructure": "Civic Structure",
            "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] }
        },
        {
            "Airport": "Airport",
            "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] }
        },
        {
            "Aquarium": "Aquarium",
            "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] }
        },
        {
            "Beach": "Beach",
            "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] }
        },
        {
            "Bridge": "Bridge",
            "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] }
        },
        {
            "BusStation": "Bus Station",
            "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] }
        },
        {
            "BusStop": "Bus Stop",
            "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] }
        },
        {
            "Campground": "Campground",
            "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] }
        },
        {
            "Cemetery": "Cemetery",
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
            "LocalBusiness": "Local Business",
            "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] }
        },
        {
            "Residence": "Residence",
            "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] }
        },
        {
            "TouristAttraction": "Tourist Attraction",
            "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] }
        }
]
