import { createFileRoute, redirect } from "@tanstack/react-router";
import { MEMBERS } from "@/data/members";

export const Route = createFileRoute("/versus/")({
  beforeLoad: () => {
    throw redirect({ to: "/versus/$pair", params: { pair: `${MEMBERS[0].slug}~${MEMBERS[1].slug}` } });
  },
});
