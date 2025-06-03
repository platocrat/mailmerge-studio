import React, { CSSProperties, FC } from 'react'


export type SpinnerProps = {
  width?: string
  stroke?: string
  height?: string
  style?: CSSProperties
  strokeWidth?: string
}

// <!-- By Sam Herbert (@sherb), for everyone. More @ http://goo.gl/7AJzbL -->
const Spinner: FC<SpinnerProps> = ({
  style,
  stroke,
  height,
  width,
  strokeWidth,
  ...rest
}) => {
  return (
    <svg
      style={ style }
      width={ width ?? '40' }
      height={ height ?? '40' }
      viewBox='-0.5 -1.2 40 40'
      xmlns='http://www.w3.org/2000/svg'
      stroke={ stroke ?? 'rgb(0, 123, 194, 0.85)' }
      { ...rest }
    >
      <g fill='none' fillRule='evenodd'>
        <g transform='translate(1 1)' strokeWidth={ strokeWidth ?? '2.25' }>
          <circle strokeOpacity='0.3' cx='18' cy='18' r='18' />
          <path d='M36 18c0-9.94-8.06-18-18-18'>
            <animateTransform
              attributeName='transform'
              type='rotate'
              from='0 18 18'
              to='360 18 18'
              dur='0.645s'
              repeatCount='indefinite'
            />
          </path>
        </g>
      </g>
    </svg>
  )
}

export default Spinner
