/**
 * Where an authenticated user belongs, given the two post-signup gates.
 * Shared by every guard so the redirect chain can't disagree with itself.
 *
 * @param {{ needsVerification?: boolean, onboardingComplete?: boolean }} auth
 * @returns {'/verify-email' | '/onboarding' | '/dashboard'}
 */
export function postAuthPath({ needsVerification, onboardingComplete }) {
  if (needsVerification) return '/verify-email';
  if (!onboardingComplete) return '/onboarding';
  return '/dashboard';
}
