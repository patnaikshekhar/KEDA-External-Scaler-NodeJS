const MongoClient = require('mongodb').MongoClient
const grpc = require('grpc')

const scaledObjects = {}

function New(request, callback) {
    console.log('In New', request)
    let errorMessage
    if ('metadata' in request.request) {

    } else {
        console.log('Here')
        errorMessage = 'No Metadata present'
    }

    if (errorMessage) {
        callback({
            code: 400,
            message: errorMessage,
            status: grpc.status.INVALID_ARGUMENT
        })
    } else {
        callback(null, {})
    }
    
}

function IsActive() {

}

function GetMetricSpec() {

}

function GetMetrics() {

}

function Close() {

}

module.exports = {
    New,
    IsActive,
    GetMetricSpec,
    GetMetrics,
    Close
}