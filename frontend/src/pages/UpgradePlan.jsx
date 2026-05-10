import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, ShieldCheck, Users, Zap } from "lucide-react";

import API from "../api/client";
import MainLayout from "../layouts/MainLayout";
import { showSnackbar } from "../utils/snackbarService";

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function getPlanAccent(plan) {
  return plan.badge_color || "#3b82f6";
}

export default function UpgradePlan() {
  const [payingPlanId, setPayingPlanId] = useState(null);

  const { data: plans = [], isLoading } = useQuery(["active_plans"], async () => {
    const res = await API.get("/subscriptions/active-plans/");
    const data = res.data.data || {};
    return [...(data.monthly_plans || []), ...(data.yearly_plans || [])];
  });

  const createOrderMutation = useMutation(async (planId) => {
    const res = await API.post("/subscriptions/payment/create-order/", { plan_id: planId });
    return res.data.data;
  });

  const verifyMutation = useMutation(
    async (payload) => {
      const res = await API.post("/subscriptions/payment/verify/", payload);
      return res.data;
    },
    {
      onSuccess: (data) => {
        showSnackbar(data.message || "Subscription activated!", "success");
        setPayingPlanId(null);
      },
      onError: (err) => {
        showSnackbar(err?.response?.data?.message || "Payment verification failed", "error");
        setPayingPlanId(null);
      },
    }
  );

  const handleUpgrade = async (plan) => {
    setPayingPlanId(plan.plan_id);

    const loaded = await loadRazorpay();
    if (!loaded) {
      showSnackbar("Failed to load payment gateway. Check your internet.", "error");
      setPayingPlanId(null);
      return;
    }

    let orderData;
    try {
      orderData = await createOrderMutation.mutateAsync(plan.plan_id);
    } catch (err) {
      showSnackbar(err?.response?.data?.message || "Failed to create order", "error");
      setPayingPlanId(null);
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "Gymora",
      description: `${orderData.plan_name} Plan`,
      order_id: orderData.razorpay_order_id,
      prefill: {
        name: orderData.gym_name,
      },
      theme: { color: getPlanAccent(plan) },
      handler: async (response) => {
        await verifyMutation.mutateAsync({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          plan_id: plan.plan_id,
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
      showSnackbar(`Payment failed: ${response.error.description}`, "error");
      setPayingPlanId(null);
    });
    rzp.open();
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Upgrade Your Plan</h1>
        <p className="mt-1 text-sm text-gray-400">Choose the right plan for your gym size and workflow.</p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-gray-400">Loading plans...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const accent = getPlanAccent(plan);
            const isProcessing = payingPlanId === plan.plan_id;

            return (
              <div
                key={plan.plan_id}
                className={`relative flex flex-col gap-5 rounded-3xl border p-6 transition-all ${
                  plan.is_recommended
                    ? "border-amber-400/60 bg-amber-400/10 shadow-[0_20px_60px_rgba(245,158,11,0.16)]"
                    : "border-gray-800 bg-card hover:border-gray-700"
                }`}
              >
                {plan.highlight_text ? (
                  <span
                    className="absolute right-5 top-5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white"
                    style={{ backgroundColor: accent }}
                  >
                    {plan.highlight_text}
                  </span>
                ) : null}

                <div className="space-y-3">
                  <span
                    className="inline-flex rounded-full px-3 py-1 text-xs font-semibold text-white"
                    style={{ backgroundColor: accent }}
                  >
                    {plan.name}
                  </span>
                  <div>
                    <h2 className="text-3xl font-bold text-white">₹{plan.price}</h2>
                    <p className="mt-1 text-sm text-gray-400">
                      {plan.target_audience || plan.description} • {plan.duration_days} days
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm">
                  <div className="rounded-2xl bg-black/20 p-3">
                    <div className="mb-2 flex items-center gap-2 text-gray-300">
                      <Users size={14} />
                      Members
                    </div>
                    <div className="text-lg font-semibold text-white">{plan.member_limit || "Custom"}</div>
                  </div>
                  <div className="rounded-2xl bg-black/20 p-3">
                    <div className="mb-2 flex items-center gap-2 text-gray-300">
                      <ShieldCheck size={14} />
                      Staff users
                    </div>
                    <div className="text-lg font-semibold text-white">{plan.staff_limit || "Custom"}</div>
                  </div>
                </div>

                <ul className="flex flex-1 flex-col gap-2">
                  {(plan.marketing_features || []).map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-gray-300">
                      <Check size={14} className="mt-0.5 flex-shrink-0" style={{ color: accent }} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(plan)}
                  disabled={isProcessing}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition disabled:opacity-60"
                  style={{ backgroundColor: accent }}
                >
                  <Zap size={15} />
                  {isProcessing ? "Processing..." : `Upgrade to ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 text-center">
        <a href="/payment/history" className="text-sm text-gray-500 transition hover:text-primary">
          View payment history →
        </a>
      </div>
    </MainLayout>
  );
}
