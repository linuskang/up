import { NextRequest, NextResponse } from 'next/server';
import { Api } from '@/server/utils';
import { prisma } from '@/server/prisma';

export async function POST(req: NextRequest) {
    const apiKey = req.headers.get('x-api-key');

    if (!apiKey) {
        return NextResponse.json(
            {
                error: 'API key is required'
            },
            {
                status: 401
            }
        )
    }

    if (!await Api.validateKey(apiKey)) {
        return NextResponse.json(
            {
                error: 'Invalid API key'
            },
            {
                status: 401
            }
        )
    }

    return NextResponse.json(
        {
            msg: 'success'
        }
    )
}