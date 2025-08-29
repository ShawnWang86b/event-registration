import Lottie from "lottie-react";
import loadingAnimation from "@/public/loadingSpinner.json";

function LoadingSpinner() {
  return (
    <Lottie
      animationData={loadingAnimation}
      loop={true}
      style={{ width: 150, height: 150 }}
    />
  );
}

export default LoadingSpinner;
