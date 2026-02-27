declare module 'react-reveal' {
  import * as React from 'react'

  type RevealProps = {
    children?: React.ReactNode
    duration?: number
    delay?: number
    left?: boolean
    right?: boolean
    top?: boolean
    bottom?: boolean
    cascade?: boolean
    collapse?: boolean
    fraction?: number
    when?: boolean
    spy?: any
    [key: string]: any
  }

  export const Fade: React.ComponentType<RevealProps>
  export const Zoom: React.ComponentType<RevealProps>
  export const Slide: React.ComponentType<RevealProps>
  export const Flip: React.ComponentType<RevealProps>
  export const Rotate: React.ComponentType<RevealProps>
  export const Bounce: React.ComponentType<RevealProps>

  const Reveal: React.ComponentType<RevealProps>
  export default Reveal
}

declare module 'react-reveal/*' {
  import * as React from 'react'

  const RevealComponent: React.ComponentType<any>
  export default RevealComponent
}
