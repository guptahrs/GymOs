import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import API from "../api/client";
import MainLayout from "../layouts/MainLayout";
import { showSnackbar } from "../utils/snackbarService";
import { Check, Zap } from "lucide-react";

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

export default function UpgradePlan() {
  const [payingPlanId, setPayingPlanId] = useState(null);

  // Fetch all plans
  const { data: plans = [], isLoading } = useQuery(["all_plans"], async () => {
    const res = await API.get("/subscriptions/all-plans/");
    return res.data.data || [];
  });

  // Create order mutation
  const createOrderMutation = useMutation(
    async (plan_id) => {
      const res = await API.post("/subscriptions/payment/create-order/", { plan_id });
      return res.data.data;
    }
  );

  // Verify payment mutation
  const verifyMutation = useMutation(
    async (payload) => {
      const res = await API.post("/subscriptions/payment/verify/", payload);
      return res.data;
    },
    {
      onSuccess: (data) => {
        showSnackbar(data.message || "Subscription activated! 🎉", "success");
        setPayingPlanId(null);
      },
      onError: (err) => {
        showSnackbar(err?.response?.data?.message || "Payment verification failed", "error");
      },
    }
  );

  const handleUpgrade = async (plan) => {
    setPayingPlanId(plan.plan_id);

    // Load Razorpay script
    const loaded = await loadRazorpay();
    if (!loaded) {
      showSnackbar("Failed to load payment gateway. Check your internet.", "error");
      setPayingPlanId(null);
      return;
    }

    // Create order from backend
    let orderData;
    try {
      orderData = await createOrderMutation.mutateAsync(plan.plan_id);
    } catch (err) {
      showSnackbar(err?.response?.data?.message || "Failed to create order", "error");
      setPayingPlanId(null);
      return;
    }

    // Open Razorpay modal
    const options = {
      key:         import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount:      orderData.amount,
      currency:    orderData.currency,
      name:        "Gymora",
      description: `${orderData.plan_name} Plan`,
      order_id:    orderData.razorpay_order_id,
      prefill: {
        name:  orderData.gym_name,
      },
      theme: { color: "#3b82f6" },

      handler: async (response) => {
        // Payment success — verify on backend
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

    rzp.on("payment.failed", (response) => {
      showSnackbar(
        `Payment failed: ${response.error.description}`,
        "error"
      );
      setPayingPlanId(null);
    });

    rzp.open();
  };

  const badgeColor = {
    Standard:      "#22c55e",
    Elite:         "#a855f7",
    "Premium Plus": "#3b82f6",
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Upgrade Your Plan</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Choose a plan that fits your gym's needs
        </p>
      </div>

      {isLoading ? (
        <div className="text-gray-400 text-center py-20">Loading plans...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.plan_id}
              className="bg-card border border-gray-800 rounded-2xl p-6 flex flex-col gap-5 hover:border-primary/40 transition-all"
            >
              {/* Plan badge */}
              <div>
                <span
                  className="px-3 py-1 rounded text-xs font-bold text-white"
                  style={{ backgroundColor: badgeColor[plan.name] || "#3b82f6" }}
                >
                  {plan.name}
                </span>
              </div>

              {/* Price */}
              <div>
                <span className="text-4xl font-bold text-white">
                  ₹{plan.price}
                </span>
                <span className="text-gray-500 text-sm ml-1">
                  / {plan.duration_days} days
                </span>
              </div>

              {/* Features */}
              <ul className="flex flex-col gap-2 flex-1">
                {(plan.features || []).map((f) => (
                  <li key={f.code} className="flex items-center gap-2 text-sm text-gray-300">
                    <Check size={14} className="text-primary flex-shrink-0" />
                    {f.name}
                  </li>
                ))}
              </ul>

              {/* Pay button */}
              <button
                onClick={() => handleUpgrade(plan)}
                disabled={payingPlanId === plan.plan_id}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-3 text-white font-semibold text-sm hover:bg-primary/80 transition disabled:opacity-60"
              >
                <Zap size={15} />
                {payingPlanId === plan.plan_id ? "Processing..." : `Upgrade to ${plan.name}`}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Payment history link */}
      <div className="mt-8 text-center">
        <a
          href="/payment/history"
          className="text-sm text-gray-500 hover:text-primary transition"
        >
          View payment history →
        </a>
      </div>
    </MainLayout>
  );
}