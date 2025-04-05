const URL = "https://teachablemachine.withgoogle.com/models/Ur8KUWNUn/";

let model, webcam, labelContainer, maxPredictions;
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

  document.getElementById("webcam-container").appendChild(webcam.canvas);

  labelContainer = document.getElementById("label-container");
  labelContainer.innerHTML = "";
  for (let i = 0; i < maxPredictions; i++) {
    labelContainer.appendChild(document.createElement("div"));
  }

  // Start loop and save the ID so we can stop it
  loopId = requestAnimationFrame(loop);
}

async function loop() {
  webcam.update();
  await predictLive();
  loopId = requestAnimationFrame(loop); // keep looping
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
  // Stop live loop
  if (loopId) {
    cancelAnimationFrame(loopId);
    loopId = null;
  }

  // Stop webcam feed
  if (webcam && webcam.stop) {
    webcam.stop();
  }

  // Take snapshot from webcam canvas
  const snapshotCanvas = document.createElement("canvas");
  snapshotCanvas.width = webcam.canvas.width;
  snapshotCanvas.height = webcam.canvas.height;
  const ctx = snapshotCanvas.getContext("2d");
  ctx.drawImage(webcam.canvas, 0, 0);

  // Show snapshot image
  const img = document.getElementById("snapshot");
  img.src = snapshotCanvas.toDataURL("image/png");
  img.style.display = "block";

  // Predict from snapshot
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
