import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from "firebase/firestore";

import { auth, db } from "./firebase";

/**
 * Provider Service & Pricing Management (Ranmith)
 * Firestore collection: provider_services
 * Each document is linked to its owner through `providerId` (Firebase UID).
 */

export const SERVICE_CATEGORIES = [
  "Plumbing",
  "Electrical",
  "Cleaning",
  "AC Service",
  "Painting",
  "Carpentry",
  "Appliance Repair",
  "Other",
];

export type ProviderService = {
  id: string;
  providerId: string;
  name: string;
  category: string;
  description: string;
  startingPrice: number;
};

export type ServiceInput = {
  name: string;
  category: string;
  description: string;
  startingPrice: number;
};

const servicesRef = collection(db, "provider_services");

const requireUid = () => {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be logged in as a provider.");
  return user.uid;
};

/**
 * Keeps users/{uid}.price equal to the cheapest service so the existing
 * customer-side provider cards ("From Rs. X") keep working.
 * Failure here must never break the CRUD action itself.
 */
const syncStartingPrice = async (uid: string) => {
  try {
    const snap = await getDocs(
      query(servicesRef, where("providerId", "==", uid)),
    );
    if (snap.empty) return;

    const lowest = Math.min(
      ...snap.docs.map((d) => Number(d.data().startingPrice) || 0),
    );

    await updateDoc(doc(db, "users", uid), {
      price: lowest,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.log("Starting price sync skipped:", error);
  }
};

/** READ (live) - only the logged-in provider's services */
export const subscribeToMyServices = (
  onData: (services: ProviderService[]) => void,
  onError: (error: Error) => void,
) => {
  const uid = requireUid();

  return onSnapshot(
    query(servicesRef, where("providerId", "==", uid)),
    (snapshot) => {
      const list = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as ProviderService,
      );
      list.sort((a, b) => a.name.localeCompare(b.name));
      onData(list);
    },
    onError,
  );
};

/** READ (single) - used to pre-fill the Edit form */
export const getServiceById = async (id: string) => {
  const snap = await getDoc(doc(db, "provider_services", id));
  if (!snap.exists()) return null;

  const service = { id: snap.id, ...snap.data() } as ProviderService;
  if (service.providerId !== requireUid()) return null; // not yours
  return service;
};

/** CREATE */
export const createService = async (input: ServiceInput) => {
  const uid = requireUid();

  await addDoc(servicesRef, {
    providerId: uid,
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await syncStartingPrice(uid);
};

/** UPDATE - modifies the SAME document, never creates a new one */
export const updateService = async (id: string, input: ServiceInput) => {
  const uid = requireUid();

  await updateDoc(doc(db, "provider_services", id), {
    ...input,
    updatedAt: serverTimestamp(),
  });

  await syncStartingPrice(uid);
};

/** DELETE - real removal of the document */
export const deleteService = async (id: string) => {
  const uid = requireUid();

  await deleteDoc(doc(db, "provider_services", id));

  await syncStartingPrice(uid);
};
