const grpc = require('grpc')
const protoLoader = require('@grpc/proto-loader')
const services = require('./services')

const packageDefinition = protoLoader.loadSync(
    './externalscaler.proto',
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    })

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition)

const server = new grpc.Server()

server.addService(protoDescriptor.externalscaler.ExternalScaler.service, services)

server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure())
server.start()