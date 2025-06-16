require([
  "esri/views/MapView",
  "esri/WebMap"
], function(MapView, WebMap) {

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
      id: "6352a17864b347168ef950421f6c8b8c"
    }
  });

  const view = new MapView({
    container: "viewDiv",
    map: webmap,
scale: 200000000,
    constraints: {
      maxScale: 12000000,
      minScale: 200000000
    }
  });

  // --- Popup Configuration ---
  view.popup.autoOpenEnabled = false;
  view.popup.highlightEnabled = false;

  view.when(() => {
    logToMessageBox("Map and view are ready.");
// Logic for Disclaimer Scroll Buttons
const disclaimerContent = document.getElementById('disclaimerContent');
const disclaimerScrollUpBtn = document.getElementById('disclaimerScrollUp');
const disclaimerScrollDownBtn = document.getElementById('disclaimerScrollDown');

if(disclaimerContent && disclaimerScrollUpBtn && disclaimerScrollDownBtn) {
    const scrollAmount = 12; // Scroll by one line (10px font size + 2px buffer)

    disclaimerScrollUpBtn.addEventListener('click', function() {
        disclaimerContent.scrollTop -= scrollAmount;
    });

    disclaimerScrollDownBtn.addEventListener('click', function() {
        disclaimerContent.scrollTop += scrollAmount;
    });
}

const fullscreenBtn = document.getElementById('fullscreen-btn');
const contentSection = document.querySelector('.content-section');

if (fullscreenBtn && contentSection) {
    fullscreenBtn.addEventListener('click', function() {
        contentSection.classList.toggle('fullscreen-map');
        // Change button icon and title
        if (contentSection.classList.contains('fullscreen-map')) {
            fullscreenBtn.textContent = '✖'; // Exit icon
            fullscreenBtn.title = "Exit full screen";
        } else {
            fullscreenBtn.textContent = '⛶';
            fullscreenBtn.title = "Expand to full screen";
        }
        // Helps ArcGIS map resize correctly
        setTimeout(function() {
            view.resize();
        }, 350);
    });
}
    webmap.when(() => {
      const halaibLayer = webmap.allLayers.find(layer => layer.title === "Halaib");
      if (halaibLayer) {
        halaibLayer.visible = true;
        halaibLayer.definitionExpression = "STSCOD = 99";
      } else {
        logToMessageBox("WARNING: 'Halaib' layer NOT FOUND.");
      }
      
      // *** POP up configuration***
      const targetLayerTitle = "Update evaluation reports with cote _ turkey_Popup";

      view.on("click", event => {
        logCounter = 1;
        logToMessageBox("--- New Click Event ---");

        view.hitTest(event).then((response) => {
          
          // Find a feature that belongs to the specific target layer
          const graphicResult = response.results.find(result => {
            const layer = result.graphic?.layer;
            return layer && 
                   layer.title === targetLayerTitle && 
                   layer.popupTemplate;
          });

          if (graphicResult) {
            // If a valid feature from the target layer was clicked, open its popup.
            logToMessageBox(`Feature found on layer: "${targetLayerTitle}". Opening popup.`);
            view.popup.open({
              features: [graphicResult.graphic],
              location: event.mapPoint
            });
          } else {
            // If no feature was found, or the feature was from a different layer, do nothing.
            logToMessageBox("Click did not hit a feature on the target layer.");
            view.popup.close();
          }
        });
      });
    });
  });
});