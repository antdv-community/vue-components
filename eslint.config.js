import mist from '@mistjs/eslint-config'

export default mist({
  rules: {
    'no-prototype-builtins': 0,
    'node/prefer-global/process': 0,
    'jsdoc/empty-tags': 0,
    'eslint-comments/no-unlimited-disable': 0,
  },
})
