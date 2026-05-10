// import { Check, X } from "lucide-react";
// import { useState } from "react";
// import { useQuery } from "@tanstack/react-query";

// import API from "../api/client";

// export default function PricingModal({ isOpen, onClose, currentPlan }) {
//   const [billingType, setBillingType] = useState("monthly");

//   const { data } = useQuery(["plans"], async () => {
//     const res = await API.get("/subscriptions/active-plans/");
//     return res.data.data;
//   });

//   if (!isOpen) return null;

//   const plans =
//     billingType === "monthly"
//       ? data?.monthly_plans || []
//       : data?.yearly_plans || [];

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
//       <div className="relative w-[90%] max-w-5xl rounded-2xl border border-gray-800 bg-[#0B1220] p-6">
//         <button
//           onClick={onClose}
//           className="absolute right-4 top-4 text-gray-400 hover:text-white"
//         >
//           <X size={20} />
//         </button>

//         <h2 className="mb-2 text-center text-2xl font-bold text-white">
//           Upgrade Your Plan
//         </h2>

//         <div className="mb-6 flex justify-center">
//           <div className="flex items-center rounded-full bg-[#111827] p-1">
//             <button
//               onClick={() => setBillingType("monthly")}
//               className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
//                 billingType === "monthly" ? "bg-white text-black" : "text-gray-400"
//               }`}
//             >
//               Monthly
//             </button>

//             <button
//               onClick={() => setBillingType("yearly")}
//               className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
//                 billingType === "yearly" ? "bg-white text-black" : "text-gray-400"
//               }`}
//             >
//               Yearly
//               <span className="ml-1 text-xs text-green-400">Save 20%</span>
//             </button>
//           </div>
//         </div>

//         {plans.length === 0 ? (
//           <div className="rounded-2xl border border-dashed border-gray-700 px-6 py-12 text-center text-sm text-gray-400">
//             No plans are available for this billing cycle yet.
//           </div>
//         ) : (
//           <div className="grid gap-6 md:grid-cols-3">
//             {plans.map((plan) => {
//               const isCurrent = currentPlan === plan.name;

//               return (
//                 <div
//                   key={plan.plan_id}
//                   className={`rounded-2xl p-[1px] ${
//                     isCurrent
//                       ? "bg-gradient-to-r from-yellow-400 to-orange-500"
//                       : "bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"
//                   }`}
//                 >
//                   <div className="flex h-full flex-col rounded-2xl bg-[#0B1220] p-5">
//                     <h3 className="text-lg font-semibold capitalize text-white">
//                       {plan.name.replace("_", " ")}
//                     </h3>

//                     <p className="mt-2 text-3xl font-bold text-white">
//                       Rs.{plan.price}
//                       <span className="text-sm text-gray-400">
//                         {" "}
//                         / {billingType === "monthly" ? "month" : "year"}
//                       </span>
//                     </p>

//                     <ul className="mt-4 flex-1 space-y-2">
//                       {plan.features.map((feature, index) => (
//                         <li
//                           key={index}
//                           className="flex items-center gap-2 text-sm text-gray-300"
//                         >
//                           <Check size={16} className="text-green-400" />
//                           {feature}
//                         </li>
//                       ))}
//                     </ul>

//                     <button
//                       disabled={isCurrent}
//                       className={`mt-5 rounded-xl py-2 font-medium transition ${
//                         isCurrent
//                           ? "cursor-not-allowed bg-gray-700 text-gray-400"
//                           : "bg-white text-black hover:opacity-90"
//                       }`}
//                     >
//                       {isCurrent ? "Current Plan" : "Upgrade"}
//                     </button>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }




import { Check, X, Zap } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import API from "../api/client";
import { showSnackbar } from "../utils/snackbarService";

