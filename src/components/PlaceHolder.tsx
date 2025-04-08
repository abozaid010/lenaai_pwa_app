import React from 'react'

interface PlaceHolderProps {
    title: string;
    style?: React.CSSProperties;
}

const PlaceHolder = ({ title, style }: PlaceHolderProps) => {
    return (
        <div style={{
            height: 'auto',
            borderRadius: '10px',
            margin: '0',
            padding: '0',
        }}>
            <p style={{
                fontSize: '14px',
                fontWeight: '500',
                textAlign: 'start',
                margin: '0',
                padding: '0',
                ...style
            }}>
                {title}
            </p>
        </div>
    )
}

export default PlaceHolder;