'use client';

// Libraries
import { authClient } from "@/client/auth"
import { useParams } from "next/navigation";

export default function Page() {
    const params = useParams();

    return (
        <h1>{params.id}</h1>
    )
}