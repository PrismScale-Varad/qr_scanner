import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { BrowserQRCodeReader } from "@zxing/browser";

export default function Home() {
  const [qrData, setQrData] = useState("No result");
  const videoRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const codeReader = new BrowserQRCodeReader();

    codeReader
      .decodeOnceFromVideoDevice(undefined, videoRef.current)
      .then((result) => {
        const scannedData = result.text;
        console.log("Scanned QR Code:", scannedData);
        setQrData(scannedData);

        // Redirect to /person/[id] with the scanned data as the ID
        router.push(`/person/${scannedData}`);
      })
      .catch((err) => {
        console.error("QR Code Error:", err);
      });

    return () => {
      
    };
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">QR Code Scanner</h1>
      <video ref={videoRef} className="w-80 h-80 border"></video>
      <p className="mt-4 text-lg">Scanned Data: {qrData}</p>
    </div>
  );
}
