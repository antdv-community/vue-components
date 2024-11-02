export default function useEvent<T extends Function>(callback: T): T {
  return callback
}
