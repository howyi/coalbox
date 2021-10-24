import React from 'react';
import '@coalbox/core/styles/editor.css'
import {CoalboxConfig, CoalboxWindow} from "@coalbox/core";

export const App: React.FC = () =>  {

  const [config, setConfig] = React.useState<CoalboxConfig>({
    workspaces: [{
      id: "0",
      name: 'gRPC box',
      collections: [],
      tabs: [],
      instances: []
    }],
    currentWorkspaceId: "0"
  })

  return (
      <CoalboxWindow
          initConfig={config}
          changeWorkspace={true}
          addCollection={true}
          controller={{}}
      />
  );
}

export default App;
