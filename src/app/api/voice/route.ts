/**
 * Voice API Route
 *
 * Generates speech from text using ElevenLabs API.
 */

import {NextResponse} from 'next/server';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || '';
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

// ElevenLabs Male Voice IDs
const VOICES = {
    JUDGE: 'CwhRBWXzGAHq8TQ4Fs17',
    ATTORNEY: 'N2lVS1w4EtoT3dr4eOWO',
    WITNESS: 'bIHbv24MWmeRgasZH58o',
};

// Map speaker names to voice roles
function getVoiceId(speaker: string): string {
    const s = speaker.toUpperCase();

    // Judges
    if (s.includes('JUDGE') || s.includes('COURT')) {
        return VOICES.JUDGE;
    }

    // Attorneys (MR. prefix typically)
    if (s.includes('MR.') || s.includes('ATTORNEY') || s.includes('COUNSEL')) {
        return VOICES.ATTORNEY;
    }

    // Witnesses/Defendants - everyone else
    return VOICES.WITNESS;
}

interface VoiceRequest {
    text: string;
    speaker?: string;
}

/**
 * POST /api/voice
 *
 * Generates speech audio from text.
 *
 * Body:
 * - text: string - Text to speak
 * - speaker: string - Speaker name (optional, for voice selection)
 *
 * Returns: Audio stream (audio/mpeg)
 */
export async function POST(req: Request): Promise<NextResponse> {
    if (!ELEVENLABS_API_KEY) {
        return NextResponse.json(
            {error: 'ElevenLabs API key not configured'},
            {status: 500}
        );
    }

    try {
        const body: VoiceRequest = await req.json();
        const {text, speaker = 'default'} = body;

        if (!text || text.trim().length === 0) {
            return NextResponse.json(
                {error: 'Text is required'},
                {status: 400}
            );
        }

        // Get voice ID for speaker
        const voiceId = getVoiceId(speaker);

        // Call ElevenLabs API
        const response = await fetch(
            `${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}`,
            {
                method: 'POST',
                headers: {
                    'xi-api-key': ELEVENLABS_API_KEY,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text,
                    model_id: 'eleven_turbo_v2_5',
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75,
                        style: 0.3,
                        use_speaker_boost: true,
                    },
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('ElevenLabs API error:', response.status, errorText);
            return NextResponse.json(
                {error: `ElevenLabs API error: ${response.status}`},
                {status: response.status}
            );
        }

        // Stream the audio back
        const audioBuffer = await response.arrayBuffer();

        console.log(`Voice generated: speaker="${speaker}" -> voiceId="${voiceId}"`);

        return new NextResponse(audioBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Length': audioBuffer.byteLength.toString(),
                'Cache-Control': 'no-store, no-cache, must-revalidate',
            },
        });
    } catch (error) {
        console.error('Voice generation error:', error);
        return NextResponse.json(
            {error: 'Failed to generate voice'},
            {status: 500}
        );
    }
}
