import { createFileRoute, redirect } from "@tanstack/react-router";
import { ROSTER } from "@/data/members";

export const Route = createFileRoute("/versus/")({
  beforeLoad: () => {
    throw redirect({ to: "/versus/$pair", params: { pair: `${ROSTER[0]!.slug}~${ROSTER[1]!.slug}` } });
  },
});
