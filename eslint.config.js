import mist from '@mistjs/eslint-config'

export default mist({
  rules: {
    'no-prototype-builtins': 0,
    'node/prefer-global/process': 0,
  },
})
