require([
  "esri/views/MapView",
  "esri/WebMap",
  "esri/layers/GraphicsLayer",
  "esri/Graphic",
  "esri/geometry/geometryEngine",
  "esri/geometry/projection"
], function(MapView, WebMap, GraphicsLayer, Graphic, geometryEngine, projection) {

  let logCounter = 1;
  function logToMessageBox(message) {
    const logContentDiv = document.getElementById("logContent");
    if (logContentDiv) {
      if (logCounter === 1 && logContentDiv.innerHTML.includes("Click on the map")) {
        logContentDiv.innerHTML = "";
      }
      const entry = document.createElement("div");
      const sanitizedMessage = message.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      entry.innerHTML = `${logCounter++}. ${sanitizedMessage}`;
      logContentDiv.insertBefore(entry, logContentDiv.firstChild);
      if (logContentDiv.children.length > 30) {
        logContentDiv.removeChild(logContentDiv.lastChild);
      }
    }
    console.log("MSG_BOX: " + message);
  }

  const webmap = new WebMap({
    portalItem: {
      id: "f63d18b1d66e463bba1a2194c19467cc"
    }
  });

  const view = new MapView({
    container: "viewDiv",
    map: webmap,
    center: [0, 10],
    zoom: 3,
  constraints: {
    maxScale: 12000000,  // Do not allow zooming in beyond 1:12M
    minScale: 200000000  // Optional: prevent zooming too far out
  }  });

  view.popup.autoOpenEnabled = false;

  const highlightGraphicsLayer = new GraphicsLayer({ title: "Highlight Layer" });
  webmap.add(highlightGraphicsLayer);

  let halaibProjectedGeometries = [];

  view.when(() => {
    logToMessageBox("Map and view are ready.");

    webmap.when(() => {
      const halaibLayer = webmap.allLayers.find(layer => layer.title === "Halaib");

      if (!halaibLayer) {
        logToMessageBox("WARNING: 'Halaib' layer NOT FOUND.");
        return;
      }

      halaibLayer.visible = true;
      halaibLayer.definitionExpression = "STSCOD = 99"; // Filter visually too

      halaibLayer.when(() => {
        halaibLayer.queryFeatures({
          where: "STSCOD = 99", // Actual filter
          returnGeometry: true,
          outFields: ["*"]
        }).then(response => {
          if (response.features.length > 0) {
            projection.load().then(() => {
              halaibProjectedGeometries = response.features.map(f =>
                projection.project(f.geometry, view.spatialReference)
              );

              logToMessageBox(`Projected ${halaibProjectedGeometries.length} filtered Halaib polygons.`);

             // halaibProjectedGeometries.forEach(geom => {
             //   highlightGraphicsLayer.add(new Graphic({
             //     geometry: geom,
             //     symbol: {
             //       type: "simple-fill",
             //      color: [0, 255, 0, 0.3],
             //       outline: { color: [0, 255, 0], width: 2 }
             //     }
             //   }));
            //  });
            });
          } else {
            logToMessageBox("No filtered features found in Halaib.");
          }
        }).catch(err => {
          logToMessageBox("ERROR querying Halaib: " + err.message);
        });
      });

      view.on("click", event => {
        const point = event.mapPoint;
        logCounter = 1;
        logToMessageBox("--- New Click Event ---");
        logToMessageBox(`Clicked at: ${point.longitude.toFixed(4)}, ${point.latitude.toFixed(4)}`);

        if (
          halaibProjectedGeometries.length &&
          halaibProjectedGeometries.some(geom => geometryEngine.contains(geom, point))
        ) {
          logToMessageBox("Click is inside filtered Halaib — popup suppressed.");
          return;
        }

        logToMessageBox("Click is outside Halaib — running hitTest.");

        view.hitTest(event).then((response) => {
          const graphicResult = response.results.find(r =>
            r.graphic?.layer?.popupTemplate
          );
          if (graphicResult) {
            view.popup.open({
              features: [graphicResult.graphic],
              location: event.mapPoint
            });
          }
        });
      });
    });
  });
});
