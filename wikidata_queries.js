
var wd = {
	load_public_sculptures_in_paris: function(success, fail) {

			/** SPARQL Query: encodeURIComponent('SELECT DISTINCT ?item  ?title ?createur (year(?date) as ?AnneeCreation) ?image ?coord WHERE { ?item wdt:P31/wdt:P279* wd:Q860861. ?item wdt:P136 wd:Q557141 . {?item wdt:P131 wd:Q90.} UNION {?item wdt:P131 ?arr. ?arr wdt:P131 wd:Q90. } ?item rdfs:label ?title filter (lang(?title) = "fr"). OPTIONAL {?item wdt:P170 ?Qcreateur. ?Qcreateur rdfs:label ?createur filter (lang(?createur) = "fr") .} OPTIONAL {?item wdt:P571 ?date.} OPTIONAL {?item wdt:P18  ?image.} OPTIONAL {?item wdt:P625 ?coord.}}')*/

			$.getJSON('https://query.wikidata.org/sparql?format=json&query=SELECT%20DISTINCT%20%3Fitem%20%20%3Ftitle%20%3Fcreateur%20(year(%3Fdate)%20as%20%3FAnneeCreation)%20%3Fimage%20%3Fcoord%20WHERE%20%7B%20%3Fitem%20wdt%3AP31%2Fwdt%3AP279*%20wd%3AQ860861.%20%3Fitem%20wdt%3AP136%20wd%3AQ557141%20.%20%7B%3Fitem%20wdt%3AP131%20wd%3AQ90.%7D%20UNION%20%7B%3Fitem%20wdt%3AP131%20%3Farr.%20%3Farr%20wdt%3AP131%20wd%3AQ90.%20%7D%20%3Fitem%20rdfs%3Alabel%20%3Ftitle%20filter%20(lang(%3Ftitle)%20%3D%20%22fr%22).%20OPTIONAL%20%7B%3Fitem%20wdt%3AP170%20%3FQcreateur.%20%3FQcreateur%20rdfs%3Alabel%20%3Fcreateur%20filter%20(lang(%3Fcreateur)%20%3D%20%22fr%22)%20.%7D%20OPTIONAL%20%7B%3Fitem%20wdt%3AP571%20%3Fdate.%7D%20OPTIONAL%20%7B%3Fitem%20wdt%3AP18%20%20%3Fimage.%7D%20OPTIONAL%20%7B%3Fitem%20wdt%3AP625%20%3Fcoord.%7D%7D', success, fail)
	}
}