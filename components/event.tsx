//                                  __
//                                 |  \
//  __    __   ______    _______  _| $$_     ______    ______    ______   ______ ____
// |  \  |  \ /      \  /       \|   $$ \   /      \  /      \  |      \ |      \    \
// | $$  | $$|  $$$$$$\|  $$$$$$$ \$$$$$$  |  $$$$$$\|  $$$$$$\  \$$$$$$\| $$$$$$\$$$$\
// | $$  | $$| $$  | $$ \$$    \   | $$ __ | $$   \$$| $$    $$ /      $$| $$ | $$ | $$
// | $$__/ $$| $$__/ $$ _\$$$$$$\  | $$|  \| $$      | $$$$$$$$|  $$$$$$$| $$ | $$ | $$
//  \$$    $$| $$    $$|       $$   \$$  $$| $$       \$$     \ \$$    $$| $$ | $$ | $$
//   \$$$$$$ | $$$$$$$  \$$$$$$$     \$$$$  \$$        \$$$$$$$  \$$$$$$$ \$$  \$$  \$$
//           | $$
//           | $$
//            \$$

'use client';

// Libs
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Components
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    ChevronDown,
    ChevronUp,
    Copy,
    Check
} from "lucide-react";
import {
    useState,
    type ReactNode
} from "react";
import { Button } from "./ui/button";

// Types
export type Events = {
    events: EventProps[];
}

export type EventProps = {
    title: string;
    icon: string;
    time: string;
    content?: ReactNode;
    category?: string;
    fields?: {
        name: string;
        value: string;
    }[];
    events?: {
        icon: string;
        time: string;
        content: ReactNode;
    }[];
    data?: unknown;
    actions?: {
        title: string;
        type: "default" | "secondary" | "ghost";
        url: string;
    }[];
}

export function EventsList(
    {
        events
    }: Events
) {
    return (
        <div className="flex flex-col gap-2">
            {events.map((event, index) => (
                <Event
                    key={index}
                    title={event.title}
                    icon={event.icon}
                    time={event.time}
                    content={event.content}
                    category={event.category}
                    fields={event.fields}
                    events={event.events}
                    data={event.data}
                    actions={event.actions}
                />
            ))}
        </div>
    )
}

export function Event(
    {
        title,
        icon,
        time,
        content,
        category,
        fields,
        events,
        data,
        actions
    }: EventProps
) {

    const [open, setOpen] = useState(false);
    const extras = Boolean(
        content ||
        actions?.length ||
        data ||
        fields?.length ||
        events?.length
    );
    const [showFullJson, setShowFullJson] = useState(false);
    const [copied, setCopied] = useState(false);

    const copyJson = () => {
        if (data) {
            navigator.clipboard.writeText(JSON.stringify(data, null, 2));

            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <Card
            className="w-[450px] bg-muted/40 p-3 ring-0 gap-0"
        >
            <CardHeader
                className={`flex flex-row items-center space-y-0 p-0 transition-opacity group ${extras ? "cursor-pointer select-none hover:opacity-80" : ""}`}
                onClick={() => extras && setOpen(!open)}
            >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background text-2xl">
                    {icon}
                </div>

                <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 pl-3">
                    <CardTitle className="flex w-full flex-1 items-center leading-none text-sm font-medium">
                        <p className="shrink-0 text-base font-medium leading-none text-muted-foreground">
                            {time}
                        </p>

                        <p className="ml-2 truncate text-base leading-snug text-foreground">
                            {title}
                        </p>

                        {category && (
                            <span className="shrink-0 ml-2 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground capitalize hidden sm:inline-block">
                                {category}
                            </span>
                        )}

                        {/* 2. Swapped <Button> for a simple <div> */}
                        {extras && (
                            <div className="ml-auto flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors group-hover:bg-muted group-hover:text-foreground">
                                {open ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
                            </div>
                        )}
                    </CardTitle>
                </div>
            </CardHeader>

            <CardContent className={`grid p-0 pl-[3.25rem] transition-all duration-300 ease-out ${open ? "mt-3 grid-rows-[1fr] opacity-100" : "mt-0 grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden min-h-0">
                    {content && (
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            {content}
                        </p>
                    )}
                    {fields && (
                        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
                            {fields.map((field, index) => (
                                <div key={index} className="flex flex-col">
                                    <span className="text-sm text-muted-foreground">
                                        {field.name}
                                    </span>
                                    <span className="text-sm font-medium text-foreground">
                                        {field.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                    {events && (
                        <div className="mt-3 space-y-3">
                            {events.map((event, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted/20 text-xs">
                                        {event.icon}
                                    </div>
                                    <div className="min-w-0 flex-1 flex flex-row items-center gap-2">
                                        <p className="text-sm font-medium leading-none text-foreground shrink-0">
                                            {event.time}
                                        </p>
                                        <p className="text-sm text-muted-foreground truncate leading-none">
                                            {event.content}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {!!data && (
                        <div className="relative mt-4 group">

                            <Button
                                variant="secondary"
                                size="icon"
                                className="absolute right-2 top-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                                onClick={copyJson}
                                title="Copy JSON"
                            >
                                {copied ? <Check className="size-4" /> : <Copy className="size-3" />}
                            </Button>

                            <div className={`relative rounded bg-muted/60 text-xs ${showFullJson ? "" : "max-h-48 overflow-hidden"}`}>
                                <SyntaxHighlighter
                                    language="json"
                                    style={vscDarkPlus}
                                    customStyle={{ margin: 0, padding: '0.75rem 0.75rem 2.5rem 0.75rem', background: 'transparent' }}
                                >
                                    {JSON.stringify(data, null, 2)}
                                </SyntaxHighlighter>

                                {!showFullJson && (
                                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-muted to-transparent pointer-events-none" />
                                )}

                                <div className="absolute bottom-0 left-0 right-0 z-10">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setShowFullJson(!showFullJson)}
                                        className="h-9 w-full rounded-none rounded-b text-xs shadow-none border-0 bg-muted hover:bg-muted"
                                    >
                                        {showFullJson ? "Show less" : "Show all JSON"}
                                    </Button>
                                </div>
                            </div>

                        </div>
                    )}
                    {actions && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {actions.map((action, index) => (
                                <Button
                                    key={index}
                                    variant={action.type}
                                    size="sm"
                                    onClick={() => window
                                        .open(action.url, "_blank")}
                                >
                                    {action.title}
                                </Button>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}