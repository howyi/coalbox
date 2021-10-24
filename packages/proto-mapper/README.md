# `@coalbox/proto-mapper`

## install
`npm i @coalbox/proto-mapper`

## Sample usage

## `sample.proto`
```protobuf
syntax = "proto3";

/**
 * Coalbox Check
 */
package sample;

option go_package = "github.com/howyi/coalbox";

import "github.com/envoyproxy/protoc-gen-validate/validate/validate.proto";
import "google/api/annotations.proto";

/** Sample service comment
 */
service ProtoMapperService {
    rpc Search(SearchRequest) returns (SearchResponse) {
        option (google.api.http) = {
            post: "/v1/search",
            body: "*"
        };
    }
}


/* Sample message comment
 */
message SearchRequest {
    string query = 1 [(validate.rules).string = {min_len: 1, max_len: 50}]; // Search Text
    int32 page_number = 2;  // page number
}

message SearchResponse {
    repeated string ids = 1;
}
```

## code

### Load from files
```typescript
import {ProtoSet} from "@coalbox/proto-mapper";

const protoSet = await ProtoSet.loadFromPaths([
    './sample.proto',
], [
    'node_modules/protobufjs',
    '/usr/local/include'
])
```

### See options and comments
```typescript
const file = oProtoSet.files['../../examples/proto/sample.proto']
// file.extra.options  =>  {"go_package": "github.com/howyi/coalbox"}

const service =  protoSet.files['./sample.proto'].services['sample.ProtoMapperService']
// service.extra.comment  =>  Sample service comment

const method = service.methods['Search']
// method.comment  =>  null
// method.options  =>  {"(google.api.http).body": "*", "(google.api.http).post": "/v1/search"}

const message = protoSet.files['./sample.proto'].types['sample.SearchRequest']
// msg.extra.comment  =>  Sample message comment
// msg.extra.options  =>  {"(validate.rules).string.max_len": 50, "(validate.rules).string.min_len": 1}
```

### Serialize and deserialize method
```typescript
const serializedRequest = method.request.serialize({query: 'test', pageNumber: 1})
// =>  Buffer

const deserializedRequest =  method.request.deserialize(serialized)
// => {query: 'test', pageNumber: 1}
```