// ── Load Razorpay script dynamically ──
function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PricingModal({ isOpen, onClose, currentPlan }) {
  const [billingType, setBillingType]   = useState("monthly");
  const [payingPlanId, setPayingPlanId] = useState(null);

  // ── Fetch plans ──
  const { data } = useQuery(["plans"], async () => {
    const res = await API.get("/subscriptions/active-plans/");
    return res.data.data;
  });

  // ── Create Razorpay order ──
  const createOrderMutation = useMutation(async (plan_id) => {
    const res = await API.post("/subscriptions/payment/create-order/", { plan_id });
    return res.data.data;
  });

  // ── Verify payment after success ──
  const verifyMutation = useMutation(
    async (payload) => {
      const res = await API.post("/subscriptions/payment/verify/", payload);
      return res.data;
    },
    {
      onSuccess: (data) => {
        showSnackbar(data.message || "Subscription activated! 🎉", "success");
        setPayingPlanId(null);
        onClose(); // close modal after successful upgrade
      },
      onError: (err) => {
        showSnackbar(
          err?.response?.data?.message || "Payment verification failed",
          "error"
        );
        setPayingPlanId(null);
      },
    }
  );

  // ── Main payment handler ──
  const handleUpgrade = async (plan) => {
    setPayingPlanId(plan.plan_id);

    // 1. Load Razorpay SDK
    const loaded = await loadRazorpay();
    if (!loaded) {
      showSnackbar("Failed to load payment gateway. Check your internet.", "error");
      setPayingPlanId(null);
      return;
    }

    // 2. Create order on backend
    let orderData;
    try {
      orderData = await createOrderMutation.mutateAsync(plan.plan_id);
    } catch (err) {
      showSnackbar(
        err?.response?.data?.message || "Failed to create order",
        "error"
      );
      setPayingPlanId(null);
      return;
    }

    // 3. Open Razorpay modal
    const options = {
      key:         import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount:      orderData.amount,       // in paise
      currency:    orderData.currency,
      name:        "Gymora",
      description: `${orderData.plan_name} Plan — ${billingType}`,
      order_id:    orderData.razorpay_order_id,
      prefill: {
        name: orderData.gym_name,
      },
      theme: { color: "#3b82f6" },

      // 4. On payment success → verify on backend
      handler: async (response) => {
        await verifyMutation.mutateAsync({
          razorpay_order_id:   response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature:  response.razorpay_signature,
          plan_id:             plan.plan_id,
        });
      },

      modal: {
        ondismiss: () => {
          showSnackbar("Payment cancelled", "error");
          setPayingPlanId(null);
        },
      },
    };

    const rzp = new window.Razorpay(options);

    // 5. Handle payment failure
    rzp.on("payment.failed", (response) => {
      showSnackbar(
        `Payment failed: ${response.error.description}`,
        "error"
      );
      setPayingPlanId(null);
    });

    rzp.open();
  };

  if (!isOpen) return null;

  const plans =
    billingType === "monthly"
      ? data?.monthly_plans || []
      : data?.yearly_plans  || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-[90%] max-w-5xl rounded-2xl border border-gray-800 bg-[#0B1220] p-6">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>

        <h2 className="mb-2 text-center text-2xl font-bold text-white">
          Upgrade Your Plan
        </h2>

        {/* Billing toggle */}
        <div className="mb-6 flex justify-center">
          <div className="flex items-center rounded-full bg-[#111827] p-1">
            <button
              onClick={() => setBillingType("monthly")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                billingType === "monthly" ? "bg-white text-black" : "text-gray-400"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingType("yearly")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                billingType === "yearly" ? "bg-white text-black" : "text-gray-400"
              }`}
            >
              Yearly
              <span className="ml-1 text-xs text-green-400">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Plans grid */}
        {plans.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-700 px-6 py-12 text-center text-sm text-gray-400">
            No plans available for this billing cycle yet.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => {
              const isCurrent  = currentPlan === plan.name;
              const isPaying   = payingPlanId === plan.plan_id;

              return (
                <div
                  key={plan.plan_id}
                  className={`rounded-2xl p-[1px] ${
                    isCurrent
                      ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                      : "bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"
                  }`}
                >
                  <div className="flex h-full flex-col rounded-2xl bg-[#0B1220] p-5">

                    {/* Plan name */}
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                      {plan.highlight_text ? (
                        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                          {plan.highlight_text}
                        </span>
                      ) : null}
                    </div>

                    {/* Price */}
                    <p className="mt-2 text-3xl font-bold text-white">
                      ₹{plan.price}
                      <span className="text-sm text-gray-400">
                        {" "}/ {billingType === "monthly" ? "month" : "year"}
                      </span>
                    </p>

                    {/* Features */}
                    <ul className="mt-4 flex-1 space-y-2">
                      {(plan.marketing_features || plan.features || []).map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-sm text-gray-300"
                        >
                          <Check size={16} className="text-green-400" />
                          {typeof feature === "object" ? feature.name : feature}
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <button
                      disabled={isCurrent || isPaying}
                      onClick={() => !isCurrent && handleUpgrade(plan)}
                      className={`mt-5 flex items-center justify-center gap-2 rounded-xl py-2.5 font-medium transition ${
                        isCurrent
                          ? "cursor-not-allowed bg-gray-700 text-gray-400"
                          : isPaying
                          ? "cursor-wait bg-primary/60 text-white"
                          : "bg-white text-black hover:opacity-90"
                      }`}
                    >
                      {isCurrent ? (
                        "Current Plan"
                      ) : isPaying ? (
                        <>
                          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Zap size={14} />
                          Upgrade
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer note */}
        <p className="mt-6 text-center text-xs text-gray-600">
          Secured by Razorpay · UPI, Cards, Net Banking accepted
        </p>
      </div>
    </div>
  );
}
