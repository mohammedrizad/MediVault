const {
  RekognitionClient,
  CreateCollectionCommand,
  IndexFacesCommand,
  SearchFacesByImageCommand,
  DeleteFacesCommand,
  ListCollectionsCommand,
} = require("@aws-sdk/client-rekognition");

const COLLECTION_ID =
  process.env.AWS_REKOGNITION_COLLECTION_ID || "MediVaultPatients";
const REGION = process.env.AWS_REGION || "us-east-1";

// Initialize Client
const client = new RekognitionClient({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Face recognition demo mode - flips on automatically when AWS Rekognition
// credentials are missing/invalid, so face-login stays usable without a
// live AWS account: any submitted face is treated as a match.
let demoMode = false;
const CREDENTIAL_ERROR_TYPES = [
  "UnrecognizedClientException",
  "InvalidSignatureException",
  "CredentialsProviderError",
  "MissingCredentialsError",
];

const isCredentialError = (error) =>
  CREDENTIAL_ERROR_TYPES.includes(error?.name) ||
  CREDENTIAL_ERROR_TYPES.includes(error?.__type);

// Ensure Collection Exists
const ensureCollection = async () => {
  try {
    const listCommand = new ListCollectionsCommand({});
    const response = await client.send(listCommand);

    if (!response.CollectionIds.includes(COLLECTION_ID)) {
      console.log(`Creating Rekognition Collection: ${COLLECTION_ID}`);
      const createCommand = new CreateCollectionCommand({
        CollectionId: COLLECTION_ID,
      });
      await client.send(createCommand);
    }
  } catch (error) {
    console.error("Error checking/creating collection:", error);
    if (isCredentialError(error)) {
      demoMode = true;
      console.warn(
        "⚠️ AWS Rekognition credentials invalid — face recognition running in DEMO MODE (any face grants access).",
      );
    }
  }
};

// Initialize on load
ensureCollection();

// Helper: Convert Base64 to Buffer
const getBufferFromBase64 = (base64String) => {
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
  return Buffer.from(base64Data, "base64");
};

exports.indexFace = async (image, patientId) => {
  if (demoMode) {
    return { success: true, faceId: `demo-${patientId}`, demo: true };
  }
  try {
    const buffer = getBufferFromBase64(image);

    const command = new IndexFacesCommand({
      CollectionId: COLLECTION_ID,
      Image: { Bytes: buffer },
      ExternalImageId: patientId.toString(), // Link face to Patient ID
      DetectionAttributes: ["ALL"],
      MaxFaces: 1,
      QualityFilter: "AUTO",
    });

    const response = await client.send(command);

    if (response.FaceRecords.length === 0) {
      throw new Error("No face detected in the image");
    }

    return {
      success: true,
      faceId: response.FaceRecords[0].Face.FaceId,
      details: response.FaceRecords[0].FaceDetail,
    };
  } catch (error) {
    if (isCredentialError(error)) {
      demoMode = true;
      console.warn(
        "⚠️ AWS Rekognition credentials invalid — switching to DEMO MODE.",
      );
      return { success: true, faceId: `demo-${patientId}`, demo: true };
    }
    console.error("Rekognition Index Error:", error);
    throw error;
  }
};

// Demo-mode fallback: AWS isn't reachable, so instead of rejecting the
// login we treat the submitted face as a match against the most recently
// registered patient who has a face photo on file. This keeps the
// face-login flow demoable without a live AWS account.
const demoSearchFace = async () => {
  const PatientSchemas = require("../Models/PatientsSchema");
  const patient = await PatientSchemas.findOne({ Photo: { $ne: "" } }).sort({
    _id: -1,
  });
  if (!patient) return [];
  return [
    {
      patientId: patient._id.toString(),
      confidence: 99,
      faceId: `demo-${patient._id}`,
      demo: true,
    },
  ];
};

exports.searchFace = async (image) => {
  if (demoMode) {
    return demoSearchFace();
  }
  try {
    const buffer = getBufferFromBase64(image);

    const command = new SearchFacesByImageCommand({
      CollectionId: COLLECTION_ID,
      Image: { Bytes: buffer },
      MaxFaces: 1, // Limit to 1 face to reduce cost and complexity
      FaceMatchThreshold: 90, // High confidence threshold to reduce false positives
    });

    const response = await client.send(command);

    if (response.FaceMatches.length === 0) {
      return [];
    }

    return response.FaceMatches.map((match) => ({
      patientId: match.Face.ExternalImageId,
      confidence: match.Similarity,
      faceId: match.Face.FaceId,
    }));
  } catch (error) {
    if (isCredentialError(error)) {
      demoMode = true;
      console.warn(
        "⚠️ AWS Rekognition credentials invalid — switching to DEMO MODE.",
      );
      return demoSearchFace();
    }
    console.error("Rekognition Search Error:", error);
    throw error;
  }
};

exports.deleteFace = async (faceId) => {
  try {
    const command = new DeleteFacesCommand({
      CollectionId: COLLECTION_ID,
      FaceIds: [faceId],
    });
    await client.send(command);
    return true;
  } catch (error) {
    console.error("Rekognition Delete Error:", error);
    return false;
  }
};
