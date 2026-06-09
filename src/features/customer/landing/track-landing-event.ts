export type LandingAnalyticsEvent =
  | 'landing_view'
  | 'install_click'
  | 'install_accepted'
  | 'install_dismissed'
  | 'ios_instructions_view';

export function trackLandingEvent(
  name: LandingAnalyticsEvent,
  props?: Record<string, string | number | boolean | undefined>,
) {
  if (import.meta.env.DEV) {
    console.debug('[landing-analytics]', name, props ?? {});
  }
}
