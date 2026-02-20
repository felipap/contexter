import type { Metadata } from "next"
import { StickiesNav } from "./StickiesNav"

export const metadata: Metadata = {
  title: "Stickies",
}

interface Props {
  children: React.ReactNode
}

export default function StickiesLayout({ children }: Props) {
  return (
    <div>
      <StickiesNav />
      {children}
    </div>
  )
}
