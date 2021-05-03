var years = [
  "2009",
  "2010",
  "2011",
  "2012",
  "2013",
  "2014",
  "2015",
  "2016",
  "2017",
  "2018",
  "2019",
  "2020",
];

var activeWard = null;

$(document).ready(function () {
  mapboxgl.accessToken =
    "pk.eyJ1IjoiYm90aXZlZ2gxMSIsImEiOiJjazdydGI1NXAwYTJ4M25zZnNuanhoOGVtIn0.ehZ8tfymMjbNyAPJ2o2lhQ";
  var map = new mapboxgl.Map({
    container: "map", // container ID
    style: "mapbox://styles/botivegh11/cknymrvsw0jzz17qcq9ab53g2", // style URL
    center: [-0.0865, 51.51], // starting position [lng, lat]
    zoom: 9, // starting zoom
    attributionControl: false,
    preserveDrawingBuffer: true,
  });
  map.addControl(new mapboxgl.NavigationControl(), (position = "top-right"));
  var hoveredStateId = null;
  map.on("load", function () {
    // Add a data source containing GeoJSON data.
    map.addSource("fire", {
      type: "geojson",
      data: "./assets/data/fire.geojson",
      generateId: true,
    });

    // Add a new layer to visualize the polygon.
    map.addLayer(
      {
        id: "fire",
        type: "fill",
        source: "fire", // reference the data source
        filter: ["==", "Year", "2009"],
        layout: {},
        paint: {
          "fill-color": [
            "step",
            ["get", "IncidentDensity"],

            "#b2c2db",
            0.34,
            "#849ec5",

            0.58,

            "#ffcc00",
            0.99,
            "#f84f40",

            1.89,
            "#850200",
          ],
          "fill-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            1,
            0.5,
          ],
        },
      },
      //Placeing the layer below this:
      "road-label"
    );
  });

  //// HOVER EFFECT
  map.on("mousemove", "fire", function (e) {
    if (e.features.length > 0) {
      if (hoveredStateId !== null) {
        map.setFeatureState(
          { source: "fire", id: hoveredStateId },
          { hover: false }
        );
      }
      hoveredStateId = e.features[0].id;
      map.setFeatureState(
        { source: "fire", id: hoveredStateId },
        { hover: true }
      );
    }
  });
  map.on("mouseleave", "state-fills", function () {
    if (hoveredStateId !== null) {
      map.setFeatureState(
        { source: "states", id: hoveredStateId },
        { hover: false }
      );
    }
    hoveredStateId = null;
  });

  ///// GET DATA BY CLICKS
  map.on("click", "fire", function (e) {
    setSidebarData(e.features[0].properties);
    activeWard = e.features[0].properties.GSS_CODE;
    ToggleToolBox(true);
  });

  // Assign an event listner to the slider so that the filterBy function runs when the user changes the slider
  document.getElementById("slider").addEventListener("input", function (e) {
    var year = parseInt(e.target.value);
    filterBy(year);
  });
  // SLider changes
  function filterBy(year) {
    document.getElementById("year").textContent = years[year]; // Set the label to the correct year

    var filters = ["==", "Year", years[year]];
    map.setFilter("fire", filters);
    movePlotBand(years[year]);

    if (activeWard != null) {
      $.getJSON("./assets/data/fire.json", function (data) {
        var selectedWard = data.filter(
          (el) => (el.GSS_CODE == activeWard) & (el.Year == years[year])
        )[0];

        setSidebarData(selectedWard);
      });
    }
  }

  /// Toolbar chart

  Highcharts.chart("fire-type-container", {
    chart: {
      doAnimation: true,
      type: "bar",
    },

    title: {
      text: "",
    },
    xAxis: {
      categories: [""],
    },
    yAxis: {
      title: {
        text: "",
        min: 0,
      },
    },
    legend: {
      enabled: false,
    },
    plotOptions: {
      bar: {
        stacking: "percent",
      },
    },

    series: [
      {
        name: "False Alarm",
        data: [5],
      },
      {
        name: "Fire",
        data: [2],
      },
      {
        name: "Special Service",
        data: [3],
      },
    ],
  });

  // Property type toolbar chart

  Highcharts.chart("prop-type-container", {
    chart: {
      doAnimation: true,
      type: "bar",
    },

    title: {
      text: "",
    },
    xAxis: {
      categories: [""],
    },
    yAxis: {
      title: {
        text: "",
        min: 0,
      },
    },
    legend: {
      enabled: false,
    },
    plotOptions: {
      bar: {
        stacking: "percent",
      },
    },

    series: [],
  });

  // MAIN CHART
  Highcharts.getJSON("./assets/data/timeInci.json", function (data) {
    Highcharts.chart("container", {
      chart: {
        doAnimation: true,

        scrollablePlotArea: {
          minWidth: 1700,
          scrollPositionX: 0,
        },
      },
      title: {
        text: "",
      },
      xAxis: {
        type: "datetime",
        plotBands: [
          {
            color: "rgba(58, 188, 114, .1)", // Color value
            borderColor: "rgba(58, 188, 114)",
            borderWidth: "2px",
            animation: {
              enabled: true,
            },

            from: Date.UTC(2009), // Start of the plot band
            to: Date.UTC(2010), // End of the plot band
          },
        ],
      },
      yAxis: {
        max: 800,
        title: {
          text: "No. Incidents",
        },
      },
      legend: {
        enabled: false,
      },
      plotOptions: {
        area: {
          fillColor: {
            linearGradient: {
              x1: 0,
              y1: 0,
              x2: 0,
              y2: 1,
            },
            stops: [
              [0, Highcharts.getOptions().colors[0]],
              [
                1,
                Highcharts.color(Highcharts.getOptions().colors[0])
                  .setOpacity(0)
                  .get("rgba"),
              ],
            ],
          },
          marker: {
            radius: 2,
          },
          lineWidth: 1,
          states: {
            hover: {
              lineWidth: 1,
            },
          },
          threshold: null,
        },
      },

      series: [
        {
          type: "area",
          name: "Incident Calls",
          data: data,
        },
      ],
    });
  });
});

