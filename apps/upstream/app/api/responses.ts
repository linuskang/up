import { NextResponse } from "next/server";

export function BadRequest(message?: string, data?: unknown) {
    return NextResponse.json(
        {
            code: 400,
            success: false,
            message: message,
            data,
        },
        {
            status: 400,
        }
    );
}

export function Unauthorized(message?: string, data?: unknown) {
    return NextResponse.json(
        {
            code: 401,
            success: false,
            message: message,
            data,
        },
        {
            status: 401,
        }
    );
}

export function NotFound(message?: string, data?: unknown) {
    return NextResponse.json(
        {
            code: 404,
            success: false,
            message: message,
            data,
        },
        {
            status: 404,
        }
    );
}

export function InternalServerError(message?: string, data?: unknown) {
    return NextResponse.json(
        {
            code: 500,
            success: false,
            message: message,
            data,
        },
        {
            status: 500,
        }
    );
}

export function Success(message?: string, data?: unknown) {
    return NextResponse.json(
        {
            code: 200,
            success: true,
            message: message,
            data,
        },
        {
            status: 200,
        }
    );
}

export function Forbidden(message?: string, data?: unknown) {
    return NextResponse.json(
        {
            code: 403,
            success: false,
            message: message,
            data,
        },
        {
            status: 403,
        }
    );
}