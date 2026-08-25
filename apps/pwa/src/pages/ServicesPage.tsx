import {
  CircleHelp,
  Droplets,
  Landmark,
  SearchCheck,
  Shield,
  Truck,
} from "lucide-react";
import { PageHeader } from "../components/BackButton";

const SERVICES = [
  { icon: SearchCheck, title: "Car Inspection", text: "Professional car inspection service." },
  { icon: Shield, title: "Car Insurance", text: "Get the best insurance for your car." },
  { icon: Landmark, title: "Financing", text: "Easy car loan and financing options." },
  { icon: Truck, title: "Transport Service", text: "Car transport across Ethiopia." },
  { icon: Droplets, title: "Car Wash", text: "Premium car wash and detailing." },
  { icon: CircleHelp, title: "Help Center", text: "Get help and support." },
];

export function ServicesPage() {
  return (
    <div className="screen">
      <PageHeader title="More Services" subtitle="Support around buying and selling." />
      {SERVICES.map(({ icon: Icon, title, text }) => (
        <div key={title} className="svc-row">
          <div className="svc-ico">
            <Icon size={20} />
          </div>
          <div>
            <strong>{title}</strong>
            <p className="meta">{text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
