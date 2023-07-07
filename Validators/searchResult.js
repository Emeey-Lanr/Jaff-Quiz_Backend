const playerModel = require("../models/Playersmodel")

exports.collectionFunction = async (quizId) => {
    try {
        const player = await playerModel.find({ quizId })
        if (player.length < 1) {
            return new Error("no result found")
        }
        const gamePlayed = player.filter((details) => details.result.length > 0)
        if (gamePlayed.length < 1) {
            return new Error("no result found")
        }
        return gamePlayed
    } catch (error) {
        return new Error("an error occured")
    }
}