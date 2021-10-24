import {GreeterService, IGreeterServer} from "../gen/helloworld_grpc_pb";

import * as grpc from '@grpc/grpc-js'
import {HelloReply} from "../gen/helloworld_pb";

/**
 * Implements the SayHello RPC method.
 */
const sayHello: IGreeterServer['sayHello'] = (call, callback) => {
    const greeter = new HelloReply();
    greeter.setMessage('Hello ' + call.request.getName())
  callback(null, greeter);
}

/**
 * Starts an RPC server that receives requests for the Greeter service at the
 * sample server port
 */
function main() {
  const server = new grpc.Server();
  const greeterServer: Required<IGreeterServer> = {
      sayHello: sayHello
  }
  server.addService(GreeterService, greeterServer);
  server.bindAsync('localhost:50051', grpc.ServerCredentials.createInsecure(), () => {
      server.start();
      console.log('server start');
  });
}

main();
