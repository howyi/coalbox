import React from 'react';
import {LinearProgress} from "@mui/material";
import {Alert} from "@mui/material";


export const useListLoader = (load: () => Promise<void>): [boolean, string | undefined, () => Promise<void>] => {
    const [isLoading, setIsLoading] = React.useState(true)
    const [loadError, setLoadError] = React.useState<string>()

    React.useEffect(() => {
        const asyncLoad = async() => {
            setLoadError(undefined)
            setIsLoading(true)
            try {
                await load()
                setLoadError(undefined)
            } catch (e) {
                setLoadError(`${e}`)
            }
            setIsLoading(false)
        }
        asyncLoad().then()
     }, [])

    const reload = async () => {
        await load()
    }

    return [
        isLoading,
        loadError,
        reload,
    ]
}

export const ListLoadProgress: React.VFC<{isLoading: boolean}> = ({isLoading}) => {
    if (isLoading) {
        return <LinearProgress color="primary"/>
    }
    return <></>
}

export const ListLoadErrorMessage: React.VFC<{loadError?: string}> = ({loadError}) => {
    if (loadError) {
        return <Alert severity="warning" variant={"outlined"} style={{margin: '10px', wordBreak: "break-word"}}>
            Load {loadError}
        </Alert>
    }
    return <></>
}