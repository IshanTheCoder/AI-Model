const URL = "https://teachablemachine.withgoogle.com/models/Ur8KUWNUn/";

let model, webcam, labelContainer, maxPredictions;
let isPredicting = true; // control prediction loop

async function init() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  try {
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
  } catch (error) {
    console.error("Model load error:", error);
    return;
  }

  const flip = true;
  webcam = new tmImage.Webcam(200, 200, flip);

  try {
    await webcam.setup();
    await webcam.play();
  } catch (err) {
    alert("Camera permission denied or unavailable.");
    return;
  }

  document.getElementById("webcam-container").appendChild(webcam.canvas);
  labelContainer = document.getElementById("label-container");

  for (let i = 0; i < maxPredictions; i++) {
    labelContainer.appendChild(document.createElement("div"));
  }

  isPredicting = true;
  window.requestAnimationFrame(loop);
}

async function loop() {
  if (isPredicting) {
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
  }
}

async function predict() {
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
  // Stop predictions
  isPredicting = false;

  // Take snapshot
  const snapshotCanvas = document.createElement("canvas");
  snapshotCanvas.width = webcam.canvas.width;
  snapshotCanvas.height = webcam.canvas.height;
  const context = snapshotCanvas.getContext("2d");
  context.drawImage(webcam.canvas, 0, 0);

  const imgElement = document.getElementById("snapshot");
  imgElement.src = snapshotCanvas.toDataURL("image/png");
  imgElement.style.display = "block";

  // Predict once on the snapshot
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
