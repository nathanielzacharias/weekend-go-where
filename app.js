//require("dotenv").config();
// const dotenvApikey = process.env.APIKEY
const dotenvApikey = `wuET5A9GzTonj2bb2ZY4c4G3ZJKQbPSt`

let listEventTypes = [] //list of Event Types

//display map - copied from https://www.onemap.gov.sg/docs/maps/
const center = L.bounds([1.56073, 104.00475], [1.14, 103.642]).getCenter();
const map = L.map('mapdiv',{zoomControl:false}).setView([center.x, center.y], 12);

L.control.zoom({
    position: 'bottomleft'
}).addTo(map);

// const basemap = L.tileLayer('https://www.onemap.gov.sg/maps/tiles/Default/{z}/{x}/{y}.png', {
//     detectRetina: true,
//     maxZoom: 18,
//     minZoom: 11

// });

const basemap = L.tileLayer('https://www.onemap.gov.sg/maps/tiles/Default/{z}/{x}/{y}.png', {
   detectRetina: true,
   maxZoom: 18,
   minZoom: 11,
   /** DO NOT REMOVE the OneMap attribution below **/
   attribution: '<img src="https://www.onemap.gov.sg/web-assets/images/logo/om_logo.png" style="height:20px;width:20px;"/>&nbsp;<a href="https://www.onemap.gov.sg/" target="_blank" rel="noopener noreferrer">OneMap</a>&nbsp;&copy;&nbsp;contributors&nbsp;&#124;&nbsp;<a href="https://www.sla.gov.sg/" target="_blank" rel="noopener noreferrer">Singapore Land Authority</a>'
});


map.setMaxBounds([[1.56073, 104.1147], [1.16, 103.502]]);
basemap.addTo(map);




//init function to be run once - called by ()
async function initialiseCategories() {
    
    //make API call to return list of event types
    const response = await fetch(`https://tih-api.stb.gov.sg/content/v1/event/types?language=en&apikey=${dotenvApikey}`, {
        method: 'GET',
        redirect: 'follow'
    })
    const responseJSON = await response.json();

    //access the data attribute of the returned object
    listEventTypes = responseJSON.data;
}

// search functionality
function listenForSearchClick () {
    const searchBtn = document.querySelector('#searchBtn')
    searchBtn.addEventListener("click", () => {
        const searchInput = document.querySelector("#keywordSearch").value;
        getEventsAndDisplay(searchInput);
    })
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
}
// function showPosition(position) {
//     marker = new L.Marker([position.coords.latitude, position.coords.longitude], { bounceOnAdd: false }).addTo(map);
//     var popup = L.popup()
//         .setLatLng([position.coords.latitude, position.coords.longitude])
//         .setContent('You are here!')
//         .openOn(map);
// }
//fetch list of event types from TIH STB

//populate dropdown menu with returned API object & listen for click
async function populateDropdownAndListenForClick() {
    //put returned list of Event Types into dropdown menu
    const dropdownMenu = document.querySelector(".dropdown-menu")
    //console.log(dropdownMenu)
    listEventTypes.forEach(element => {
        const listItemOfEventType = document.createElement("li")
        const anchorOfEventType = document.createElement("a")
        anchorOfEventType.setAttribute("class", "dropdown-item")
        anchorOfEventType.innerText = element
        listItemOfEventType.append(anchorOfEventType)
        // console.log(listItemOfEventType)
        dropdownMenu.append(listItemOfEventType)
        anchorOfEventType.addEventListener("click", changeDropdown);
    })
}

//change text in Dropdown and trigger plotting of events
function changeDropdown (name) {
    const eventTypeTarget = name.target.innerText
    document.querySelector(".btn").innerText = eventTypeTarget
    getEventsAndDisplay(eventTypeTarget)
}

//initialise (equivalent to main())
(async function () {
    await initialiseCategories();
    populateDropdownAndListenForClick();
    listenForSearchClick();
})()

//Search API call
async function getEventsBySearch(searchString){
        //search by keyword
        const requestOptions = {
            method: 'GET',
            redirect: 'follow'
          };
          const response = await fetch(`https://tih-api.stb.gov.sg/content/v1/event/search?keyword=${searchString}&language=en&apikey=${dotenvApikey}`, requestOptions)
    
        const responseJSON = await response.json();
        //console.log('displayEventType:',response)
        return responseJSON 
}

// return Lat Long from Postal Code
async function getLatLongFromPostalCode(postalCode) {
    if (postalCode === '') return;

    const headers = new Headers();
    headers.append("Cookie", "Domain=developers.onemap.sg; _toffuid=rB8JqGKtSPYcIRNbBvTQAg==; onemap2=CgAQCmKtSPY8YAWGDBwMAg==");

    const requestOptions = {
        method: 'GET',
        headers: headers,
        redirect: 'follow'
    };

    const response = await fetch(`https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${postalCode}&returnGeom=Y&getAddrDetails=Y&pageNum=1`, requestOptions)
    // https://www.onemap.gov.sg/api/common/elastic/search?searchVal=200640&returnGeom=Y&getAddrDetails=Y&pageNum=1
    //console.log('getLatLongFromPostalCode: ', response)
    return response.json()
}

