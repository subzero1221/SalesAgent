import { redirect } from "next/navigation";

export default function UserPage() {
  redirect("/dashboard"); // არ დატოვო ცარიელი, ეგრევე გააპანღურე
}
