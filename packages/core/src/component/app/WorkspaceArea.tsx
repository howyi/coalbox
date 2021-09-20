import React from 'react';

type Props = {
    workspaceName: string
}

export const WorkspaceArea: React.VFC<Props> = (props) => {
    return <div style={{width: '100%'}}>
        <h4 style={{textAlign: 'center', marginTop: '8px'}}>{props.workspaceName}</h4>
    </div>
}
