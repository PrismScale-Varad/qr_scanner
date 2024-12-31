import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Booking() {
  const [bookingData, setBookingData] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { id } = router.query; // Get the ID from the URL
  const api_url = process.env.NEXT_PUBLIC_API_URL
  useEffect(() => {
    if (id) {
      // Make API call to fetch data for the booking
      console.log(`${api_url}/${id}`)
      fetch(`${api_url}/${id}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error("Network response was not ok");
          }
          return res.json();
        })
        .then((data) => {
          setBookingData(data.bookingDetails);
        })
        .catch((err) => {
          setBookingData("Invalid");
          setError("Sorry, data not found");
        });
    }
  }, [id]);

  const handleCheckIn = async (personId) => {
    try {
      const response = await fetch(
        `${api_url}/check-in/${id}`, // Replace {id} with the booking ID
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ guestNumber: personId }),
        }
      );
  
      if (!response.ok) {
        throw new Error("Failed to check in the guest.");
      }
  
      const result = await response.json();
      console.log(`Person ${personId} successfully checked in:`, result);
  
      // Optionally refresh booking data after a successful check-in
      setBookingData((prev) => ({
        ...prev,
        checkedInGuests: prev.checkedInGuests + 1,
      }));
    } catch (error) {
      console.error(`Error checking in Person ${personId}:`, error.message);
    }
  };

  const handleGoBack = () => {
    router.push("/"); // Go back to home page
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center max-w-screen-sm justify-self-center">
      <h1 className="text-2xl font-bold">Booking Details</h1>
      {error && (
        <div className="mt-4 text-red-500">
          <p>{error}</p>
        </div>
      )}
      {bookingData ? (
        <div>
          <div className="flex flex-col mt-4 p-4 border rounded bg-gray-900 text-2xl text-white">
            <p>
              <strong>Booking Name:</strong> {bookingData.firstName} {bookingData.lastName} 
            </p>
            <p>
              <strong>Number of Guests:</strong> {bookingData.numberOfGuests}
            </p>
            <p>
              <strong>Checked-In Guests:</strong> {bookingData.checkedInGuests}
            </p>
          </div>
          <div className="flex flex-col mt-8 p-4 mb-8 rounded text-xl text-white gap-4">
            <h3 className="font-bold self-center text-2xl">Check-In</h3>
            {Array.from({ length: bookingData.numberOfGuests }, (_, index) => (
              <div
                key={index + 1}
                className="flex items-center justify-between bg-gray-800 p-4 rounded border"
              >
                <span>Person {index + 1}</span>
                <button
                  onClick={() => handleCheckIn(index + 1)}
                  disabled={index + 1 <= bookingData.checkedInGuests}
                  className={`px-4 py-2 rounded ${
                    index + 1 <= bookingData.checkedInGuests
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-700"
                  }`}
                >
                  {index + 1 <= bookingData.checkedInGuests
                    ? "Checked In"
                    : "Check In"}
                </button>
              </div>
            ))}
          </div>
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
