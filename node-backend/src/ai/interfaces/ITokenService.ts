export interface ITokenService {
    countTokens(text: string, modelName: string): number;
}
