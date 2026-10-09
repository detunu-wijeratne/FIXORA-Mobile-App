import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { File } from "expo-file-system";
import { fetch as expoFetch } from "expo/fetch";
import ManualJobDateTimePicker, { localDateKey } from "../../components/ManualJobDateTimePicker";

import {
    addDoc,
    collection,
    doc,
    getDoc,
    runTransaction,
    serverTimestamp,
} from "firebase/firestore";

import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { auth, db } from "../../services/firebase";
import {
    colors,
    radius,
    spacing,
} from "../../theme/provider";

export default function CreateManualJobScreen() {
  const params = useLocalSearchParams<{ jobId?: string }>();
  const jobId = typeof params.jobId === "string" ? params.jobId : "";
  const isEditing = !!jobId;
  const [loadingJob, setLoadingJob] = useState(!!jobId);
  const [loadError, setLoadError] = useState("");
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [originalSchedule, setOriginalSchedule] = useState({ date: "", time: "" });
  const [customerName, setCustomerName] =
    useState("");

  const [customerPhone, setCustomerPhone] =
    useState("");

  const [customerEmail, setCustomerEmail] =
    useState("");

  const [service, setService] =
    useState("");

  const [date, setDate] =
    useState("");

  const [time, setTime] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [price, setPrice] =
    useState("");

  const [loading, setLoading] =
    useState(false);
  const [picker, setPicker] = useState<"date" | "time" | null>(null);
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [pickingPhoto, setPickingPhoto] = useState(false);
  const [uploadedPhoto, setUploadedPhoto] = useState<{ uri: string; url: string } | null>(null);

  useEffect(() => {
    if (!jobId) return;
    let active = true;
    setLoadingJob(true);
    setLoadError("");
    const loadJob = async () => {
      try {
        const user = auth.currentUser;
        if (!user) { router.replace("/provider/login"); return; }
        const snapshot = await getDoc(doc(db, "bookings", jobId));
        if (!snapshot.exists()) throw new Error("This job no longer exists.");
        const job = snapshot.data();
        if (job.providerId !== user.uid || job.source !== "manual") throw new Error("You can only edit your own manual jobs.");
        if (!active) return;
        setCustomerName(job.customerName || "");
        setCustomerPhone(job.customerPhone || "");
        setCustomerEmail(job.customerEmail || "");
        setService(job.service || "");
        setDate(job.date || "");
        setTime(job.time || "");
        setOriginalSchedule({ date: job.date || "", time: job.time || "" });
        setAddress(job.address || "");
        setDescription(job.description || "");
        setPrice(String(job.servicePrice ?? ""));
        setExistingImageUrl(job.imageUrl || "");
        setPhoto(null);
        setUploadedPhoto(null);
      } catch (error) {
        if (active) setLoadError(error instanceof Error ? error.message : "Unable to load job.");
      } finally {
        if (active) setLoadingJob(false);
      }
    };
    loadJob();
    return () => { active = false; };
  }, [jobId]);

  const choosePhoto = async () => {
    try {
      setPickingPhoto(true);
      if (Platform.OS !== "web") {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert("Photo permission required", "Please allow photo access to attach an image.");
          return;
        }
      }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8 });
      if (!result.canceled && result.assets[0]) {
        if (result.assets[0].fileSize && result.assets[0].fileSize > 10 * 1024 * 1024) {
          Alert.alert("Image too large", "Please choose an image smaller than 10 MB.");
          return;
        }
        setPhoto(result.assets[0]);
        setUploadedPhoto(null);
      }
    } catch {
      Alert.alert("Image error", "Unable to choose an image. Please try again.");
    } finally {
      setPickingPhoto(false);
    }
  };

  const uploadPhoto = async () => {
    if (!photo) return existingImageUrl;
    if (uploadedPhoto?.uri === photo.uri) return uploadedPhoto.url;
    const form = new FormData();
    const file = Platform.OS === "web"
      ? photo.file || await (await globalThis.fetch(photo.uri)).blob()
      : new File(photo.uri);
    form.append("file", file as Blob);
    form.append("upload_preset", "fixora_uploads");
    const response = await expoFetch("https://api.cloudinary.com/v1_1/yuoh84r1/image/upload", { method: "POST", body: form });
    const result = await response.json();
    if (!response.ok || typeof result.secure_url !== "string") {
      throw new Error(result.error?.message || "Image upload failed. Please try again.");
    }
    setUploadedPhoto({ uri: photo.uri, url: result.secure_url });
    return result.secure_url as string;
  };

  const handleCreateJob = async () => {
    if (loading || pickingPhoto || loadingJob || loadError) return;
    const user = auth.currentUser;

    if (!user) {
      router.replace("/provider/login");
      return;
    }

    if (!customerName.trim()) {
      Alert.alert(
        "Missing Customer",
        "Please enter the customer name."
      );
      return;
    }

    if (!service.trim()) {
      Alert.alert(
        "Missing Service",
        "Please enter the service type."
      );
      return;
    }

    const phoneDigits = customerPhone.trim().replace(/[\s-]/g, "");
    if (customerPhone.trim() && !/^(?:0?7\d{8}|\+947\d{8})$/.test(phoneDigits)) {
      Alert.alert("Invalid phone number", "Enter 9 digits starting with 7, 10 digits starting with 07, or +94 followed by 9 digits.");
      return;
    }
    if (customerEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
      Alert.alert("Invalid email", "Please enter a valid customer email address.");
      return;
    }

    if (!date.trim()) {
      Alert.alert(
        "Missing Date",
        "Please enter the job date."
      );
      return;
    }

    if (!time.trim()) {
      Alert.alert(
        "Missing Time",
        "Please enter the job time."
      );
      return;
    }

    const scheduleUnchanged = isEditing && date === originalSchedule.date && time === originalSchedule.time;
    const chosenDate = new Date(`${date}T00:00:00`);
    if (!scheduleUnchanged) {
    if (Number.isNaN(chosenDate.getTime()) || localDateKey(chosenDate) !== date || date < localDateKey(new Date())) {
      Alert.alert("Invalid date", "Please select today or a future date.");
      return;
    }
    const timeParts = /^(1[0-2]|[1-9]):([0-5]\d) (AM|PM)$/.exec(time);
    if (!timeParts) {
      Alert.alert("Invalid time", "Please select an hour, minute and AM or PM.");
      return;
    }
    chosenDate.setHours(Number(timeParts[1]) % 12 + (timeParts[3] === "PM" ? 12 : 0), Number(timeParts[2]));
    if (chosenDate.getTime() <= Date.now()) {
      Alert.alert("Time has passed", "Please choose a future job time.");
      return;
    }
    }
    const numericPrice = price.trim() ? Number(price.trim()) : 0;
    if (price.trim() && (!/^\d+(\.\d{1,2})?$/.test(price.trim()) || !Number.isFinite(numericPrice) || numericPrice < 0 || (!isEditing && numericPrice === 0))) {
      Alert.alert("Invalid price", "Enter a price greater than 0, with up to two decimal places, or leave it blank.");
      return;
    }

    try {
      setLoading(true);

      const providerDoc =
        await getDoc(
          doc(
            db,
            "users",
            user.uid
          )
        );

      const providerData =
        providerDoc.exists()
          ? providerDoc.data()
          : {};

      const providerName =
        providerData.name ||
        "Service Provider";
      const imageUrl = await uploadPhoto();

      const jobData = {
            /*
              PROVIDER
            */
            providerId:
              user.uid,

            providerName,

            /*
              CUSTOMER
              Manual jobs may not have
              a FIXORA customer account.
            */
            customerId:
              null,

            customerName:
              customerName.trim(),

            customerPhone:
              customerPhone.trim(),

            customerEmail:
              customerEmail.trim(),

            /*
              JOB
            */
            service:
              service.trim(),

            date:
              date.trim(),

            time:
              time.trim(),

            address:
              address.trim(),

            description:
              description.trim(),

            /*
              PRICE
              No FIXORA platform fee
              for manually entered jobs.
            */
            servicePrice:
              numericPrice,

            platformFee:
              0,

            totalAmount:
              numericPrice,

            /*
              JOB MANAGEMENT
            */
            status:
              "confirmed",

            source:
              "manual",

            createdBy:
              "provider",

            hasPhotoAttachment:
              !!imageUrl,

            imageUrl:
              imageUrl,

            createdAt:
              serverTimestamp(),

            updatedAt:
              serverTimestamp(),
          };
      if (isEditing) {
        await runTransaction(db, async (transaction) => {
          const ref = doc(db, "bookings", jobId);
          const snapshot = await transaction.get(ref);
          if (!snapshot.exists()) throw new Error("This job no longer exists.");
          const job = snapshot.data();
          if (job.providerId !== user.uid || job.source !== "manual") throw new Error("You can only edit your own manual jobs.");
          transaction.update(ref, {
            customerName: jobData.customerName,
            customerPhone: jobData.customerPhone,
            customerEmail: jobData.customerEmail,
            service: jobData.service,
            date: jobData.date,
            time: jobData.time,
            address: jobData.address,
            description: jobData.description,
            servicePrice: jobData.servicePrice,
            totalAmount: jobData.totalAmount,
            hasPhotoAttachment: jobData.hasPhotoAttachment,
            imageUrl: jobData.imageUrl,
            updatedAt: serverTimestamp(),
          });
        });
        router.replace("/provider/jobs");
        return;
      }
      const jobRef = await addDoc(collection(db, "bookings"), jobData);

      console.log(
        "Manual job created:",
        jobRef.id
      );

      Alert.alert(
        "Manual Job Added",
        "The job has been added to My Jobs.",
        [
          {
            text: "View Jobs",
            onPress: () =>
              router.replace(
                "/provider/jobs"
              ),
          },
        ]
      );
    } catch (error: any) {
      console.log(
        "Create manual job error:",
        error
      );

      Alert.alert(
        "Error",
        error?.message ||
          "Unable to create the manual job."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingJob || loadError) return <SafeAreaView style={styles.container} edges={["top"]}>
    <Stack.Screen options={{ headerShown: false }} />
    {loadingJob ? <ActivityIndicator size="large" color={colors.primary} /> : <View style={{ padding: spacing.xl }}>
      <Text style={{ color: colors.error }}>{loadError}</Text>
      <TouchableOpacity onPress={() => router.back()}><Text style={{ padding: spacing.md, color: colors.primary }}>Go back</Text></TouchableOpacity>
    </View>}
  </SafeAreaView>;

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top"]}
    >
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <View
          style={styles.headerRow}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() =>
              router.back()
            }
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color={
                colors.textPrimary
              }
            />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={styles.eyebrow}>
              FIXORA
            </Text>

            <Text style={styles.title}>
              {isEditing ? "Edit Manual Job" : "Add Manual Job"}
            </Text>
          </View>
        </View>

        <Text style={styles.subtitle}>
          Add a phone, WhatsApp, walk-in or
          offline service job to your job list.
        </Text>

        {/* CUSTOMER */}

        <View style={styles.section}>
          <View
            style={
              styles.sectionHeader
            }
          >
            <View
              style={styles.iconBox}
            >
              <Ionicons
                name="person-outline"
                size={18}
                color={
                  colors.primary
                }
              />
            </View>

            <Text
              style={
                styles.sectionTitle
              }
            >
              Customer Details
            </Text>
          </View>

          <Text style={styles.label}>
            Customer Name *
          </Text>

          <TextInput
            style={styles.input}
            value={customerName}
            onChangeText={
              setCustomerName
            }
            placeholder="Enter customer name"
            placeholderTextColor="#94A3B8"
          />

          <Text style={styles.label}>
            Phone Number
          </Text>

          <TextInput
            style={styles.input}
            value={customerPhone}
            onChangeText={
              setCustomerPhone
            }
            placeholder="07X XXX XXXX"
            placeholderTextColor="#94A3B8"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>
            Email
          </Text>

          <TextInput
            style={styles.input}
            value={customerEmail}
            onChangeText={
              setCustomerEmail
            }
            placeholder="customer@email.com"
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* JOB DETAILS */}

        <View style={styles.section}>
          <View
            style={
              styles.sectionHeader
            }
          >
            <View
              style={styles.iconBox}
            >
              <Ionicons
                name="construct-outline"
                size={18}
                color={
                  colors.primary
                }
              />
            </View>

            <Text
              style={
                styles.sectionTitle
              }
            >
              Job Details
            </Text>
          </View>

          <Text style={styles.label}>
            Service *
          </Text>

          <TextInput
            style={styles.input}
            value={service}
            onChangeText={
              setService
            }
            placeholder="Example: Plumbing"
            placeholderTextColor="#94A3B8"
          />

          <Text style={styles.label}>
            Date *
          </Text>

          <TouchableOpacity style={styles.input} accessibilityRole="button" disabled={loading}
            onPress={() => setPicker("date")}>
            <Text style={{ color: date ? colors.textPrimary : colors.textMuted }}>
              {date ? new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "Choose a date"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>
            Time *
          </Text>

          <TouchableOpacity style={styles.input} accessibilityRole="button" disabled={loading}
            onPress={() => setPicker("time")}>
            <Text style={{ color: time ? colors.textPrimary : colors.textMuted }}>{time || "Choose time and AM / PM"}</Text>
          </TouchableOpacity>

          <Text style={styles.label}>
            Service Address
          </Text>

          <TextInput
            style={[
              styles.input,
              styles.multilineInput,
            ]}
            value={address}
            onChangeText={
              setAddress
            }
            placeholder="Enter service location"
            placeholderTextColor="#94A3B8"
            multiline
            textAlignVertical="top"
          />

          <Text style={styles.label}>
            Problem Description
          </Text>

          <TextInput
            style={[
              styles.input,
              styles.multilineInput,
            ]}
            value={description}
            onChangeText={
              setDescription
            }
            placeholder="Describe the work required"
            placeholderTextColor="#94A3B8"
            multiline
            textAlignVertical="top"
          />

          <Text style={styles.label}>
            Service Price
          </Text>

          <View
            style={styles.priceInput}
          >
            <Text
              style={
                styles.currencyText
              }
            >
              Rs.
            </Text>

            <TextInput
              style={
                styles.priceTextInput
              }
              value={price}
              onChangeText={setPrice}
              placeholder="2500"
              placeholderTextColor="#94A3B8"
              keyboardType="decimal-pad"
            />
          </View>
          <Text style={styles.label}>Job Image (optional)</Text>
          <TouchableOpacity style={styles.input} accessibilityRole="button"
            disabled={loading || pickingPhoto} onPress={choosePhoto}>
            <Text style={{ color: colors.primary }}>
              {pickingPhoto ? "Opening photos..." : photo || existingImageUrl ? "Replace image" : "Choose an image (up to 10 MB)"}
            </Text>
          </TouchableOpacity>
          {(photo || existingImageUrl) && <View>
            <Image source={{ uri: photo?.uri || existingImageUrl }} accessibilityLabel="Selected job image"
              style={{ width: "100%", height: 200, borderRadius: radius.md, marginBottom: spacing.sm }} resizeMode="contain" />
            <TouchableOpacity disabled={loading} onPress={() => { setPhoto(null); setUploadedPhoto(null); setExistingImageUrl(""); }}>
              <Text style={{ color: colors.error, paddingVertical: spacing.sm }}>Remove image</Text>
            </TouchableOpacity>
          </View>}
        </View>

        {/* INFO */}

        <View style={styles.infoBox}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={colors.primary}
          />

          <Text style={styles.infoText}>
            Manual jobs are added directly to
            your My Jobs list with a Confirmed
            status. They are marked as MANUAL
            so you can distinguish them from
            customer bookings.
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.createButton,
            loading &&
              styles.disabledButton,
          ]}
          onPress={handleCreateJob}
          disabled={loading || pickingPhoto}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />
          ) : (
            <>
              <Ionicons
                name="add-circle-outline"
                size={20}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.createButtonText
                }
              >
                {isEditing ? "Save Changes" : "Create Manual Job"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
      {picker && <ManualJobDateTimePicker key={picker} kind={picker}
        value={picker === "date" ? date : time}
        onChange={picker === "date" ? setDate : setTime}
        onClose={() => setPicker(null)} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      colors.background,
  },

  scrollContent: {
    padding: spacing.xl,
    paddingBottom:
      spacing.xxxl,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor:
      colors.surface,
    borderWidth: 1,
    borderColor:
      colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  headerInfo: {
    flex: 1,
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
    color: colors.primary,
  },

  title: {
    marginTop: 3,
    fontSize: 25,
    fontWeight: "900",
    color:
      colors.textPrimary,
  },

  subtitle: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 20,
    color:
      colors.textSecondary,
  },

  section: {
    marginTop: 20,
    backgroundColor:
      colors.surface,
    borderWidth: 1,
    borderColor:
      colors.border,
    borderRadius:
      radius.xl,
    padding: spacing.lg,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor:
      colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color:
      colors.textPrimary,
  },

  label: {
    marginTop: 12,
    marginBottom: 7,
    fontSize: 12,
    fontWeight: "800",
    color:
      colors.textPrimary,
  },

  input: {
    minHeight: 50,
    backgroundColor:
      colors.background,
    borderWidth: 1,
    borderColor:
      colors.border,
    borderRadius:
      radius.lg,
    paddingHorizontal: 14,
    fontSize: 14,
    color:
      colors.textPrimary,
  },

  multilineInput: {
    minHeight: 95,
    paddingTop: 13,
    paddingBottom: 13,
  },

  priceInput: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor:
      colors.background,
    borderWidth: 1,
    borderColor:
      colors.border,
    borderRadius:
      radius.lg,
    paddingHorizontal: 14,
  },

  currencyText: {
    fontSize: 14,
    fontWeight: "800",
    color:
      colors.textSecondary,
    marginRight: 8,
  },

  priceTextInput: {
    flex: 1,
    fontSize: 14,
    color:
      colors.textPrimary,
  },

  infoBox: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor:
      colors.primarySoft,
    borderRadius:
      radius.lg,
    padding: 14,
    gap: 10,
  },

  infoText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
    color:
      colors.textSecondary,
  },

  createButton: {
    marginTop: 20,
    minHeight: 54,
    backgroundColor:
      colors.primary,
    borderRadius:
      radius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  createButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },

  disabledButton: {
    opacity: 0.6,
  },
});
