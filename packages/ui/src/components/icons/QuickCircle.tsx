import classNames from 'classnames'
import React from 'react'

import { IconComponent } from '../../types'

export const QuickCircleIcon: IconComponent = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 48 48"
      stroke="currentColor"
      aria-hidden="true"
      {...props}
      className={classNames(props.className, 'rotate-180')}
    >
      <g id="Frame" clipPath="url(#clip0_7_203)">
        <path
          id="Vector"
          d="M40 22C39.5107 18.4807 37.878 15.2199 35.3533 12.7197C32.8286 10.2196 29.5519 8.61882 26.028 8.164C22.881 7.75448 19.683 8.2789 16.8315 9.67208C13.9801 11.0653 11.601 13.2657 9.98999 16"
          stroke="white"
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          id="Vector_2"
          d="M8 26C8.46269 29.3302 9.95008 32.434 12.2559 34.8809C14.5618 37.3278 17.5719 38.9967 20.8688 39.6561C24.1657 40.3154 27.5861 39.9327 30.6557 38.5608C33.7253 37.189 36.292 34.8961 38 32"
          stroke="white"
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          id="Vector_3"
          d="M36 32C36 32.5304 36.2107 33.0391 36.5858 33.4142C36.9609 33.7893 37.4696 34 38 34C38.5304 34 39.0391 33.7893 39.4142 33.4142C39.7893 33.0391 40 32.5304 40 32C40 31.4696 39.7893 30.9609 39.4142 30.5858C39.0391 30.2107 38.5304 30 38 30C37.4696 30 36.9609 30.2107 36.5858 30.5858C36.2107 30.9609 36 31.4696 36 32Z"
          stroke="white"
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          id="Vector_4"
          d="M8 16C8 16.5304 8.21071 17.0391 8.58579 17.4142C8.96086 17.7893 9.46957 18 10 18C10.5304 18 11.0391 17.7893 11.4142 17.4142C11.7893 17.0391 12 16.5304 12 16C12 15.4696 11.7893 14.9609 11.4142 14.5858C11.0391 14.2107 10.5304 14 10 14C9.46957 14 8.96086 14.2107 8.58579 14.5858C8.21071 14.9609 8 15.4696 8 16Z"
          stroke="white"
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          id="Vector_5"
          d="M18 24C18 25.5913 18.6321 27.1174 19.7574 28.2426C20.8826 29.3679 22.4087 30 24 30C25.5913 30 27.1174 29.3679 28.2426 28.2426C29.3679 27.1174 30 25.5913 30 24C30 22.4087 29.3679 20.8826 28.2426 19.7574C27.1174 18.6321 25.5913 18 24 18C22.4087 18 20.8826 18.6321 19.7574 19.7574C18.6321 20.8826 18 22.4087 18 24Z"
          stroke="white"
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_7_203">
          <rect width="48" height="48" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}
