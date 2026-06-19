export type LandingAnalyticsEvent =
  | 'landing_view'
  | 'install_click'
  | 'install_accepted'
  | 'install_dismissed'
  | 'install_unavailable'
  | 'ios_instructions_view'
  | 'continue_web_click';

export function trackLandingEvent(
  name: LandingAnalyticsEvent,
  props?: Record<string, string | number | boolean | undefined>,
) {
  if (import.meta.env.DEV) {
    console.debug('[landing-analytics]', name, props ?? {});
  }
}
