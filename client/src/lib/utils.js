import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getProfilePic(gender){
  console.log(gender)
  let baseUrl = "https://avatar.iran.liara.run/public/"
  return baseUrl + (gender === "Male" ? "boy" : "girl");
}
