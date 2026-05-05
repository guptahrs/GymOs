import { Check, X } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import API from "../api/client";

export default function PricingModal({ isOpen, onClose, currentPlan }) {
  const [billingType, setBillingType] = useState("monthly");

  const { data } = useQuery(["plans"], async () => {
    const res = await API.get("/subscriptions/active-plans/");
    return res.data.data;
  });

  if (!isOpen) return null;

  const plans =
    billingType === "monthly"
      ? data?.monthly_plans || []
      : data?.yearly_plans || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-[90%] max-w-5xl rounded-2xl border border-gray-800 bg-[#0B1220] p-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>

        <h2 className="mb-2 text-center text-2xl font-bold text-white">
          Upgrade Your Plan
        </h2>

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

        {plans.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-700 px-6 py-12 text-center text-sm text-gray-400">
            No plans are available for this billing cycle yet.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => {
              const isCurrent = currentPlan === plan.name;

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
                    <h3 className="text-lg font-semibold capitalize text-white">
                      {plan.name.replace("_", " ")}
                    </h3>

                    <p className="mt-2 text-3xl font-bold text-white">
                      Rs.{plan.price}
                      <span className="text-sm text-gray-400">
                        {" "}
                        / {billingType === "monthly" ? "month" : "year"}
                      </span>
                    </p>

                    <ul className="mt-4 flex-1 space-y-2">
                      {plan.features.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-sm text-gray-300"
                        >
                          <Check size={16} className="text-green-400" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <button
                      disabled={isCurrent}
                      className={`mt-5 rounded-xl py-2 font-medium transition ${
                        isCurrent
                          ? "cursor-not-allowed bg-gray-700 text-gray-400"
                          : "bg-white text-black hover:opacity-90"
                      }`}
                    >
                      {isCurrent ? "Current Plan" : "Upgrade"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
