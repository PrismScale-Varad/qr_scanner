import { useEffect, useState, useRef } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import { useRouter } from "next/router";

export default function Home() {
  const [qrData, setQrData] = useState("No result");
  const videoRef = useRef(null);
  const router = useRouter();

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
              controls.stop();
              // Redirect to /person/[id] with the scanned data as the ID
              router.push(`/person/${scannedData}`);
              
              // Stop the scanner once the QR code is scanned
            }
          }
        );
        
      } catch (error) {
        console.error("Error starting QR scanner:", error);
      }
    };

    startScanner();    
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">QR Code Scanner</h1>
      <video ref={videoRef} className="w-80 h-80 border"></video>
      <p className="mt-4 text-lg">Scanned Data: {qrData}</p>
    </div>
  );
}
