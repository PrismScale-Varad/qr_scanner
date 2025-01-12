import { Client } from "@gradio/client";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { image } = req.body;

    // Convert base64 to Blob for processing
    const response_0 = await fetch(image);
    const exampleImage = await response_0.blob();

    // Connect to Hugging Face Spaces API
    const client = await Client.connect("Varad-13/face-recognition-poc");
    const result = await client.predict("/predict_1", { img_path: exampleImage });

    if (!result.data || !Array.isArray(result.data)) {
      throw new Error("Invalid response from Hugging Face API");
    }
    res.status(200).json(result.data[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
