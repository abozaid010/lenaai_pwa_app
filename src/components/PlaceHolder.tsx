import React from 'react'

const PlaceHolder = ({ title }: { title: string }) => {
    return (
        <div style={{
            width: '80%',
            height: '30px',
            backgroundColor: 'grey',
            borderRadius: '10px',
            margin: '10px',
            padding: '10px',
        }}>
            <p style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: 'white',
                textAlign: 'start',
                margin: '0',
                padding: '0',
            }}>
                {title}
            </p>
        </div>
    )
}

export default PlaceHolder;