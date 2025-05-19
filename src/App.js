// App.js
import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import cupImage from './assets/image-removebg-preview (90).png';

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [alert, setAlert] = useState("");

  useEffect(() => {
    const waitForRoboflow = async () => {
      const interval = setInterval(async () => {
        if (window.roboflow) {
          clearInterval(interval);

          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoRef.current.srcObject = stream;

            const rf = await window.roboflow.auth({
              publishable_key: process.env.REACT_APP_ROBOFLOW_KEY
            });

            const model = await rf.load({
              model: "dave-blunts-and-cookies",
              version: 1
            });

            const detectLoop = async () => {
              try {
                const predictions = await model.detect(videoRef.current);
                console.log("Predictions:", predictions);

                let foundDave = false;
                let foundCookie = false;

                predictions.forEach(pred => {
                  const cls = pred.class.toLowerCase();
                  if (cls.includes("dave")) foundDave = true;
                  if (cls.includes("cookie")) foundCookie = true;
                });

                const ctx = canvasRef.current.getContext('2d');
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

                predictions.forEach(pred => {
                  const { x, y, width, height, class: label } = pred;
                  ctx.strokeStyle = label.toLowerCase().includes("cookie") ? "#ff0000" : "#00ff00";
                  ctx.lineWidth = 3;
                  ctx.strokeRect(x - width / 2, y - height / 2, width, height);
                  ctx.fillStyle = "white";
                  ctx.font = "16px 'Courier New', monospace";
                  ctx.fillText(label, x - width / 2, y - height / 2 - 5);
                });

                if (foundDave && foundCookie) {
                  setAlert("🔥 PUT THE COOKIES DOWN, DAVE! THIS ISN'T THE SNACK YOURE LOOKING FOR! 🍪");
                } else {
                  setAlert("");
                }

                requestAnimationFrame(detectLoop);
              } catch (err) {
                console.error("Detection error:", err);
              }
            };

            detectLoop();
          } catch (err) {
            console.error("Roboflow load/auth error:", err);
          }
        }
      }, 500);
    };

    waitForRoboflow();
  }, []);

  return (
    <div className="app">
      <h1 className="hero-text">☁️ Dave Blunts Please, no cookies please! 🍪</h1>
      <div className="video-container">
        <video ref={videoRef} autoPlay muted playsInline width="640" height="480" />
        <canvas ref={canvasRef} width="640" height="480" />
      </div>
      <h2 className="alert-box flashy-alert">{alert}</h2>
      <div className="footer">
        <p className="footer-text">💨 Brought to you by Dave Blunts Detection Tech</p>
        <div className="cup">
          <img src={cupImage} alt="Chill Cup" width="100" />
        </div>
      </div>
    </div>
  );
}

export default App;