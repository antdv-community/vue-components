export default function deprecated(props: any, instead: any, component: any) {
  if (typeof window !== 'undefined' && window.console && window.console.error) {
    window.console.error(
      `Warning: ${props} is deprecated at [ ${component} ], `
      + `use [ ${instead} ] instead of it.`,
    )
  }
}
