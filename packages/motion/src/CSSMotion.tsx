export type MotionName =
    | string
    | {
      appear?: string
      enter?: string
      leave?: string
      appearActive?: string
      enterActive?: string
      leaveActive?: string
    }
