import { useId } from 'vue'

function getUseId() {
  return useId
}

const useOriginalId = getUseId()

export default function (id?: string) {
  const vueId = useOriginalId()
  if (id) {
    return id
  }
  // Test env always return mock id
  if (process.env.NODE_ENV === 'test') {
    return 'test-id'
  }

  return vueId
}
