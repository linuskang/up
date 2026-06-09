'use client';

import { cn } from "@/lib/utils";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";

export type CategoryProps = {
    name: string;
    count: number;
}

export function CategorySelector(
    {
        categories,
        selectedCategory,
        onSelectCategory
    }: {
        categories: CategoryProps[];
        selectedCategory?: string;
        onSelectCategory?: (category: string) => void;
    }
) {
    return (
        <Card className="w-[180px] rounded-xl bg-card ring-0">
            <CardHeader className="px-4 pt-0 pb-0">
                <CardTitle className="text-lg font-semibold text-foreground">
                    Categories
                </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-0 pt-0">
                <div className="flex flex-col gap-0.5">
                    {categories.map((category) => {
                        const active = selectedCategory === category.name;
                        return (
                            <button
                                key={category.name}
                                type="button"
                                onClick={() => onSelectCategory?.(category.name)}
                                className={cn(
                                    "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                    active
                                        ? "bg-secondary text-secondary-foreground"
                                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                                )}
                            >
                                <span className="capitalize">{category.name}</span>
                                <span className={cn(
                                    "ml-2 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
                                    active
                                        ? "bg-background text-foreground shadow-sm"
                                        : "bg-muted text-muted-foreground"
                                )}>
                                    {category.count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    )
}