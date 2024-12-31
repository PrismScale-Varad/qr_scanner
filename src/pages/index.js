import { useEffect, useState, useRef } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import { useRouter } from "next/router";

export default function Home() {
  const [qrData, setQrData] = useState("No result");
  const [isScanned, setIsScanned] = useState(null);  // Track if scan is successful
  const videoRef = useRef(null);
  const router = useRouter();
  const fileInputRef = useRef(null);

  useEffect(() => {
    const codeReader = new BrowserQRCodeReader();

    const startScanner = async () => {
      try {
        const selectedDeviceId = undefined; // or specify the device ID if needed
        const previewElem = videoRef.current;

        // Start the QR code scanner
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
  }, [router]);

  // Handle file input for QR code scanning from an image
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
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
      {/* Set the border color based on the scan result */}
      <video
        ref={videoRef}
        className={`w-80 h-80 border ${isScanned === true ? "border-green-500" : isScanned === false ? "border-red-500" : "border-gray-300"}`}
      ></video>
      <p className={`mt-4 text-lg ${isScanned === true ? "text-green-500" : isScanned === false ? "text-red-500" : "text-gray-300"}`}>Scanned Data: {qrData}</p>

      <div className="mt-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        />
      </div>
    </div>
  );
}
