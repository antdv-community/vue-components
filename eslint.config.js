import mist from '@antfu/eslint-config'

export default mist({
  rules: {
    'style/quote-props': 0,
    'no-prototype-builtins': 0,
    'node/prefer-global/process': 0,
    'jsdoc/empty-tags': 0,
    'eslint-comments/no-unlimited-disable': 0,
  },
})
