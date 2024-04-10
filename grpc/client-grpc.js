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

const stub = new SampleService('localhost:3030', grpc.credentials.createInsecure());

const GetAnalysis = () =>  new Promise((resolve, reject) => {
  stub.GetAnalysis({ req_data: 'analysis req data' }, (error, data) => {
    if (error) {
      reject(error);
      return;
    }

    resolve(data);
  });
});

const GetEvaluations = () => new Promise((resolve, reject) => {
  const call = stub.GetEvaluations({ req_data: 'evaluations req data' });

  const responses = [];

  // read incoming messages
  call.on('data', function(request) {
    responses.push(request);
  });

  // called when client stops streaming messages
  call.on('end', () => {
    resolve(responses);
  });
});

const run = async () => {
  const response = await GetAnalysis();
  console.log(response);

  const streamResponse = await GetEvaluations();
  console.log(streamResponse);
};

run();
