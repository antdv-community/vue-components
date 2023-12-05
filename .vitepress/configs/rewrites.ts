export function getRewrites(): Record<string, string> {
  return {
    'packages/:pkg/docs/(.*)': 'components/:pkg/(.*)',
    'docs/(.*)': '(.*)',
  }
}
