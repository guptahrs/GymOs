import { User, MapPin } from "lucide-react";

export default function Stepper({ step, setStep }) {
  const steps = [
    { id: 1, label: "Basic", icon: User },
    { id: 2, label: "Address", icon: MapPin },
  ];

  return (
    <div className="flex items-center justify-center mb-6">
      {steps.map((s, i) => {
        const Icon = s.icon;
        const active = step >= s.id;

        return (
          <div key={i} className="flex items-center">
            
            <div
              onClick={() => setStep(s.id)}
              className={`flex items-center justify-center w-10 h-10 rounded-full cursor-pointer
                ${active ? "bg-primary text-white" : "bg-gray-700 text-gray-400"}
              `}
            >
              <Icon size={18} />
            </div>

            {i !== steps.length - 1 && (
              <div
                className={`w-16 h-1 mx-2
                  ${step > s.id ? "bg-primary" : "bg-gray-700"}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}