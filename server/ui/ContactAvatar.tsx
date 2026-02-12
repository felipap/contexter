import { twMerge } from "tailwind-merge"

type Props = {
  name: string
  isGroup: boolean
}

export function ContactAvatar({ name, isGroup }: Props) {
  const initial = name.charAt(0).toUpperCase()

  return (
    <div
      className={twMerge(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium",
        isGroup
          ? "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400"
          : "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
      )}
    >
      {isGroup ? "G" : initial}
    </div>
  )
}
