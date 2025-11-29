import { useState, useCallback, useEffect } from "react";
import useUser from "@/utils/useUser";

export default function OnboardingPage() {
  const { data: user, loading: userLoading } = useUser();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    user_type: "customer",
    location_address: "",
    location_city: "",
    location_state: "",
    location_zip: "",
  });

  useEffect(() => {
    // Load pending profile data from localStorage
    if (typeof window !== "undefined") {
      const pendingFirstName = localStorage.getItem("pendingFirstName");
      const pendingLastName = localStorage.getItem("pendingLastName");

      if (pendingFirstName || pendingLastName) {
        setFormData((prev) => ({
          ...prev,
          first_name: pendingFirstName || "",
          last_name: pendingLastName || "",
        }));
      }
    }
  }, []);

  const handleComplete = useCallback(async () => {
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      alert("Please enter your first and last name.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/profile/complete", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to complete profile");
      }

      // Clear any pending data
      if (typeof window !== "undefined") {
        localStorage.removeItem("pendingFirstName");
        localStorage.removeItem("pendingLastName");
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Profile completion error:", error);
      alert("Failed to complete profile. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [formData]);

  const handleSkip = useCallback(() => {
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  }, []);

  if (userLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Complete Your Profile
          </h1>

          <p className="text-gray-600">
            Help us personalize your ServiceHub experience
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleComplete();
          }}
          className="space-y-6"
        >
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      first_name: e.target.value,
                    }))
                  }
                  placeholder="John"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      last_name: e.target.value,
                    }))
                  }
                  placeholder="Doe"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                placeholder="(555) 123-4567"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* User Type */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              How will you use ServiceHub?
            </h3>

            <div className="space-y-3">
              {[
                {
                  value: "customer",
                  label: "I need services",
                  desc: "Find trusted professionals for your needs",
                },
                {
                  value: "provider",
                  label: "I provide services",
                  desc: "Offer your professional services to customers",
                },
                {
                  value: "both",
                  label: "Both",
                  desc: "Sometimes I need services, sometimes I provide them",
                },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    formData.user_type === option.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="user_type"
                    value={option.value}
                    checked={formData.user_type === option.value}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        user_type: e.target.value,
                      }))
                    }
                    className="w-4 h-4 text-blue-600 mr-4"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">
                      {option.label}
                    </div>
                    <div className="text-sm text-gray-600">{option.desc}</div>
                  </div>
                  {formData.user_type === option.value && (
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Location (Optional)
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.location_address}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      location_address: e.target.value,
                    }))
                  }
                  placeholder="123 Main Street"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.location_city}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        location_city: e.target.value,
                      }))
                    }
                    placeholder="New York"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.location_state}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        location_state: e.target.value,
                      }))
                    }
                    placeholder="NY"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="w-32">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={formData.location_zip}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      location_zip: e.target.value,
                    }))
                  }
                  placeholder="10001"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={handleSkip}
              className="flex-1 px-6 py-3 text-gray-600 hover:text-gray-800 font-medium"
            >
              Skip for now
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Completing...
                </div>
              ) : (
                "Complete Setup"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
