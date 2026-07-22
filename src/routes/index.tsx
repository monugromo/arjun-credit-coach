import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/v2" });
  },
  head: () => ({
    meta: [
      { title: "GroScore — Onboarding" },
      { name: "description", content: "Your personal credit coach." },
    ],
  }),
  component: () => null,
});
