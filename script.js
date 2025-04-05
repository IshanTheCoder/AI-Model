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
  const filtered = prediction.filter(p => p.probability >= 0.05);
  const top3 = filtered.sort((a, b) => b.probability - a.probability).slice(0, 3);

  labelContainer.innerHTML = "";
  top3.forEach(p => {
    const label = `${p.className}: ${(p.probability * 100).toFixed(2)}%`;
    const div = document.createElement("div");
    div.textContent = label;
    labelContainer.appendChild(div);
  });
}

async function takePicture() {
  stopPredictionLoop(); // stop live predictions

  const snapshotCanvas = document.createElement("canvas");
  snapshotCanvas.width = webcam.canvas.width;
  snapshotCanvas.height = webcam.canvas.height;
  const context = snapshotCanvas.getContext("2d");
  context.drawImage(webcam.canvas, 0, 0);

  const imgElement = document.getElementById("snapshot");
  imgElement.src = snapshotCanvas.toDataURL("image/png");
  imgElement.style.display = "block";

  const prediction = await model.predict(snapshotCanvas);
  const filtered = prediction.filter(p => p.probability >= 0.05);
  const top3 = filtered.sort((a, b) => b.probability - a.probability).slice(0, 3);

  labelContainer.innerHTML = "";
  top3.forEach(p => {
    const label = `${p.className}: ${(p.probability * 100).toFixed(2)}%`;
    const div = document.createElement("div");
    div.textContent = label;
    labelContainer.appendChild(div);
  });
}
