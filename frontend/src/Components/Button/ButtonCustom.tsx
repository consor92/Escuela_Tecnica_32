import React from 'react'
import { Button } from '@mui/material'

interface Props {
    description: string
    size?: 'small' | 'medium' | 'large'
    fontSize?: string
}

const ButtonCustom = ({ description, size, fontSize }: Props) => {
    return (
        <Button size={size} sx={{ p: 0, minWidth: 'auto', color: '#9D9D9D', fontSize: { fontSize } }}>{description}</Button>
    )
}

export default ButtonCustom