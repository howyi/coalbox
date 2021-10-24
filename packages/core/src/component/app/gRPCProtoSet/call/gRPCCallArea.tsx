import React from 'react';
import {Alert, Box, InputBase, TextFieldProps} from "@mui/material";
import Typography from '@mui/material/Typography';
import {GRPCRequestEditor} from "./GRPCRequestEditor";
import {useCoalbox} from "../../../../hooks/useCoalbox";
import {
    Endpoint,
    gRPCProtoSetConfig,
    GrpcRequestTemplatePath,
    GrpcRequestValue,
    InstanceConfig, TabConfig
} from "../../../../types/config";
import {ProtoFile, ProtoServiceMethod} from "@coalbox/proto-mapper";
import {useCoalboxProtoSet} from "../../../../hooks/useCoalboxProtoSet";
import { debounce } from 'throttle-debounce';
import * as grpc from '@grpc/grpc-js'
import {Metadata} from "@grpc/grpc-js";
import {defaultTabName} from "../../../../const/default";
import {CoalboxController} from "../../../CoalboxWindow";
import {BoxText} from "../../../Highlighter/BoxText";

type Props = {
    instanceConfig: InstanceConfig<GrpcRequestValue, GrpcRequestTemplatePath>
    tabConfig: TabConfig
    controller: CoalboxController
}

