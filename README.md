# GA-Project-1-Nat
Project 1 from GA's SEIF course

## Project: 
Weekend Go Where

## Description:
Search Singapore Tourism Board's API for events, and then overlay those events on a map

## Link to live site:
https://nathanielzacharias.github.io/index2.html

## Technologies used:
### APIs from Tourism Info Hub (Singapore Tourism Board) :  
listEventTypes: https://tih-dev.stb.gov.sg/content-api/apis/get/v1/event/types   
searchEventByKeyword: https://tih-dev.stb.gov.sg/content-api/apis/get/v1/event/search   
(requires free registering as developer and getting API key)

### API for Singapore Map:
displaying the map: https://www.onemap.gov.sg/docs/

### Frameworks: 
CSS: Bootstrap 5 (https://getbootstrap.com/docs/5.2/getting-started/introduction/)   
Map: Leaflet JS (https://leafletjs.com/examples/quick-start/)

### Other highlights:
Used Promise.all to pass an array to an async-await function   
(https://flaviocopes.com/javascript-async-await-array-map/) 

## Approach taken:
-Aimed for minimum pass using Minimum Viable Product and "Quick Iteration" mindset   
-Used pen & paper for wireframing   
-Used Plan.txt for bulletpoints of things to do   
-Wrote pseudocode as comments, then wrote functions under the comments   
-Broke down large function into smaller functions when I added Search so that code was not repeated 

## Known issues & further work:
-"MICE", "Sports" returns no results in the API - should include a way of letting users know "404 error"   
-Allow users to know that a request is loading - should add a spinner   
-Map popups keep adding onto previous queries - should reset to a blank map   
-Stretch goal: add & remove events to a Wishlist and store in browser 
