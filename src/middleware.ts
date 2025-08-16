import {NextRequest, NextResponse} from 'next/server'
import {middlewareHandleUnauthorized} from "@/lib/error";


export const config = {
    matcher: ['/api/:path*'],
}

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {

    // Basic Auth
    const basicAuthFilter = basicAuth(request);
    if (basicAuthFilter) return basicAuthFilter;

    // Filter Done
    return NextResponse.next()
}

export function basicAuth(request: NextRequest) {
    const username = process.env.BASIC_AUTUH_USERNAME;
    const password = process.env.BASIC_AUTUH_PASSWORD;
    const basicAuth = btoa(`${username}:${password}`);

    const authorizationHeader = request.headers.get("Authorization")?.substring("Basic ".length);
    if (authorizationHeader != basicAuth) {
        console.log("Authorization header is not valid");
        return middlewareHandleUnauthorized("Basic Authentication Not Valid");
    }

}

