import React from 'react';
import TreeView from '@mui/lab/TreeView';
import {CollectionList} from "./list/CollectionList";
import {useCoalbox} from "../../hooks/useCoalbox";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";

type Props = {
}

export const ListArea: React.VFC<Props> = (props) => {
    const {currentWorkspace} = useCoalbox()

    return <TreeView
        aria-label="list"
        defaultExpanded={[]}
        defaultCollapseIcon={<ArrowDropDownIcon />}
        defaultExpandIcon={<ArrowRightIcon />}
        defaultEndIcon={<div style={{ width: 24 }} />}
    >
        {currentWorkspace.collections.map((p) =>
            <CollectionList config={p} key={p.id} />
        )}
    </TreeView>
}
