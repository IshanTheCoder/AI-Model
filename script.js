const URL = "https://teachablemachine.withgoogle.com/models/Ur8KUWNUn/";

let model, webcam, labelContainer, maxPredictions;
let predictionLoopRunning = false;

async function init() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  const flip = true;
  webcam = new tmImage.Webcam(200, 200, flip);
  await webcam.setup();
  await webcam.play();

  document.getElementById("webcam-container").appendChild(webcam.canvas);
  labelContainer = document.getElementById("label-container");

  predictionLoopRunning = true;
  window.requestAnimationFrame(loop);
}

async function loop() {
  if (!predictionLoopRunning) return;

  webcam.update();
  await predictLive();
  window.requestAnimationFrame(loop);
}

async function predictLive() {
  const prediction = await model.predict(webcam.canvas);

  const filtered = prediction
    .filter(p => p.probability >= 0.05)
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 3);

  labelContainer.innerHTML = "";
  filtered.forEach(p => {
    const label = `${p.className}: ${(p.probability * 100).toFixed(2)}%`;
    const div = document.createElement("div");
    div.textContent = label;
    labelContainer.appendChild(div);
  });
}

async function takePicture() {
  if (!webcam || !model) return;

  // Capture current webcam frame into a canvas
  const snapshotCanvas = document.createElement("canvas");
  snapshotCanvas.width = webcam.canvas.width;
  snapshotCanvas.height = webcam.canvas.height;
  const context = snapshotCanvas.getContext("2d");
  context.drawImage(webcam.canvas, 0, 0);

  // Display snapshot image
  const imgElement = document.getElementById("snapshot");
  imgElement.src = snapshotCanvas.toDataURL("image/png");
  imgElement.style.display = "block";

  // Stop updating predictions from the live feed
  predictionLoopRunning = false;

  // Run prediction just on this frame
  const prediction = await model.predict(snapshotCanvas);
  const filtered = prediction
    .filter(p => p.probability >= 0.05)
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 3);

  labelContainer.innerHTML = "";
  if (filtered.length === 0) {
    labelContainer.innerHTML = "No confident predictions (above 5%).";
  } else {
    filtered.forEach(p => {
      const label = `${p.className}: ${(p.probability * 100).toFixed(2)}%`;
      const div = document.createElement("div");
      div.textContent = label;
      labelContainer.appendChild(div);
    });
  }
}
