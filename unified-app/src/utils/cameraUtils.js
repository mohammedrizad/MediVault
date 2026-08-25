/**
 * Camera utility functions for managing camera streams and battery optimization
 */

/**
 * Stops all active camera streams to save battery
 * @param {MediaStream} stream - Optional specific stream to stop
 */
export const stopAllCameraStreams = (stream = null) => {
  try {
    if (stream) {
      // Stop specific stream
      stream.getTracks().forEach((track) => {
        track.stop();
        console.log("Camera stream stopped - battery saving active");
      });
    } else {
      // Try to stop any active streams (fallback method)
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          stream.getTracks().forEach((track) => {
            track.stop();
            console.log("Camera stream cleanup completed");
          });
        })
        .catch(() => {
          // No active streams or camera not available - this is expected
        });
    }
  } catch (error) {
    console.warn("Camera cleanup error (this is usually fine):", error);
  }
};

/**
 * Checks if camera is currently active
 * @returns {Promise<boolean>} True if camera is active
 */
export const isCameraActive = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    // If we can get the stream, camera is available
    // Stop it immediately since this is just a check
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Creates a camera stream with error handling
 * @returns {Promise<MediaStream|null>} Camera stream or null if failed
 */
export const createCameraStream = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: "user",
      },
    });
    console.log("Camera stream created successfully");
    return stream;
  } catch (error) {
    console.error("Failed to create camera stream:", error);
    return null;
  }
};

/**
 * Cleanup function to be called on page unload or navigation
 */
export const globalCameraCleanup = () => {
  // Stop any remaining camera streams
  stopAllCameraStreams();

  // Clear any video elements
  const videoElements = document.querySelectorAll("video");
  videoElements.forEach((video) => {
    if (video.srcObject) {
      const stream = video.srcObject;
      if (stream && stream.getTracks) {
        stream.getTracks().forEach((track) => track.stop());
      }
      video.srcObject = null;
    }
  });

  console.log("Global camera cleanup completed - battery optimized");
};

// Auto-cleanup on page unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", globalCameraCleanup);
  window.addEventListener("pagehide", globalCameraCleanup);
}
