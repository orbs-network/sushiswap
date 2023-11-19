import React from 'react'

export const PolygonSVG = (props: React.ComponentProps<'svg'>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" {...props} fill="none" viewBox="0 0 175 48">
      <title>Polygon</title>
      <path
        fill="currentColor"
        d="M68.462 17.83c.948.574 1.75 1.363 2.26 2.44.584 1.075.876 2.366.876 3.8 0 1.435-.292 2.655-.948 3.73-.584 1.077-1.459 1.866-2.553 2.368-1.094.574-2.407.86-3.792.86a6.03 6.03 0 01-2.261-.43c-.73-.215-1.386-.645-1.897-1.147v7.46h-4.23V17.255h3.647l.364 1.578c1.605-1.29 3.355-1.936 5.179-1.936 1.24 0 2.407.287 3.355.932zm-2.334 8.895c.73-.646 1.094-1.507 1.094-2.582 0-1.076-.365-1.937-1.021-2.655-.657-.717-1.532-1.004-2.48-1.004-.802 0-1.532.144-2.115.502-.584.287-1.021.79-1.386 1.435v3.228c.219.645.657 1.148 1.167 1.506.584.359 1.24.574 2.042.574 1.094 0 1.97-.359 2.699-1.004zM74.078 20.34c.656-1.005 1.531-1.866 2.698-2.44a8.838 8.838 0 013.938-.932c1.46 0 2.772.287 3.939.933 1.094.573 1.969 1.434 2.625 2.51.657 1.076.949 2.224.949 3.587 0 1.362-.292 2.51-.949 3.586-.656 1.076-1.458 1.937-2.625 2.51-1.094.574-2.48.933-3.939.933-1.458 0-2.771-.287-3.938-.86-1.167-.575-2.042-1.364-2.698-2.44a7.663 7.663 0 01-.949-3.73c0-1.362.365-2.582.948-3.658zm4.303 6.24c.583.717 1.385 1.004 2.333 1.004.949 0 1.75-.359 2.334-1.004.584-.646.876-1.578.876-2.582 0-1.076-.292-1.937-.876-2.583-.656-.717-1.385-1.076-2.407-1.076-.948 0-1.677.359-2.333 1.005-.584.717-.876 1.578-.876 2.654 0 1.004.292 1.864.949 2.582zM95.082 7.07v23.6h-4.23V7.07h4.23zM112.44 17.614l-8.606 19.367H99.75l3.209-6.958-6.126-12.409h4.813l3.501 7.747 3.501-7.747h3.792zM128.632 17.614v13.054c0 1.22-.365 2.367-1.094 3.372-.73 1.004-1.678 1.793-2.918 2.367-1.24.574-2.552.86-4.011.86a10.95 10.95 0 01-2.844-.358c-.803-.287-1.459-.574-1.97-.86a13.397 13.397 0 01-1.823-1.364l2.48-2.869a7.127 7.127 0 001.823 1.291 5.249 5.249 0 002.261.502c1.094 0 1.969-.287 2.699-.789.729-.502 1.094-1.29 1.094-2.223v-1.865a4.76 4.76 0 01-1.897 1.65c-.875.43-1.896.645-3.063.645-1.167 0-2.334-.287-3.355-.932-1.021-.574-1.823-1.435-2.48-2.511-.583-1.076-.948-2.224-.948-3.515 0-1.29.292-2.51.948-3.586.657-1.076 1.459-1.937 2.553-2.582 1.021-.646 2.115-.933 3.282-.933 1.094 0 2.042.143 2.917.43.876.287 1.532.718 1.97 1.22l.437-1.004h3.939zm-4.303 8.033V22.42a3.108 3.108 0 00-1.386-1.507 4.588 4.588 0 00-2.261-.574 3.86 3.86 0 00-2.626 1.005c-.729.645-1.094 1.506-1.094 2.582 0 1.004.365 1.937 1.094 2.654a3.613 3.613 0 002.626 1.076c1.677-.072 2.917-.717 3.647-2.009zM132.132 20.34c.657-1.075 1.532-1.864 2.699-2.51a8.84 8.84 0 013.938-.932c1.459 0 2.772.287 3.939.932 1.094.574 1.969 1.435 2.625 2.51.584 1.077.948 2.224.948 3.587s-.291 2.51-.948 3.587a5.88 5.88 0 01-2.625 2.51c-1.094.574-2.48.933-3.939.933-1.458 0-2.771-.287-3.938-.86-1.167-.575-2.042-1.364-2.699-2.44-.656-1.076-.948-2.295-.948-3.801 0-1.22.292-2.44.948-3.515zm4.231 6.241c.583.718 1.385 1.005 2.333 1.005.949 0 1.751-.36 2.334-1.005.584-.645.875-1.578.875-2.582 0-1.076-.291-1.937-.875-2.582-.583-.646-1.385-1.004-2.334-1.004-.948 0-1.677.358-2.333 1.004-.657.645-.949 1.578-.949 2.582.073 1.004.365 1.865.949 2.582zM161.233 18.044c.875.717 1.24 1.65 1.313 2.797v9.827h-4.304V22.42c-.072-1.292-.729-1.937-1.969-1.937-.948 0-1.75.43-2.334 1.363-.583.932-.875 2.08-.875 3.443v5.38h-4.23V17.613h3.866l.291 2.08a5.448 5.448 0 012.042-2.009c.876-.502 1.897-.717 3.064-.717 1.239 0 2.333.359 3.136 1.076z"
      />
      <path
        fill="#8247E5"
        d="M37.83 17.365c-.73-.43-1.678-.43-2.48 0l-5.689 3.3-3.865 2.152-5.69 3.299c-.728.43-1.677.43-2.479 0l-4.522-2.582c-.729-.43-1.24-1.22-1.24-2.08V16.36c0-.861.438-1.65 1.24-2.08l4.45-2.511c.729-.43 1.677-.43 2.479 0l4.449 2.51c.73.431 1.24 1.22 1.24 2.08v3.3l3.865-2.223v-3.3c0-.86-.437-1.65-1.24-2.08l-8.241-4.734c-.73-.43-1.678-.43-2.48 0L9.24 12.057A2.32 2.32 0 008 14.137v9.54c0 .861.438 1.65 1.24 2.08l8.387 4.735c.73.43 1.678.43 2.48 0l5.689-3.228 3.865-2.224 5.689-3.228c.73-.43 1.677-.43 2.48 0l4.449 2.51c.729.431 1.24 1.22 1.24 2.081v5.093c0 .86-.438 1.65-1.24 2.08l-4.45 2.582c-.729.43-1.677.43-2.479 0l-4.449-2.51c-.73-.43-1.24-1.22-1.24-2.08v-3.3l-3.865 2.224v3.3c0 .86.437 1.649 1.24 2.08l8.387 4.733c.73.43 1.677.43 2.48 0l8.387-4.734c.73-.43 1.24-1.22 1.24-2.08v-9.54c0-.86-.438-1.65-1.24-2.08l-8.46-4.806z"
      />
    </svg>
  )
}