/**
 * Tour Step Data
 *
 * Guided tour definitions for the Co-Counsel demo.
 */

import type {TourStep} from '@/types';

/**
 * Tour steps for the interactive guide.
 */
export const TOUR_STEPS: TourStep[] = [
    {
        target: 'court-feed',
        title: 'Live Court Transcript',
        description: 'This panel displays the real-time courtroom transcript. Each line of testimony appears here as the trial progresses. Click any line to jump to that moment.',
        position: 'right',
    },
    {
        target: 'left-lane',
        title: 'Qdrant Cloud Inference',
        description: 'This lane shows the AI analysis pipeline using QCI. Embeddings are generated directly on the database cluster, eliminating network hops for faster response times.',
        position: 'left',
    },
    {
        target: 'right-lane',
        title: 'Comparison Lane',
        description: 'This lane runs the same analysis using a different embedding method (Jina Cloud or Local). Compare the timing metrics to see the performance difference.',
        position: 'left',
    },
    {
        target: 'performance-bar',
        title: 'Performance Comparison',
        description: 'See the real-time performance difference between the two approaches. The winner and time saved are displayed here after each analysis.',
        position: 'top',
    },
    {
        target: 'controls',
        title: 'Playback Controls',
        description: 'Control the trial playback here. Press Play to auto-advance through testimony, or use the arrows to step through manually. Press Space to play/pause.',
        position: 'top',
    },
];

/**
 * Gets a tour step by index.
 */
export function getTourStep(index: number): TourStep | null {
    return TOUR_STEPS[index] || null;
}

/**
 * Gets the total number of tour steps.
 */
export function getTourStepCount(): number {
    return TOUR_STEPS.length;
}

/**
 * Checks if an index is a valid tour step.
 */
export function isValidTourStep(index: number): boolean {
    return index >= 0 && index < TOUR_STEPS.length;
}