//get events by searching and trigger displayMarkers
async function getEventsAndDisplay(searchString) {
    //object containing Events
    let eventsJSON = await getEventsBySearch(searchString)
    console.log('eventsJSON:',eventsJSON)
    // console.log (`eventsJSON.data[0].address.postalCode`,eventsJSON.data[0].address.postalCode)

    //get postalCodes
    const postalCode = []
    eventsJSON.data.forEach( (element,index) => {
        postalCode[index] = eventsJSON.data[index].address.postalCode;
    })
    // console.log('postalCode: ',postalCode)

    //get Promise all from postalCode
    let promiseAllFromPostalCode = await Promise.all(postalCode.map(item => getLatLongFromPostalCode(item)))
    // console.log ('promiseAllFromPostalCode: ', promiseAllFromPostalCode)
    
    //get lattitude longitude from promiseAll JSON
    const arrLatLong = [[]]
    promiseAllFromPostalCode.forEach ((element,index) => {
        if (typeof promiseAllFromPostalCode[index] === 'undefined') return
        const lat = parseFloat(promiseAllFromPostalCode[index].results[0].LATITUDE)
        const long = parseFloat(promiseAllFromPostalCode[index].results[0].LONGITUDE)
        arrLatLong[index] = [lat,long]
    })
    // console.log(arrLatLong)

    //clearMarkers
    clearMarkers()

    displayMarkers(arrLatLong,eventsJSON)


}
function clearMarkers(){
    const toClearMarkers = document.querySelector(".leaflet-marker-pane").innerHTML = '';
    const toClearPopup = document.querySelector(".leaflet-popup-pane").innerHTML = '';
    const toClearShadow = document.querySelector(".leaflet-shadow-pane").innerHTML = '';

    clearEventsCards();
}

const clearEventsCards = () => {
    const eventsUL = document.querySelector(".events-ul");
    if (eventsUL.hasChildNodes()) {
        let children = eventsUL.childNodes;
        for (const node of children){
            eventsUL.removeChild(node);
        }
    }
}
//display Markers on Map
function displayMarkers(arrLatLong, eventsJSON){

        //display markers
        const ul = document.querySelector('.listicle-ul');
        const markers = [];

        clearEventsCards();

        arrLatLong.forEach((element,index) => {
            markers[index] = L.marker(arrLatLong[index]).addTo(map)
            markers[index]
            .bindPopup(
                `<b>Event Name:</b>
                <br>${eventsJSON.data[index].name}
                <br>`)
            .openPopup();
            
            //add Events as cards to list by the side
            const text = document.createTextNode(eventsJSON.data[index].name);
            const li = document.createElement("li");
            li.appendChild(text);
            li.classList.add("event-item");
            // li.classList.add(`draggable="true"`);
            ul.appendChild(li);
        })
}
// //use as reference
// //get latitude longitude
// async function getLatLongFromPostalCode(postalCode) {
//     const headers = new Headers();
//     headers.append("Cookie", "Domain=developers.onemap.sg; _toffuid=rB8JqGKtSPYcIRNbBvTQAg==; onemap2=CgAQCmKtSPY8YAWGDBwMAg==");

//     const requestOptions = {
//         method: 'GET',
//         headers: headers,
//         redirect: 'follow'
//     };

//     // fetch(`https://developers.onemap.sg/commonapi/search?searchVal=${postalCode}&returnGeom=Y&getAddrDetails=Y&pageNum=1`, requestOptions)
//     // //   .then(response => response.json())
//     // //   .then(result => console.log(result))
//     // //   .catch(error => console.log('error', error));

//     // const responseJSON = response.json();
//     // console.log(response)
//     // const returnVal = responseJSON.results[0].LATITUDE
//     // console.log(returnVal)
//     // return returnVal

//     // fetch('asdf')
//     //     .then(response => response.json())
//     //     .then(data => {
//     //         console.log(data)
//     //     })
//     //     .catch(error => {
//     //         console.log(error)
//     //     })

//     try {
//         const response = await fetch(`https://developers.onemap.sg/commonapi/search?searchVal=${postalCode}&returnGeom=Y&getAddrDetails=Y&pageNum=1`, requestOptions)
//         console.log(response)
//         return Promise.resolve('ok')
//         // const responseJson = await response.json()
//         // const lat = parseFloat(responseJson.results[0].LATITUDE)
//         // const long = parseFloat(responseJson.results[0].LONGITUDE)
//         // const array = [lat,long]
//         // return array 
//     } catch (error) {
//         console.log(error)
//     }


// }

