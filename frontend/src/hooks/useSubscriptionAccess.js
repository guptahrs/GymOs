import { useQuery } from "@tanstack/react-query";

import API from "../api/client";

const defaultAccess = {
  subscription_id: null,
  plan_name: null,
  plan_price: null,
  duration_days: null,
  badge_color: null,
  start_date: null,
  end_date: null,
  status: null,
  days_left: 0,
  access_type: "paid",
  is_trial: false,
  access_status: "no_plan",
  is_read_only: true,
  can_manage_data: false,
  show_buy_plan: true,
  trial_days: null,
};

export function useSubscriptionAccess() {
  const gymId = localStorage.getItem("gym_id");

  return useQuery(
    ["subscription_access", gymId],
    async () => {
      if (!gymId) {
        return defaultAccess;
      }

      const res = await API.get(`/subscriptions/current/${gymId}/`);
      return { ...defaultAccess, ...(res.data.data || {}) };
    },
    {
      enabled: Boolean(gymId),
      staleTime: 5 * 60 * 1000,
    }
  );
}
