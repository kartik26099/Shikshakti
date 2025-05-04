import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // This is a simplified middleware that would normally check for authentication tokens
  // In a real app, you would verify JWT tokens or session cookies here

  // For now, we'll just redirect unauthenticated users from protected routes to the sign-in page
  // In a real implementation, you would check for auth tokens/cookies

  // List of paths that require authentication
  const protectedPaths = ["/profile"]

  // Check if the requested path is in the protected paths
  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  // In a real implementation, you would check for auth tokens here
  // For now, we'll just redirect to sign-in for protected paths
  // This is just a placeholder - the actual auth check happens client-side in our demo

  if (isProtectedPath) {
    // In a real app, you would check for auth tokens/cookies here
    // For this demo, we'll let the client-side auth context handle redirects
    return NextResponse.next()
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/profile/:path*"],
}
