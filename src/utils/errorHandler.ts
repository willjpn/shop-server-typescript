export class CustomError extends Error {
    private status: number;

    constructor(message: string | undefined, errorCode = 500) {
        super(message)
        this.status = errorCode
    }
}
