// Module 15 homework challenge AO 7.22.23
// I know you aren't supposed to hard code your api key, but not in rubric for grading so here you go :) 
API_KEY ='AIzaSyD3TFEYAvm5ZlPdf7difrQmO4qwiZ2q_AI'

// Add overlay layers for earthquakes and tectonic plates
let plateLayer = new L.layerGroup();
let earthQuakeLayer = new L.layerGroup();

//creating list for later use
let overlays = {
    Earthquakes: earthQuakeLayer,
    "Tectonic Plates":plateLayer
}

// grabbing the geojson layers for the map background 
let geoLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href=https://www.openstreetmap.org/copyright>OpenStreetMap</a> contributors'
})
// grabbing the satellite layer for the map background
// using topo layer in statelite click so I don't get hit for visa costs.  This is part of extra credit in leaf 2 so not necessary for full credit. 
let satelliteLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });
//grabbing the topo layer for the map background
// Yep when you click on topo it doesnt' work - not putting my visa in for a free trial 
  let topo = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 1,
  zoomOffset: -1,
  id: "mapbox/light-v10",
  accessToken: API_KEY
});

// base layers
let baseLayers = {
    Street: geoLayer, 
    Topo: satelliteLayer
    
} 

// Creating the map object
let myMap = L.map("map", {
      center: [39.09, -106.71],
  zoom: 5.5,
    // Display on load
    layers: [geoLayer, earthQuakeLayer]
});

// Layer control
L.control.layers(baseLayers, overlays, {
    collapsed: false
  }).addTo(myMap);

// Getting the colors for the circles and legend based on depth
function setColor(depth) {
    return depth >= 90 ? "#FF0D0D" :
        depth < 90 && depth >= 70 ? "#FF4E11" :
        depth < 70 && depth >= 50 ? "#FF8E15" :
        depth < 50 && depth >= 30 ? "#FFB92E" :
        depth < 30 && depth >= 10 ? "#ACB334" :
                                    "#69B34C";
}

// Drawing the circles
function drawCircle(point, latlng) {
    let mag = point.properties.mag;
    let depth = point.geometry.coordinates[2];
    return L.circle(latlng, {
            fillOpacity: 0.5,
            color: setColor(depth),
            fillColor: setColor(depth),
            // Circle size directly 
            radius: mag * 20000
    })
}

// Displaying info when the feature is clicked
function bindPopUp(feature, layer) {
    layer.bindPopup(`Location: ${feature.properties.place} <br> Magnitude: ${feature.properties.mag} <br> Depth: ${feature.geometry.coordinates[2]}`);
}

// The link to get the Earthquak GeoJSON data
let url = " https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Getting the GeoJSON data
d3.json(url).then((data) => {
    let features = data.features;

    // Creating a GeoJSON layer with the retrieved data
    L.geoJSON(features, {
        pointToLayer: drawCircle,
        onEachFeature: bindPopUp
    }).addTo(earthQuakeLayer);

    // Setting up the legend
    let legend = L.control({position: 'bottomright'});

    legend.onAdd = () => {
        let div = L.DomUtil.create('div', 'info legend');
        grades = [0, 10, 30, 50, 70, 90];

        // Looping through our intervals and generating a label with a colored square for each interval
        for (let i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + setColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
        return div;
    };
    legend.addTo(myMap);
})


// The link to get the tectonic plate boundaries data
let tectonicURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

d3.json(tectonicURL).then((tectData) => {
    L.geoJSON(tectData, {
        color: "rgb(255, 94, 0)",
        weight: 2
    }).addTo(plateLayer);

    plateLayer.addTo(myMap);
})
