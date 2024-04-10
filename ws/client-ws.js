const Ws = require('ws');
const protobuf = require('protobufjs');
const crypto = require('crypto');

const protoFilePath = './ws/definition-ws.proto';
const wsConnection = new Ws('ws://localhost:3030');
let WsMessage;

const getWsMessage = (payload) => {
  const error = WsMessage.verify(payload);
  if (error) {
    throw new Error(error);
  }

  const wsMessage = WsMessage.create(payload);
  return WsMessage.encode(wsMessage).finish();
};

const GetAnalysis = () =>  new Promise((resolve, reject) => {
  const id = crypto.createHash('md5').update(`${Math.random()}`).digest('hex');

  wsConnection.send(getWsMessage({
    messageId: id,
    getAnalysisRequest: { reqData: 'analysis req data' },
  }));

  wsConnection.on('message', (data) => {
    const response = WsMessage.decode(data);

    if (response.messageId === id) {
      resolve(response);
    }
  });
});

const GetEvaluations = () => new Promise((resolve, reject) => {
  const id = crypto.createHash('md5').update(`${Math.random()}`).digest('hex');
  const responses = [];

  wsConnection.send(getWsMessage({
    messageId: id,
    getEvaluationsRequest: { reqData: 'evaluations req data' },
  }));

  wsConnection.on('message', (data) => {
    const response = WsMessage.decode(data);

    if (response.messageId === id) {
      if (response.getEvaluationsReponse) {
        responses.push(response.getEvaluationsReponse);
      }

      if (response.getEvaluationsEndResponse) {
        resolve(responses)
      }
    }
  });
});

const run = async () => {
  const response = await GetAnalysis();
  console.log(response);

  const streamResponse = await GetEvaluations();
  console.log(streamResponse);
};

wsConnection.on('open', () => {
  wsConnection.on('error', (error) => { console.log(error); });

  protobuf.load(protoFilePath, (error, root) => {
    if (error) {
      throw error;
    }

    WsMessage = root.lookupType("WsMessage");

    run();
  });
});
