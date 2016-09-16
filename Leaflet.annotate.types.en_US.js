
// --- An optimized version of an schema validation tool for building
// --- dialogs allowing the annotation of web map elements.

var validItemTypesEn = {
    "Organization": { "label": "Organization", "validProperties": { "areaServed": [], "foundingLocation": [], "hasPOS": [], "location": [] } },

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

    "JobPosting": { "label": "Job Posting", "validProperties": { "jobLocation": [] } },

    "Action": { "label": "Action", "validProperties": { "location": [] } },

    "Event": { "label": "Event", "validProperties": { "location": [] } },

    "ExerciseAction": { "label": "Excercise Action", "validProperties": { "fromLocation": [], "toLocation": [] } },
    "MoveAction": { "label": "Move Action", "validProperties": { "fromLocation": [], "toLocation": [] } },
    "TransferAction": { "label": "Transfer Action", "validProperties": { "fromLocation": [], "toLocation": [] } },
    "ServiceChannel": { "label": "Service Channel", "validProperties":  { "serviceLocation": [] } },
    "RentalCarReservation": { "label": "Rental Car Reservation", "validProperties": { "dropoffLocation": [], "pickupLocation": [] } },
    "Demand": { "label": "Demand", "validProperties": { "areaServed": [], "availableAtOrFrom": [], "eligibleRegion": [], "ineligibleRegion": [] } },
    "Offer": { "label": "Offer", "validProperties": { "areaServed": [], "availableAtOrFrom": [], "eligibleRegion": [], "ineligibleRegion": [] } },
    "Service": { "label": "Service", "validProperties": { "areaServed": [] } },
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
    "LandmarksOrHistoricalBuildings": { "label": "Landmarks or Historical Buildings", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
    "Landform": { "label": "Landform", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
    "LocalBusiness": { "label": "Local Business", "validProperties": { "containedInPlace": [], "containsPlace": [], "geo": [] } },
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

var validPlaceTypes = {
    "Place": {}, "Accommodation": {},
    "AdministrativeArea": {},
        "City": {}, "Country": {}, "State": {},
    "CivicStructure": {},
        "Airport": {}, "Aquarium": {}, "Beach": { }, "Bridge": { }, "BusStation": { }, "BusStop": { }, "Campground": { }, "Cemetery": { },
        "Crematorium": {}, "EventVenue": { }, "FireStation": { }, "GovernmentBuilding": { }, "Hospital": { }, "MovieTheater": { }, "Museum": { }, "MusicVenue": { },
        "Park": {}, "ParkingFacility": { }, "PerformingArtsTheater": { }, "PlaceOfWorship": { }, "Playground": { }, "PoliceStation": { }, "RVPark": { }, "StadiumOrArena": { },
        "SubwayStation": { }, "TaxiStand": { }, "TrainStation": { }, "Zoo": { },
    "Landform": {},
        "BodyOfWater": {}, "Continent": {}, "Mountain": {}, "Volcano": {},
    "LandmarksOrHistoricalBuildings": { },
    "LocalBusiness": { },
        "AnimalShelter": {}, "AutomotiveBusiness": {}, "ChildCare": {},
        "Dentist": {}, "DryCleaningOrLaundry": {}, "EmergencyService": {},
        "EmploymentAgency": {},
        "EntertainmentBusiness": {}, "AdultEntertainment": {}, "AmusementPark": {}, "ArtGallery": {}, "Casion": {}, "ComedyClub": {}, "NightClub": {},
        "FinancialService": {}, "AccountingService": {}, "AutomatedTeller": {}, "BankOrCreditUnion": {}, "InsuranceAgency": {},
        "FoodEstablishment": {}, "Bakery": {}, "BarOrPub": {}, "Brewery": {}, "CafeOrCoffeeShop": {}, "FastFoodRestaurant": {}, "IceCreamShop": {}, "Restaurant": {}, "Winery": {}, "Distillery": {},
        "GovernmentOffice": {}, "PostOffice": {},
        "HealthAndBeautyBusiness": {},
        "HomeAndConstructionBusiness": {}, "Electrician": {},
            "GeneralContractor": {}, "HVACBusiness": {}, "HousePainter": {}, "Locksmith": {}, "MovingCompany": {}, "Plumber": {}, "RoofingContractor": {},
        "InternetCafe": {},
        "LegalService": {}, "Attorney": {}, "Notary": {},
        "Library": {}, "LodgingBusiness": {},
        "ProfessionalService": {}, "RadioStation": {}, "RealEstateAgent": {},
        "RecyclingCenter": {}, "SelfStorage": {}, "ShoppingCenter": {},
        "SportsActivityLocation": {}, "BowlingAlley": {}, "ExerciseGym": {}, "HealthClub": {}, "PublicSwimmingPool": {}, "SkiResort": {}, "SportsClub": {}, "TennisComplex": {},
        "Store": {},
            "AutoPartsStore": {}, "BikeStore": {}, "BookStore": {}, "ClothingStore": {}, "ComputerStore": {},
            "ConvenienceStore": {}, "DepartmentStore": {}, "ElectronicsStore": {}, "Florist": {}, "FurnitureStore": {},
            "GaredenStore": {}, "GroceryStore": {}, "HardwareStore": {}, "HobbyShop": {}, "HomeGoodsStore": {}, "JewelryStore": {},
            "LiquorStore": {}, "MensClothingStore": {}, "MobilePhoneStore": {}, "MovieRentalStore": {}, "MusicStore": {},
            "OfficeEquipmentStore": {}, "OutletStore": {}, "PawnShop": {}, "PetStore": {}, "ShoeStore": {},
            "SportingGoodsStore": {}, "TireShop": {}, "ToyStore": {}, "WholesaleStore": {},
        "TelevisionStation": {},
        "TourstInformationCenter": {}, "TravelAgency": {},
    "Residence": { },
    "TouristAttraction" : {}
}

function hasGeoProperty(typeName) {
    return (validPlaceTypes.hasOwnProperty(typeName))
}

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