///// TOGGLE
//OPEN TOOLBOX
var toolbar = document.getElementById("toolbar");
var toolbar_header = document.getElementById("toolbar-header");
var toolbar_button = document.getElementById("toolbar-button");
var location_search = document.getElementById("location-search-container");
var time_chart = document.getElementById("time-chart-holder");

function ToggleToolBox(forceOpen) {
  if (forceOpen == true) {
    toolbar.style.display = "block";
    toolbar_button.className = "active";
    time_chart.style.width = "calc(100% - 365px)";
    // location_search.className = "location-search-toolbox-active";
  } else {
    if (toolbar.style.display == "block") {
      toolbar.style.display = "none";
      toolbar_button.className = "";
      //location_search.className = "";
      time_chart.style.width = "calc(100% - 40px)";
    } else {
      toolbar.style.display = "block";
      toolbar_button.className = "active";
      time_chart.style.width = "calc(100% - 365px)";

      //   location_search.className = "location-search-toolbox-active";
    }
  }
  var chart = $("#container").highcharts();
  chart.reflow();
}

// Set toolbox data
var toolbarYear = document.getElementById("toolbar-year");
var wardName = document.getElementById("ward-name-text");
var incident = document.getElementById("incident-number");
var response = document.getElementById("response-number");
var falsenumber = document.getElementById("false-number");
var cost = document.getElementById("cost-number");

function setSidebarData(selectedWard) {
  toolbarYear.innerHTML = selectedWard["Year"];
  wardName.innerHTML = selectedWard["NAME"];

  incident.innerHTML = selectedWard["IncidentNumber"];
  response.innerHTML = parseFloat(
    selectedWard["FirstPumpArriving_AttendanceTime"]
  ).toFixed(0);
  falsenumber.innerHTML =
    parseFloat(
      (selectedWard["False_Alarm_Rate"] / selectedWard["IncidentNumber"]) * 100
    ).toFixed(1) + "%";

  cost.innerHTML = "£" + selectedWard["Notional Cost (£)"];

  setSidebarChart(selectedWard);
}

function setSidebarChart(selectedWard) {
  var fireTypeChart = $("#fire-type-container").highcharts();
  $.getJSON("./assets/data/fire_type_chart.json", function (data) {
    var selectedData = Object.values(data).filter(
      (el) =>
        (el.IncGeo_WardCode == selectedWard.GSS_CODE) &
        (el.CalYear == selectedWard.Year)
    )[0];

    fireTypeChart.update(
      {
        series: [
          {
            name: "False Alarm",
            data: [selectedData.values[0]],
          },
          {
            name: "Fire",
            data: [selectedData.values[1]],
          },
          {
            name: "Special Service",
            data: [selectedData.values[2]],
          },
        ],
      },
      true,
      true
    );
  });
  var propTypeChart = $("#prop-type-container").highcharts();

  $.getJSON("./assets/data/prop_type_chart.json", function (data) {
    var selectedData = Object.values(data).filter(
      (el) =>
        (el.IncGeo_WardCode == selectedWard.GSS_CODE) &
        (el.CalYear == selectedWard.Year)
    )[0];

    propTypeChart.update(
      {
        series: [
          {
            name: "Aircraft",
            data: [selectedData.values[0]],
          },
          {
            name: "Boat",
            data: [selectedData.values[1]],
          },
          {
            name: "Dwelling",
            data: [selectedData.values[2]],
          },
 
          {
            name: "Non Residential",
            data: [selectedData.values[3]],
          },
          {
            name: "Other Residential",
            data: [selectedData.values[4]],
          },
          {
            name: "Outdoor",
            data: [selectedData.values[5]],
          },
          {
            name: "Outdoor Structure",
            data: [selectedData.values[6]],
          },
          {
            name: "Rail Vehicle",
            data: [selectedData.values[7]],
          },
          {
            name: "Road Vehicle",
            data: [selectedData.values[8]],
          },
        ],
      },
      true,
      true
    );
  });
}

//
function movePlotBand(year) {
  var chart = $("#container").highcharts();

  var plotBand = chart.xAxis[0].plotLinesAndBands[0];
  plotBand.options.from = Date.UTC(year);
  plotBand.options.to = Date.UTC(parseInt(year) + 1);
  // for some reason it only rendering it smootly if the windows has be resized - weirdest thing ever. ... ..
  plotBand.render();
}
