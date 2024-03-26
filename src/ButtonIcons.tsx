import { CSSProperties } from 'react';

export const QUICK_ACCESS_MENU = ({ style }: { style?: CSSProperties | undefined }) => {
    return <svg style={style} width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
        <rect width="32" height="32" fill="none" />
        <path d="m7.31,8.66C3.28,8.66.02,11.95.02,16s3.26,7.34,7.29,7.34h17.42c4.03,0,7.29-3.28,7.29-7.34s-3.26-7.33-7.29-7.33H7.31Zm3.24,7.33c0,1.01-.82,1.83-1.82,1.83s-1.82-.82-1.82-1.83.82-1.83,1.82-1.83,1.82.82,1.82,1.83Zm5.47,1.83c1.01,0,1.82-.82,1.82-1.83s-.82-1.83-1.82-1.83-1.82.82-1.82,1.83.82,1.83,1.82,1.83Zm9.11-1.83c0,1.01-.82,1.83-1.82,1.83s-1.82-.82-1.82-1.83.82-1.83,1.82-1.83,1.82.82,1.82,1.83Z" fill-rule="evenodd" clip-rule="evenodd" fill="currentColor" />
    </svg>
}

export const A = ({ style }: { style?: CSSProperties | undefined }) => {
    return <svg style={style} width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
        <rect width="32" height="32" fill="none" />
        <path d="m16,30c7.73,0,14-6.27,14-14S23.73,2,16,2,2,8.27,2,16s6.27,14,14,14Zm3.46-7.5h3.04l-5.16-13.5h-2.83l-5.01,13.5h2.93l.88-2.62h5.24l.92,2.62Zm-5.39-4.88l1.84-5.4,1.87,5.4h-3.71Z" fill-rule="evenodd" clip-rule="evenodd" fill="currentColor" />
    </svg>
}

export const SELECT = ({ style }: { style?: CSSProperties | undefined }) => {
    return <svg style={style} width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
        <rect width="32" height="32" fill="none" />
        <path d="m7.33,8.67c-4.05,0-7.33,3.28-7.33,7.33s3.28,7.33,7.33,7.33h17.33c4.05,0,7.33-3.28,7.33-7.33s-3.28-7.33-7.33-7.33H7.33Zm.27,3.06h10.27v1.71h-8.4v3.42h3.73v1.71h-5.6v-6.84Zm7.47,3.42h9.33v5.13h-9.33v-5.13Z" fill-rule="evenodd" clip-rule="evenodd" fill="currentColor" />
    </svg>
}