"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

interface CardData {
    src: string
    alt: string
    label: string
}

interface ShakingCardsProps {
    cards: CardData[]
    className?: string
}

export function ShakingCards({ cards, className }: ShakingCardsProps) {
    return (
        <div className={cn("flex flex-wrap items-start justify-center gap-4", className)}>
            {cards.map((card) => (
                <div
                    key={card.label}
                    className="group relative flex flex-col items-center animate-shake"
                >
                    <div className="relative overflow-hidden rounded-2xl border-[3px] border-amber-500 bg-zinc-900 shadow-2xl">
                        <Image
                            src={card.src}
                            alt={card.alt}
                            width={180}
                            height={130}
                            className="h-[100px] w-[140px] object-cover"
                        />
                    </div>

                    <div className="absolute -bottom-2 rounded-full bg-amber-500 px-2 py-0 text-sm font-semibold text-white shadow-lg">
                        {card.label}
                    </div>
                </div>
            ))}
        </div>
    )
}