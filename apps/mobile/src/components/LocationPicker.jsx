import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X, MapPin, Search, Navigation } from "lucide-react-native";
import { colors } from "@/theme/colors";
import {
  getCurrentPosition,
  geocodeAddress,
  reverseGeocode,
  requestLocationPermission,
} from "@/utils/location";

const DEFAULT_REGION = {
  latitude: 44.4268,
  longitude: 26.1025,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function LocationPicker({
  visible,
  onConfirm,
  onCancel,
  initialLocation,
}) {
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);
  const [marker, setMarker] = useState(
    initialLocation
      ? { latitude: initialLocation.latitude, longitude: initialLocation.longitude }
      : null
  );
  const [region, setRegion] = useState(
    initialLocation
      ? {
          latitude: initialLocation.latitude,
          longitude: initialLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }
      : DEFAULT_REGION
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [addressInfo, setAddressInfo] = useState(null);

  useEffect(() => {
    if (visible && !initialLocation) {
      handleLocateMe(true);
    }
  }, [visible]);

  const handleLocateMe = async (silent = false) => {
    setLocating(true);
    try {
      const position = await getCurrentPosition();
      const newRegion = {
        latitude: position.latitude,
        longitude: position.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setMarker(position);
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 500);

      const addr = await reverseGeocode(position.latitude, position.longitude);
      if (addr) setAddressInfo(addr);
    } catch (error) {
      if (!silent) {
        console.warn("Could not get current position:", error.message);
      }
    } finally {
      setLocating(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const result = await geocodeAddress(searchQuery);
      if (result) {
        const newRegion = {
          latitude: result.latitude,
          longitude: result.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setMarker(result);
        setRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 500);

        const addr = await reverseGeocode(result.latitude, result.longitude);
        if (addr) setAddressInfo(addr);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleMapPress = async (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarker({ latitude, longitude });

    const addr = await reverseGeocode(latitude, longitude);
    if (addr) setAddressInfo(addr);
  };

  const handleMarkerDragEnd = async (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarker({ latitude, longitude });

    const addr = await reverseGeocode(latitude, longitude);
    if (addr) setAddressInfo(addr);
  };

  const handleConfirm = () => {
    if (!marker) return;
    onConfirm({
      latitude: marker.latitude,
      longitude: marker.longitude,
      streetAddress: addressInfo?.streetAddress || "",
      city: addressInfo?.city || "",
      county: addressInfo?.county || "",
      postalCode: addressInfo?.postalCode || "",
    });
  };

  const handleClose = () => {
    setSearchQuery("");
    setAddressInfo(null);
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Alege locatia</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <Search size={18} color={colors.text.tertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Cauta o adresa..."
              placeholderTextColor={colors.text.tertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searching && (
              <ActivityIndicator size="small" color={colors.primary.teal} />
            )}
          </View>
        </View>

        {/* Map */}
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={region}
            onPress={handleMapPress}
            showsUserLocation
            showsMyLocationButton={false}
          >
            {marker && (
              <Marker
                coordinate={marker}
                draggable
                onDragEnd={handleMarkerDragEnd}
              />
            )}
          </MapView>

          {/* My Location Button */}
          <TouchableOpacity
            style={styles.locateButton}
            onPress={() => handleLocateMe(false)}
            disabled={locating}
          >
            {locating ? (
              <ActivityIndicator size="small" color={colors.primary.teal} />
            ) : (
              <Navigation size={20} color={colors.primary.teal} />
            )}
          </TouchableOpacity>
        </View>

        {/* Address Preview & Confirm */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          {addressInfo && (
            <View style={styles.addressPreview}>
              <MapPin size={18} color={colors.primary.teal} />
              <View style={styles.addressTextContainer}>
                <Text style={styles.addressMain} numberOfLines={1}>
                  {addressInfo.streetAddress || "Locatie selectata"}
                </Text>
                <Text style={styles.addressSecondary} numberOfLines={1}>
                  {[addressInfo.city, addressInfo.county, addressInfo.postalCode]
                    .filter(Boolean)
                    .join(", ")}
                </Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.confirmButton, !marker && styles.confirmButtonDisabled]}
            onPress={handleConfirm}
            disabled={!marker}
          >
            <Text style={styles.confirmButtonText}>Confirma locatia</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text.primary,
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    flex: 1,
  },
  locateButton: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  addressPreview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 12,
  },
  addressTextContainer: {
    flex: 1,
  },
  addressMain: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.primary,
  },
  addressSecondary: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
  confirmButton: {
    backgroundColor: colors.primary.teal,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.ui.white,
  },
});
