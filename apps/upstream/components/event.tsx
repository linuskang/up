"use client";

import { useState } from "react";

import { Open } from "@/components/icons"
import { Button } from "@workspace/ui/components/button";
import type { EventProps } from "@/types";

export default function Event({ title, icon, time, content, fields, events, data, actions, category }: EventProps) {
    const [isOpen, setIsOpen] = useState(false);
    const hasData = data !== null && data !== undefined;
    const hasDrawerContent = Boolean(content || actions?.length || hasData || fields?.length || events?.length);

    return (
        <div className="rounded-xl bg-card p-2 text-white shadow-sm ring-1 ring-white/5">
            <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background text-xl">
                    {icon}
                </div>

                <div className="flex min-w-0 flex-1 items-center gap-2">
                    <p className="shrink-0 text-md font-medium leading-none text-eventcontent/65">
                        {time}
                    </p>
                    <p className="truncate text-md font-semibold leading-snug text-white">
                        {title}
                    </p>
                    {category && (
                        <span className="shrink-0 rounded-full bg-white/8 px-2 py-0.5 text-[10px] font-medium text-eventcontent/60 capitalize hidden sm:inline-block">
                            {category}
                        </span>
                    )}
                </div>

                {hasDrawerContent && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-expanded={isOpen}
                        aria-label={isOpen ? "Collapse event drawer" : "Expand event drawer"}
                        className="shrink-0 bg-transparent transition-transform duration-300 aria-expanded:rotate-180"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <Open />
                    </Button>
                )}
            </div>

            {hasDrawerContent && (
                <div
                    className={`grid pl-[3.25rem] transition-[grid-template-rows,opacity,margin-top] duration-300 ease-out ${isOpen ? "mt-1 grid-rows-[1fr] opacity-100" : "mt-0 grid-rows-[0fr] opacity-0"}`}
                    aria-hidden={!isOpen}
                >
                    <div className="overflow-hidden">
                        <div className="flex flex-col gap-3 pb-1">
                            {content && (
                                <div className="text-sm leading-relaxed text-eventcontent/80">
                                    {content}
                                </div>
                            )}

                            {fields && (
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                    {fields.map((field, index) => (
                                        <div key={index} className="flex flex-col">
                                            <span className="text-sm text-eventcontent/80">
                                                {field.name}
                                            </span>
                                            <span className="text-sm text-white">
                                                {field.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {events && (
                                <div className="flex flex-col gap-2">
                                    {events.map((event, index) => (
                                        <div key={index} className="flex items-start gap-3">
                                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-background text-xs">
                                                {event.icon}
                                            </div>
                                            <div className="min-w-0 flex-1 flex flex-wrap items-center gap-2">
                                                <p className="text-sm font-medium leading-none text-eventcontent/65">
                                                    {event.time}
                                                </p>
                                                <p className="text-sm leading-relaxed text-white">
                                                    {event.content}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {hasData && (
                                <div className="relative max-h-48 rounded-md bg-eventbg">
                                    <pre className="overflow-auto p-2 text-sm text-eventcontent/80">
                                        {JSON.stringify(data, null, 2)}
                                    </pre>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(JSON.stringify(data, null, 2))}
                                        className="absolute top-1 right-1 rounded bg-eventcontent/20 px-2 py-1 text-xs hover:bg-eventcontent/10 transition cursor-pointer"
                                    >
                                        Copy
                                    </button>
                                </div>
                            )}

                            {actions && (
                                <div className="flex flex-nowrap gap-2 overflow-x-auto">
                                    {actions.map((action, index) => (
                                        <Button
                                            key={index}
                                            asChild
                                            variant={action.type === "primary" ? "default" : "secondary"}
                                            size="sm"
                                            className="shrink-0"
                                        >
                                            <a href={action.url} target="_blank" rel="noreferrer">
                                                {action.label}
                                            </a>
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