export const GRPCCallArea: React.VFC<Props> = ({controller, instanceConfig, tabConfig}) => {
    const {config, finder, command} = useCoalbox()

    const path = instanceConfig.templatePath

    const [protoSetState, setProtoSetState] = useCoalboxProtoSet()
    const [protoFile, setProtoFile] = React.useState<ProtoFile>()
    const [collection, setCollection] = React.useState<gRPCProtoSetConfig>()
    const [rawMetadata, setRawMetadata] = React.useState<string>('')
    const [rawBody, setRawBody] = React.useState<string>('')
    const [endpoint, setEndpoint] = React.useState<Endpoint>({
        url: '',
        serverCertificate: false,
    })
    const [responseBody, setResponseBody] = React.useState<string>('')
    const [responseError, setResponseError] = React.useState<string>()
    const [responseTime, setResponseTime] = React.useState<string>('')

    React.useEffect(() => {
        setRawBody(instanceConfig.value.body)

        const loadCollection = finder.collectionById(instanceConfig.templatePath.collectionId) as gRPCProtoSetConfig
        if (!loadCollection) {
            return
        }
        setCollection(loadCollection)
        if (!controller.overrideGrpcMetadata) {
            setRawMetadata(loadCollection.metadata)
        }
        setEndpoint(loadCollection.endpoint)
    }, [])

    React.useEffect(() => {
        if (protoSetState[instanceConfig.templatePath.collectionId]) {
            const newProtoFile = protoSetState[instanceConfig.templatePath.collectionId].files[instanceConfig.templatePath.protoFilename]
            setProtoFile(newProtoFile)
            new Promise(async () => {
                const method = newProtoFile?.services?.[path.serviceName]?.methods?.[path.methodName]
                if (method && controller.overrideGrpcMetadata) {
                    const md = await controller.overrideGrpcMetadata(method.path)
                    setRawMetadata(JSON.stringify(md.getMap(), null , "\t"))
                }
            }).then()
         }
    }, [protoSetState])

    const debounceSaveBody = debounce(250, (body: string) => {
        if (instanceConfig) {
            command.updateInstance({
                ...instanceConfig,
                value: {
                    ...instanceConfig['value'],
                    body: body
                }
            })
        }
    })

    const changeRawBody = (value: string) => {
        setRawBody(value)
        debounceSaveBody(value)
    }

    const debounceSaveMetadata = debounce(250, (body: string) => {
        if (collection) {
            command.updateCollection({
                ...collection,
                metadata: body
            })
        }
    })

    const changeMetadata = (value: string) => {
        if (controller.overrideGrpcMetadata) {
            return
        }
        setRawMetadata(value)
        debounceSaveMetadata(value)
    }

    const debounceSaveEndpoint = debounce(250, (ep: Endpoint) => {
        if (collection) {
            command.updateCollection({
                ...collection,
                endpoint: ep
            })
        }
    })

    const onChangeEndpointUrl: TextFieldProps['onChange'] = (e) => {
        const newEp = {
            ...endpoint,
            url: e.target.value
        }
        setEndpoint(newEp)
        debounceSaveEndpoint(newEp)
    }

    const method = (): ProtoServiceMethod | undefined => {
        return protoFile?.services?.[path.serviceName]?.methods?.[path.methodName]
    }

    const send = async () => {
        const request = method()
        if (!request) {
            return
        }

        let targetEndpoint = endpoint
        if (controller.overrideEndpoint) {
            targetEndpoint = controller.overrideEndpoint()
        }
        const client = new grpc.Client(
            targetEndpoint.url,
            targetEndpoint.serverCertificate ? grpc.credentials.createSsl() : grpc.credentials.createInsecure(),
            {}
        )

        let md = new Metadata()

        if (controller.overrideGrpcMetadata) {
            md = await controller.overrideGrpcMetadata(request.path)
            setRawMetadata(JSON.stringify(md.getMap(), null , "\t"))
        } else {
            try {
                const jsonMetadata = JSON.parse(rawMetadata)
                Object.keys(jsonMetadata).forEach((key) => {
                    md.set(key, jsonMetadata[key])
                })
            } catch (e) {
                // JS PARSE ERROR
            }
        }

        const body = JSON.parse(rawBody)
        console.log('REQUEST2', targetEndpoint, request.path, md, body)
        const startTime = performance.now();
        const call = client.makeUnaryRequest(
            request.path,
            request.request.serialize,
            request.response.deserialize,
            body,
            md,
            {},
            (error, response) => {
                const endTime = performance.now();
                setResponseTime(`${(endTime -startTime).toFixed(3)}ms`)
                if (error) {
                    console.log(error, response)
                    console.error(error)
                    setResponseError(`${error}`)
                    setResponseBody('')
                } else {
                    setResponseError(undefined)
                    setResponseBody(JSON.stringify(response, null , "\t"))
                }
            }
        )
        call.on('ERROR', (e) => {
            console.log('err', e)
        })
    }

    return <Box display={'flex'} flexDirection="column" height={'100%'} width={'100%'}>
        <Box flex={'0 0 auto'} borderBottom={1} borderColor={'divider'} width={'100%'}>
            <Box display={'flex'} flexDirection="row">
                <Box flex={`0 0 220px`}>
                    <div style={{padding: '8px 16px'}} >
                        {instanceConfig?.name ?? defaultTabName}
                    </div>
                </Box>
                <Box flex={`0 0 0px`} borderRight={1} borderColor={'divider'}>
                    {/*<IconButton color="inherit">*/}
                    {/*    <OpenInNewIcon />*/}
                    {/*</IconButton>*/}
                </Box>
                <Box flex={'1'} width={'100%'} margin={'0 12px'} overflow={'hidden'}>
                    {!controller.overrideEndpoint &&
                    <InputBase value={endpoint.url} fullWidth={true} endAdornment={
                        <Typography color="text.secondary">
                            {method()?.path}
                        </Typography>
                    } onChange={onChangeEndpointUrl}/>
                    }
                    {controller.overrideEndpoint &&
                    <InputBase value={''} fullWidth={true} endAdornment={
                        <Typography color="text.secondary">
                            {method()?.path}
                        </Typography>
                    }/>
                    }
                </Box>
                <Box onClick={send} bgcolor={'primary.main'} flex={'0 0 200px'} width={'100%'} overflow={'hidden'}>
                    <div style={{textAlign: 'center', marginTop: '8px'}}><strong>Send</strong></div>
                </Box>
            </Box>
        </Box>
        <Box flex={'1'} width={'100%'}>
            <Box display={'flex'} flexDirection="row" height={'100%'} width={'100%'}>
                <Box flex={'1'} borderRight={1} borderColor={'divider'} overflow={'scroll'}>
                    <Box display={'flex'} flexDirection="column" height={'100%'} width={'100%'}>
                        <Box flex={'0 0 20px'}>
                            <Typography color="text.secondary" margin={'5px 10px'}>
                                Request
                            </Typography>
                        </Box>
                        <Box flex={'1 1 0'} width={'100%'} overflow={'scroll'}>
                            <GRPCRequestEditor initValue={rawBody} valueChanged={changeRawBody}/>
                        </Box>
                        <Box flex={'0'}>
                            {/* TODO Movable */}
                        </Box>
                        <Box flex={'0 0 200px'} width={'100%'}>
                            <Box display={'flex'} flexDirection="column" height={'100%'} width={'100%'}>
                                <Box flex={'0 0 40px'}>

                                    {!controller.overrideGrpcMetadata &&
                                    <Typography color="text.secondary" margin={'5px 10px'}>
                                        metadata ... sharing in <span
                                        style={{textDecoration: 'underline'}}>{collection?.name}</span>
                                    </Typography>
                                    }
                                    {controller.overrideGrpcMetadata &&
                                    <Typography color="text.secondary" margin={'5px 10px'}>
                                        metadata ... override
                                    </Typography>
                                    }
                                </Box>
                                <Box flex={'1 1 0'} overflow={'scroll'}>
                                    <GRPCRequestEditor initValue={rawMetadata} valueChanged={changeMetadata}/>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>
                <Box flex={'0'}>
                    {/* TODO Movable */}
                </Box>
                <Box flex={'1'} overflow={'scroll'}>
                    <Box display={'flex'} flexDirection="column" height={'100%'} width={'100%'}>
                        <Box flex={'0 0 20px'}>
                            <Box display={'flex'} flexDirection="row" width={'100%'}>
                                <Box flex={'1'}>
                                    <Typography color="text.secondary" margin={'5px 10px'}>
                                        Response
                                    </Typography>
                                </Box>
                                <Box flex={'0 0 150px'} sx={{textAlign: 'right'}}>
                                    <Typography color="text.secondary" margin={'5px 10px'}>
                                        <BoxText value={responseTime}/>
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                        <Box flex={'0 0 0'}>
                            {responseError && <Alert severity="error" variant={"outlined"} style={{margin: '10px', wordBreak: "break-word"}}>
                                {responseError}
                            </Alert>}
                        </Box>
                        <Box flex={'1 1 0'} width={'100%'} overflow={'scroll'}>
                            <GRPCRequestEditor initValue={responseBody} valueChanged={() => {}}/>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    </Box>
}
