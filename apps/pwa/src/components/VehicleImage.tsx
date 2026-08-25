import { useEffect, useState } from "react";
import { Car } from "lucide-react";
import { mediaUrl } from "../lib/vehicle";

export function VehicleImage({ uri }: { uri?: string | null }) {
  const [failed, setFailed] = useState(false);
  const source = mediaUrl(uri);

  useEffect(() => {
    setFailed(false);
  }, [uri]);

  if (!source || failed) {
    return (
      <div className="placeholder">
        <Car size={28} strokeWidth={1.5} />
      </div>
    );
  }

  return <img src={source} alt="" onError={() => setFailed(true)} />;
}
