// @ts-ignore - installed in production
import { SpeechClient } from '@google-cloud/speech';
import { env } from '../config/env.js';

// Initialize Speech-to-Text client with API key
const client = new SpeechClient({
  apiKey: env.GOOGLE_CLOUD_API_KEY,
});

/**
 * Service for transcribing audio using Google Cloud Speech-to-Text API
 */
export class SpeechService {
  /**
   * Transcribes audio buffer to text
   * @param audioBuffer - Audio file as Buffer
   * @param mimeType - MIME type of the audio (e.g., 'audio/ogg', 'audio/mp3')
   * @returns Transcribed text
   */
  async transcribeAudio(audioBuffer: Buffer, mimeType: string): Promise<string> {
    try {
      console.log('[SPEECH-TO-TEXT] Starting transcription...');
      console.log('[SPEECH-TO-TEXT] Audio size:', audioBuffer.length, 'bytes');
      console.log('[SPEECH-TO-TEXT] MIME type:', mimeType);

      // Convert buffer to base64
      const audioBase64 = audioBuffer.toString('base64');

      // Determine encoding based on MIME type
      let encoding: any = 'OGG_OPUS'; // Telegram voice messages default
      if (mimeType.includes('mp3')) {
        encoding = 'MP3';
      } else if (mimeType.includes('wav')) {
        encoding = 'LINEAR16';
      } else if (mimeType.includes('flac')) {
        encoding = 'FLAC';
      }

      const audio = {
        content: audioBase64,
      };

      const config = {
        encoding,
        sampleRateHertz: 48000, // Telegram voice messages use 48kHz
        languageCode: 'ru-RU', // Russian language
        enableAutomaticPunctuation: true, // Add punctuation automatically
        model: 'default', // Can use 'latest_long' for audio > 1 minute
      };

      const request = {
        audio,
        config,
      };

      console.log('[SPEECH-TO-TEXT] Calling Google Speech-to-Text API...');
      console.log('[SPEECH-TO-TEXT] Config:', {
        encoding,
        sampleRateHertz: config.sampleRateHertz,
        languageCode: config.languageCode,
      });

      const [response] = await client.recognize(request);

      console.log('[SPEECH-TO-TEXT] API response received');
      console.log('[SPEECH-TO-TEXT] Results count:', response.results?.length || 0);

      // Extract transcription from response
      const transcription =
        response.results
          ?.map((result: any) => result.alternatives?.[0]?.transcript)
          .filter(Boolean)
          .join(' ') || '';

      console.log('[SPEECH-TO-TEXT] Transcription result:', transcription);

      if (!transcription || transcription.trim().length === 0) {
        throw new Error('No transcription result returned from Speech-to-Text API');
      }

      return transcription.trim();
    } catch (error) {
      console.error('[SPEECH-TO-TEXT] Error during transcription:', error);
      throw error;
    }
  }
}

export const speechService = new SpeechService();
