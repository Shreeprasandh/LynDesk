import { redirect } from "next/navigation";

export default function NewsContestsPage() {
  redirect("/explore?tab=news");
}

