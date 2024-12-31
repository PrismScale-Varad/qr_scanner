import { useEffect, useState, useRef } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import { useRouter } from "next/router";

export default function Home() {
  const [qrData, setQrData] = useState("No result");
  const [isScanned, setIsScanned] = useState(null);  // Track if scan is successful
  const [devices, setDevices] = useState([]);  // Store available devices
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);  // Store the selected device ID
  const [fileName, setFileName] = useState(""); // Store the file name
  const videoRef = useRef(null);
  const router = useRouter();
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Fetch available devices
    const getDevices = async () => {
      const mediaDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = mediaDevices.filter(device => device.kind === 'videoinput');
  
      // Prioritize back camera (facingMode: 'environment') as default
      const backCamera = videoDevices.find(device => device.label.toLowerCase().includes('back') || device.deviceId.includes('environment'));
      
      if (backCamera) {
        setSelectedDeviceId(backCamera.deviceId); // Set back camera as default
      } else if (videoDevices.length > 0) {
        setSelectedDeviceId(videoDevices[0].deviceId); // If no back camera, use the first available camera
      }
  
      setDevices(videoDevices); // Update the list of devices
    };
  
    getDevices();
  }, []);
  

  useEffect(() => {
    if (selectedDeviceId) {
      const codeReader = new BrowserQRCodeReader();

      const startScanner = async () => {
        try {
          const previewElem = videoRef.current;

          // Start the QR code scanner with the selected device
          const controls = await codeReader.decodeFromVideoDevice(
            selectedDeviceId,
            previewElem,
            (result, error, controls) => {
              if (result) {
                const scannedData = result.text;
                console.log("Scanned QR Code:", scannedData);
                setQrData(scannedData);

                // Try to cast the scanned QR code data to an integer
                const parsedId = parseInt(scannedData, 10);

                // If parsedId is a valid integer, change border to green and redirect after 200ms
                if (!isNaN(parsedId)) {
                  setIsScanned(true);  // Set scan successful
                  controls.stop();

                  // Delay the redirect by 200ms
                  setTimeout(() => {
                    router.push(`/person/${parsedId}`);
                  }, 300);
                } else {
                  setIsScanned(false);  // Invalid scan
                  setQrData("Invalid QR Code. Please scan a valid ID.");
                }
              }
            }
          );
        } catch (error) {
          console.error("Error starting QR scanner:", error);
        }
      };

      startScanner();
    }
  }, [selectedDeviceId, router]);

  // Handle file input for QR code scanning from an image
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);  // Update file name
      const codeReader = new BrowserQRCodeReader();
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = async () => {
        try {
          const result = await codeReader.decodeFromImageElement(img);
          console.log("Scanned QR Code from file:", result.text);
          setQrData(result.text);

          // Try to cast the scanned QR code data to an integer
          const parsedId = parseInt(result.text, 10);

          // If parsedId is a valid integer, change border to green and redirect after 200ms
          if (!isNaN(parsedId)) {
            setIsScanned(true);  // Set scan successful
            router.push(`/person/${parsedId}`); // Redirect to /person/[id]
          } else {
            setIsScanned(false);  // Invalid scan
            setQrData("Invalid QR Code. Please scan a valid ID.");
          }
        } catch (error) {
          console.error("Error scanning the QR code from the file:", error);
          setQrData("Failed to scan QR Code from the file.");
        }
      };
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className={`text-2xl font-bold mb-4 `}>QR Code Scanner</h1>

      {/* Camera selection dropdown */}
      <div className="mb-4">
        <label htmlFor="cameraSelect" className="mr-2">Select Camera:</label>
        <select
          id="cameraSelect"
          value={selectedDeviceId || ''}
          onChange={(e) => setSelectedDeviceId(e.target.value)}
          className="px-4 py-2 bg-gray-700 rounded-md"
        >
          {devices.map(device => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Camera ${device.deviceId}`}
            </option>
          ))}
        </select>
      </div>

      {/* Video feed with border color based on scan status */}
      <video
        ref={videoRef}
        className={`w-80 h-80 border rounded-xl object-cover ${isScanned === true ? "border-green-500" : isScanned === false ? "border-red-500" : "border-gray-300"}`}
      ></video>
      <p className={`mt-4 text-lg ${isScanned === true ? "text-green-500" : isScanned === false ? "text-red-500" : "text-gray-300"}`}>
        Scanned Data: {qrData}
      </p>

      {/* File input for QR code image scanning */}
      <div className="mt-6 flex flex-col items-center gap-2">
        <label htmlFor="fileInput" className="px-4 py-2 text-white rounded cursor-pointer bg-gray-700 hover:bg-blue-700">
          Choose File
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          id="fileInput"
          onChange={handleFileChange}
          className="hidden" // Hides the default file input element
        />
        <span className="text-lg">{fileName ? fileName : ""}</span> {/* Display file name if selected */}
      </div>


    </div>
  );
}
