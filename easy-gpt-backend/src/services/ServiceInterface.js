class ServiceInterface {
    async promptText(prompt) {
        throw new Error('Not implemented');
    }

    async promptStreamText(prompt, res) {
        throw new Error('Not implemented');
    }
}

module.exports = ServiceInterface;