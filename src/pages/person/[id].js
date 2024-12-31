// pages/person.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Person() {
  const [personData, setPersonData] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { id } = router.query; // Get the ID from the URL

  useEffect(() => {
    if (id) {
      // Make API call to fetch data for the person
      fetch(`https://67738d5e77a26d4701c5a1d8.mockapi.io/users/${id}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error("Network response was not ok");
          }
          return res.json();
        })
        .then((data) => {
          setPersonData(data);
        })
        .catch((err) => {
          console.error("API Error:", err);
          setError("Failed to fetch data. Please try again.");
        });
    }
  }, [id]);

  const handleGoBack = () => {
    router.push("/"); // Go back to home page
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Person Details</h1>
      {error && (
        <div className="mt-4 text-red-500">
          <p>{error}</p>
        </div>
      )}
      {personData ? (
        <div className="mt-4 p-4 border rounded bg-gray-100 dark:text-gray-900">
          <h2 className="text-lg font-bold">Person Info:</h2>
          <pre>{JSON.stringify(personData, null, 2)}</pre>
        </div>
      ) : (
        <p>Loading...</p>
      )}
      <button
        onClick={handleGoBack}
        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
      >
        Go Back to Home
      </button>
    </div>
  );
}
