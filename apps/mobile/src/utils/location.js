import * as Location from "expo-location";

export async function requestLocationPermission() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === "granted";
}

export async function getCurrentPosition() {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) {
    throw new Error("Location permission not granted");
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
}

export async function geocodeAddress(address) {
  try {
    const results = await Location.geocodeAsync(address);
    if (results && results.length > 0) {
      return {
        latitude: results[0].latitude,
        longitude: results[0].longitude,
      };
    }
    return null;
  } catch (error) {
    console.error("Geocode error:", error);
    return null;
  }
}

export async function reverseGeocode(latitude, longitude) {
  try {
    const results = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (results && results.length > 0) {
      const result = results[0];
      return {
        streetAddress: [result.streetNumber, result.street]
          .filter(Boolean)
          .join(" "),
        city: result.city || result.subregion || "",
        county: result.region || "",
        postalCode: result.postalCode || "",
        country: result.isoCountryCode || "RO",
      };
    }
    return null;
  } catch (error) {
    console.error("Reverse geocode error:", error);
    return null;
  }
}
