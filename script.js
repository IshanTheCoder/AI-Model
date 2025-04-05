const URL = "https://teachablemachine.withgoogle.com/models/Ur8KUWNUn/";

let model, webcam, labelContainer, maxPredictions;
let isLive = false;
let loopId = null;

async function init() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  const flip = true;
  webcam = new tmImage.Webcam(200, 200, flip);
  await webcam.setup();
  await webcam.play();

  // Reset UI
  document.getElementById("webcam-container").innerHTML = "";
  document.getElementById("webcam-container").appendChild(webcam.canvas);
  document.getElementById("snapshot").style.display = "none";
  labelContainer = document.getElementById("label-container");
  labelContainer.innerHTML = "";

  // Start loop
  isLive = true;
  loop();
}

async function loop() {
  if (!isLive) return;
  webcam.update();
  await predictLive();
  loopId = requestAnimationFrame(loop);
}

async function predictLive() {
  const prediction = await model.predict(webcam.canvas);
  const top3 = prediction
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 3);

  labelContainer.innerHTML = "";
  top3.forEach(p => {
    const label = `${p.className}: ${(p.probability * 100).toFixed(2)}%`;
    const div = document.createElement("div");
    div.textContent = label;
    labelContainer.appendChild(div);
  });
}

async function takePicture() {
  // Stop prediction loop
  isLive = false;
  if (loopId) {
    cancelAnimationFrame(loopId);
    loopId = null;
  }

  // Stop webcam
  if (webcam && webcam.stop) {
    webcam.stop();
  }

  // Take snapshot
  const snapshotCanvas = document.createElement("canvas");
  snapshotCanvas.width = webcam.canvas.width;
  snapshotCanvas.height = webcam.canvas.height;
  const ctx = snapshotCanvas.getContext("2d");
  ctx.drawImage(webcam.canvas, 0, 0);

  // Show image
  const img = document.getElementById("snapshot");
  img.src = snapshotCanvas.toDataURL("image/png");
  img.style.display = "block";

  // Predict from the snapshot
  const prediction = await model.predict(snapshotCanvas);
  const top3 = prediction
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 3);

  labelContainer.innerHTML = "";
  top3.forEach(p => {
    const label = `${p.className}: ${(p.probability * 100).toFixed(2)}%`;
    const div = document.createElement("div");
    div.textContent = label;
    labelContainer.appendChild(div);
  });
}
