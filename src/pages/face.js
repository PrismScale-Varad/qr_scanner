import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";

export default function FacePage() {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [devices, setDevices] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState("");
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const router = useRouter();
    const api_url = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        // Fetch available video devices on mount
        navigator.mediaDevices
            .enumerateDevices()
            .then((deviceList) => {
                const videoDevices = deviceList.filter(
                    (device) => device.kind === "videoinput"
                );
                setDevices(videoDevices);
                if (videoDevices.length > 0) {
                    setSelectedDevice(videoDevices[0].deviceId);
                }
            })
            .catch((err) => {
                setError("Unable to access devices. Please check permissions.");
                console.error(err);
            });
    }, []);

    useEffect(() => {
        // Automatically start the camera on load
        if (selectedDevice) {
            startCamera();
        }
    }, [selectedDevice]);

    const startCamera = () => {
        navigator.mediaDevices
            .getUserMedia({ video: { deviceId: selectedDevice || undefined } })
            .then((stream) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            })
            .catch((err) => {
                setError("Unable to access the camera. Please check permissions.");
                console.error(err);
            });
    };

    const captureImage = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext("2d");
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            context.drawImage(videoRef.current, 0, 0);
            canvasRef.current.toBlob(processImage, "image/png");
        }
    };

    const processImage = async (blob) => {
        setLoading(true);
        setError("");
        try {
            const reader = new FileReader();
            reader.readAsDataURL(blob);

            reader.onloadend = async () => {
                const base64Image = reader.result;

                const response = await fetch("/api/huggingface", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ image: base64Image }),
                });

                if (!response.ok) {
                    throw new Error("Failed to process image.");
                }

                const { embedding } = await response.json();

                const bookingResponse = await fetch(`${api_url}/face`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ embedding: embedding }),
                });

                if (!bookingResponse.ok) {
                    throw new Error("Failed to submit embeddings.");
                }

                const bookingData = await bookingResponse.json();
                router.push(`/booking/${bookingData.id}`);
            };
        } catch (err) {
            console.error(err);
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
            <h1 className="text-xl font-bold mb-4">Face Recognition</h1>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <div className="mb-4">
                <video ref={videoRef} autoPlay className="w-full rounded mb-2 max-w-1/2 scale-x-[-1]" />
            </div>
            <div className="mb-4">
                <label htmlFor="deviceSelect" className="block mb-2">
                    Choose Camera:
                </label>
                <select
                    id="deviceSelect"
                    className="px-2 py-1 bg-gray-800 text-white rounded"
                    value={selectedDevice}
                    onChange={(e) => setSelectedDevice(e.target.value)}
                >
                    {devices.map((device) => (
                        <option key={device.deviceId} value={device.deviceId}>
                            {device.label || `Camera ${device.deviceId}`}
                        </option>
                    ))}
                </select>
            </div>
            <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-4"
                onClick={startCamera}
            >
                Start Camera
            </button>
            <canvas ref={canvasRef} className="hidden" />
            <div className="mb-4">
                <button
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    onClick={captureImage}
                    disabled={loading}
                >
                    {loading ? "Processing..." : "Capture"}
                </button>
            </div>
        </div>
    );
}
