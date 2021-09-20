import * as React from 'react';
import TreeItem from '@mui/lab/TreeItem';
import {HttpRequestConfig} from "../../../types/config";
import {StyledTreeItem} from "./StyledTreeItem";
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';

type Props = {
    config: HttpRequestConfig
}
export const HttpRequestList: React.VFC<Props> = ({config}) => {

    return <StyledTreeItem nodeId={config.name} labelText={config.name} labelIcon={SettingsEthernetIcon}>
        🥺 未実装
    </StyledTreeItem>
}
