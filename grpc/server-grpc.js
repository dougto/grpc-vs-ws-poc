const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const protoFilePath = './grpc/definition-grpc.proto';

const packageDefinition = protoLoader.loadSync(
  protoFilePath,
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  }
);

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const { SampleService } = protoDescriptor;
const Server = new grpc.Server();

const GetAnalysis = (call, callback) => {
  // request data
  console.log('GetAnalysis request:', call.request);

  // return data
  callback(null, { analysis_data: 'some response' });
};

const GetEvaluations = (call) => {
  // request data
  console.log(call.request);

  // stream 10 messages to server
  for (let i = 0; i < 10; i++) {
      call.write({ evaluation_data: 'evaluation data ' + i });
  }

  // end rpc
  call.end()
};

Server.addService(SampleService.service, {
  GetAnalysis,
  GetEvaluations,
});

Server.bindAsync('localhost:3030', grpc.ServerCredentials.createInsecure(), () => {
  console.log('grpc server started');
});
