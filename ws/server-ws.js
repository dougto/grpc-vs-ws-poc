const Ws = require('ws');
const protobuf = require('protobufjs');

const protoFilePath = './ws/definition-ws.proto';
const wsServer = new Ws.Server({ port: 3030 });

let WsMessage;

const getWsMessage = (payload) => {
  const error = WsMessage.verify(payload);
  if (error) {
    throw new Error(error);
  }

  const wsMessage = WsMessage.create(payload);
  return WsMessage.encode(wsMessage).finish();
};

const GetAnalysis = (request) => {
  // request data
  console.log('GetAnalysis request:', request);

  // return data
  return { analysisData: 'some response' };
};

const GetAndSendEvaluations = (request, ws) => {
  // request data
  console.log(request.getEvaluationsRequest);

  // stream 10 messages to server
  for (let i = 0; i < 10; i++) {
    const response = { evaluationData: 'evaluation data ' + i };

    const buffer = getWsMessage({
      messageId: request.messageId,
      getEvaluationsReponse: response,
    });

    ws.send(buffer);
  }

  const endBuffer = getWsMessage({
    messageId: request.messageId,
    getEvaluationsEndResponse: {},
  });

  ws.send(endBuffer);
};

protobuf.load(protoFilePath, (error, root) => {
  if (error) {
    throw error;
  }

  WsMessage = root.lookupType("WsMessage");

  wsServer.on('connection', (ws) => {
    ws.on('message', (data) => {
      const decodedMessage = WsMessage.decode(data);

      if (decodedMessage.getAnalysisRequest) {
        const response = GetAnalysis(decodedMessage.getAnalysisRequest);

        const buffer = getWsMessage({
          messageId: decodedMessage.messageId,
          getAnalysisResponse: response,
        });

        ws.send(buffer);
      } else if (decodedMessage.getAnalysisResponse) {
        // ignore getAnalysisResponse or let client know the server doesn't accept this message
      } else if (decodedMessage.getEvaluationsRequest) {
        GetAndSendEvaluations(decodedMessage, ws);
      } else if (decodedMessage.getEvaluationsReponse) {
        // ignore getEvaluationsReponse or let client know the server doesn't accept this message
      }
    });
  });
});
