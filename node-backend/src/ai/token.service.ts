import { encoding_for_model, TiktokenModel } from "tiktoken";
import { ITokenService } from "./interfaces/ITokenService.js";

export class TokenService implements ITokenService {
    countTokens(text: string, modelName: string): number {
        try {
            const enc = encoding_for_model(modelName as TiktokenModel);
            try {
                const tokens = enc.encode(text);
                return tokens.length;
            } finally {
                enc.free();
            }
        } catch {
            // Fallback to a common encoding if model specific fails
            // cl100k_base is used by gpt-4, gpt-3.5-turbo, text-embedding-3-small/large
            try {
                const enc = encoding_for_model("gpt-4"); 
                try {
                    const tokens = enc.encode(text);
                    return tokens.length;
                } finally {
                    enc.free();
                }
            } catch (fallbackError) {
                console.error("Token counting failed even with fallback", fallbackError);
                return 0; // Or estimate length / 4
            }
        }
    }
}

export const tokenService = new TokenService();
