// List of years
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
// Gobal var for active, selected ward
var activeWard = null;
// For formatting numbers
var nf = new Intl.NumberFormat();

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
    // Add a data source containing GeoJSON data
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
            "#EBD0FF",
            0.34,
            "#C8AEF6",
            0.58,
            "#A68ED3",
            0.99,
            "#866FB2",
            1.89,
            "#665191",
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
    /// CLICKED LAYER - Highlight the shape the user clicked on
    map.addLayer(
      {
        id: "fire-clicked",
        type: "fill",
        source: "fire", // reference the data source
        filter: ["==", "GSS_CODE", ""],
        layout: {},
        paint: {
          "fill-color": "#ffffff",
          "fill-opacity": 0.4,
        },
      },
      //Placeing the layer below this: - area names above shape layer
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
        { source: "fire", id: hoveredStateId },
        { hover: false }
      );
    }
    hoveredStateId = null;
  });

  ///// GET DATA BY CLICKS
  map.on("click", "fire", function (e) {
    setSidebarData(e.features[0].properties);
    activeWard = e.features[0].properties.GSS_CODE;
    map.setFilter("fire-clicked", ["==", "GSS_CODE", activeWard]);

    ToggleToolBox(true);
  });

  // Assign an event listener to the slider so that the filterBy function runs when the user changes the slider
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

    series: [],
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
      layout: "horizontal",
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
        text: "London Daily Fire Incidents 2009-2020",
        style: { color: "#333333", fontSize: "12px", fontWeight: "600" },
      },
      xAxis: {
        type: "datetime",
        plotBands: [
          {
            color: "rgba(255, 124, 67, .1)", // Color value
            borderColor: "rgba(255, 124, 67)",
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
          color: "#665191",
        },
      ],
    });

    // LOADING SCREEN OFF
    map.once("idle", () => {
      document.getElementById("loading-screen").style.visibility = "hidden";
      document.getElementById("loading-progress").style.visibility = "hidden";
      document.getElementById("page-content").style.filter = "none";
    
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
var overlay = document.getElementById("toolbar-overlay");

function ToggleToolBox(forceOpen) {
  overlay.style.display = "none";

  if (forceOpen == true) {
    toolbar.style.display = "block";
    toolbar_button.className = "active";
    time_chart.style.width = "calc(100% - 330px)";
    // location_search.className = "location-search-toolbox-active";
  } else {
    if (toolbar.style.display == "block") {
      toolbar.style.display = "none";
      toolbar_button.className = "";
      //location_search.className = "";
      time_chart.style.width = "calc(100% - 20px)";
    } else {
      toolbar.style.display = "block";
      toolbar_button.className = "active";
      time_chart.style.width = "calc(100% - 330px)";

      //   location_search.className = "location-search-toolbox-active";
    }
  }
  var chart = $("#container").highcharts();
  chart.reflow();
}

// Set toolbox data
var toolbarYear = document.getElementById("toolbar-year");
var wardName = document.getElementById("ward-name-text");
var borough = document.getElementById("ward-name-subtext");

var incident = document.getElementById("incident-number");
var response = document.getElementById("response-number");
var falsenumber = document.getElementById("false-number");
var cost = document.getElementById("cost-number");

var wardError = document.getElementById("ward-error");
var toolContent = document.getElementById("tool-main-content");

function setSidebarData(selectedWard) {
  try {
    // Handling issue when ward not exist in a cetain year
    wardError.innerHTML = "";
    wardError.className = "";
    toolContent.style.height = "calc(100% - 127px)";

    toolbarYear.innerHTML = selectedWard["Year"];
    wardName.innerHTML = selectedWard["NAME"];
    borough.innerHTML = selectedWard["BOROUGH"];

    incident.innerHTML = selectedWard["IncidentNumber"];
    response.innerHTML = parseFloat(
      selectedWard["FirstPumpArriving_AttendanceTime"]
    ).toFixed(0);
    falsenumber.innerHTML =
      parseFloat(
        (selectedWard["False_Alarm_Rate"] / selectedWard["IncidentNumber"]) *
          100
      ).toFixed(1) + "%";

    // IF value is 0 - ouput NaN else - formatted number
    cost.innerHTML =
      selectedWard["Notional Cost (£)"] != 0
        ? "£" + nf.format(selectedWard["Notional Cost (£)"])
        : "NaN";

    setSidebarChart(selectedWard);
  } catch (error) {
    wardError.innerHTML = "Ward doesn't exist in the selected year";
    wardError.className = "active";
    toolContent.style.height = "0px";
  }
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
            color: "#bc4f8f",
          },
          {
            name: "Fire",
            data: [selectedData.values[1]],
            color: "#ff6261",
          },
          {
            name: "Special Service",
            data: [selectedData.values[2]],
            color: "#584F8C",
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
      ///https://learnui.design/tools/data-color-picker.html#palette
      {
        series: [
          {
            name: "Aircraft",
            data: [selectedData.values[0]],
            color: "#003f5c",
          },
          {
            name: "Boat",
            data: [selectedData.values[1]],
            color: "#2f4b7c",
          },
          {
            name: "Dwelling",
            data: [selectedData.values[2]],
            color: "#665191",
          },

          {
            name: "Non Residential",
            data: [selectedData.values[3]],
            color: "#a05195",
          },
          {
            name: "Other Residential",
            data: [selectedData.values[4]],
            color: "#d45087",
          },
          {
            name: "Outdoor",
            data: [selectedData.values[5]],
            color: "#f95d6a",
          },
          {
            name: "Outdoor Structure",
            data: [selectedData.values[6]],
            color: "#ff7c43",
          },
          {
            name: "Rail Vehicle",
            data: [selectedData.values[7]],
            color: "#001e2b",
          },
          {
            name: "Road Vehicle",
            data: [selectedData.values[8]],
            color: "#ffa600",
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
  // for some reason it only rendering it smoothly if the windows has be resized - odd
  plotBand.render();
}
