import React from 'react';
import '@coalbox/core/styles/editor.css'
import {CoalboxConfig, CoalboxWindow, Endpoint} from "@coalbox/core";

export const App: React.FC = () =>  {

  const [config, setConfig] = React.useState<CoalboxConfig>({
    workspaces: [{
      id: "0",
      name: 'gRPC box',
      collections: [
        {
          id: '0',
          name: 'helloworld',
          type: "gRPCProtoSet",
          endpoint: {
            url: "http://localhost:50010",
            serverCertificate: false,
          },
          filePaths: [
              '/Users/takuya.hayashi/Documents/dev/howyi/coalbox/examples/proto/helloworld.proto'
          ],
          importPaths: [],
          metadata: '',
        }
      ],
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
