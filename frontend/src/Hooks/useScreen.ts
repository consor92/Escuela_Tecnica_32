import { useState, useEffect } from 'react'


type WindowDimensions = {
    width: number
    height: number
}

function getWindowDimensions(): WindowDimensions {
    const { innerWidth: width, innerHeight: height } = window
    return { width, height }
}

export default function useScreen() {
    const [windowDimensions, setWindowDimensions] = useState<WindowDimensions>({ width: 0, height: 0 })

    useEffect(() => {
        setWindowDimensions(getWindowDimensions())

        function handleResize() {
            setWindowDimensions(getWindowDimensions())
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])
    return windowDimensions

}