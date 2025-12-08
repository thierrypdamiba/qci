/**
 * Legal Objection Definitions and Recommendations
 *
 * This module contains the mapping of objection types to their
 * recommendations and suggested courtroom scripts.
 */

import type {ObjectionType} from '@/types';

/**
 * Objection recommendation with script.
 */
export interface ObjectionInfo {
    recommendation: string;
    script: string;
}

/**
 * Mapping of objection types to recommendations and scripts.
 */
export const OBJECTION_RECOMMENDATIONS: Record<ObjectionType, ObjectionInfo> = {
    'HEARSAY': {
        recommendation: 'Recommend objection. Statement is out-of-court hearsay.',
        script: 'Objection, Your Honor. Hearsay. The witness has no personal knowledge of this statement.',
    },
    'LACK OF FOUNDATION': {
        recommendation: 'Recommend objection. Lacks sufficient foundation.',
        script: 'Objection. Lack of foundation. Counsel has not established the witness has personal knowledge.',
    },
    'ARGUMENTATIVE': {
        recommendation: 'Recommend objection. Question is argumentative.',
        script: 'Objection, argumentative. Counsel is badgering the witness.',
    },
    'SPECULATION': {
        recommendation: 'Recommend objection. Calls for speculation.',
        script: 'Objection. Calls for speculation. The witness cannot testify to matters outside personal knowledge.',
    },
    'ASSUMES FACTS': {
        recommendation: 'Recommend objection. Assumes facts not in evidence.',
        script: 'Objection. Assumes facts not in evidence.',
    },
    'MISCHARACTERIZATION': {
        recommendation: 'Recommend objection. Misstates prior testimony.',
        script: 'Objection, Your Honor. Counsel is mischaracterizing the prior testimony.',
    },
    'VAGUE': {
        recommendation: 'Recommend objection. Question is vague and ambiguous.',
        script: 'Objection. Vague and ambiguous. Could counsel please clarify the question?',
    },
    'IMPROPER OPINION': {
        recommendation: 'Recommend objection. Calls for improper opinion.',
        script: 'Objection. Calls for an expert opinion from a lay witness.',
    },
    'PREJUDICIAL': {
        recommendation: 'Recommend objection. Prejudicial value outweighs probative.',
        script: 'Objection, Your Honor. The prejudicial effect substantially outweighs any probative value.',
    },
    'LEADING': {
        recommendation: 'Recommend objection. Leading question on direct.',
        script: 'Objection. Leading. Counsel is suggesting the answer to the witness.',
    },
};

/**
 * Gets the recommendation info for an objection type.
 * Returns a fallback if the type is not recognized.
 */
export function getObjectionInfo(objectionType: string): ObjectionInfo {
    const info = OBJECTION_RECOMMENDATIONS[objectionType as ObjectionType];
    if (info) {
        return info;
    }

    // Fallback for unrecognized types
    return {
        recommendation: `Recommend objection: ${objectionType}`,
        script: `Objection, Your Honor. ${objectionType}.`,
    };
}

/**
 * Threshold score for recommending an objection.
 */
export const OBJECTION_THRESHOLD = 0.65;

/**
 * Checks if a score meets the objection threshold.
 */
export function meetsObjectionThreshold(score: number): boolean {
    return score >= OBJECTION_THRESHOLD;
}

/**
 * All valid objection types.
 */
export const ALL_OBJECTION_TYPES: ObjectionType[] = [
    'HEARSAY',
    'LACK OF FOUNDATION',
    'ARGUMENTATIVE',
    'SPECULATION',
    'ASSUMES FACTS',
    'MISCHARACTERIZATION',
    'VAGUE',
    'IMPROPER OPINION',
    'PREJUDICIAL',
    'LEADING',
];

/**
 * Validates if a string is a valid objection type.
 */
export function isValidObjectionType(type: string): type is ObjectionType {
    return ALL_OBJECTION_TYPES.includes(type as ObjectionType);
}
