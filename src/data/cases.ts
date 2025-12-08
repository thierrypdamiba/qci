/**
 * Case Data
 *
 * Demo trial cases with their scripts for the Co-Counsel demo.
 */

import type {CasesMap, CaseId} from '@/types';

/**
 * Available demo cases with trial scripts.
 */
export const CASES: CasesMap = {
    msft: {
        title: 'US v. Microsoft',
        color: 'blue',
        script: [
            {s: 'JUDGE JACKSON', t: 'Mr. Boies, you may continue your cross-examination.'},
            {s: 'MR. BOIES (GOV)', t: 'Mr. Gates, you claim Microsoft welcomes competition.'},
            {s: 'BILL GATES', t: 'That is correct. We innovate for customers.'},
            {s: 'MR. BOIES (GOV)', t: 'Did you ever have a strategy to kill Netscape?'},
            {s: 'BILL GATES', t: "I... I don't recall using that language."},
            {s: 'MR. BOIES (GOV)', t: "Did you refer to the meeting as a 'visit from the Godfather'?"},
            {s: 'BILL GATES', t: 'I did not.'},
            {s: 'MR. BOIES (GOV)', t: 'Did you write that you must control the browser to control the platform?'},
            {s: 'BILL GATES', t: 'I write many memos.'},
        ],
    },
    enron: {
        title: 'US v. Skilling (Enron)',
        color: 'emerald',
        script: [
            {s: 'THE COURT', t: 'Mr. Berkowitz, you may proceed with the cross-examination.'},
            {s: 'MR. BERKOWITZ', t: "Mr. Skilling, let's discuss Enron's accounting practices."},
            {s: 'JEFF SKILLING', t: 'Our accounting was aggressive but fully compliant with GAAP.'},
            {s: 'MR. BERKOWITZ', t: 'Did you use mark-to-market accounting to book future profits immediately?'},
            {s: 'JEFF SKILLING', t: 'It is the industry standard for energy trading companies.'},
            {s: 'MR. BERKOWITZ', t: 'Tell us about the Raptor vehicles. Were they designed to hide debt from shareholders?'},
            {s: 'JEFF SKILLING', t: 'They were legitimate hedging instruments approved by our auditors.'},
            {s: 'MR. BERKOWITZ', t: 'Did Enron traders manipulate the California energy market?'},
            {s: 'JEFF SKILLING', t: 'The market was flawed. We simply traded within its rules.'},
            {s: 'MR. BERKOWITZ', t: 'Mr. Fastow testified you knew about the hidden losses. Is he lying?'},
            {s: 'JEFF SKILLING', t: 'Andrew has every incentive to implicate others.'},
        ],
    },
    kitzmiller: {
        title: 'Kitzmiller v. Dover',
        color: 'purple',
        script: [
            {s: 'MR. MUISE', t: "Dr. Behe, look at page 99 of 'Of Pandas and People'."},
            {s: 'MR. MUISE', t: "It says: 'Intelligent design means life began abruptly through an intelligent agency.'"},
            {s: 'MICHAEL BEHE', t: 'I think that\'s a way of saying this is a matter of disagreement.'},
            {s: 'MR. MUISE', t: "Dr. Padian testified that 'abrupt' means something different in geology."},
            {s: 'MR. ROTHSCHILD', t: "Objection, mischaracterizing Dr. Padian's testimony."},
            {s: 'THE COURT', t: 'In what sense?'},
            {s: 'MR. ROTHSCHILD', t: 'Dr. Padian referred to fossils, not the appearance of creatures.'},
            {s: 'THE COURT', t: 'If you\'re going to paraphrase Dr. Padian, you ought to be sure.'},
            {s: 'THE COURT', t: "I'll sustain the objection. You can rephrase."},
            {s: 'MR. MUISE', t: "Dr. Behe, do you see 'abrupt' as a concept in geological time?"},
            {s: 'MICHAEL BEHE', t: 'Yes. Pandas is speaking of the fossil record.'},
        ],
    },
};

/**
 * All available case IDs.
 */
export const CASE_IDS: CaseId[] = ['msft', 'enron', 'kitzmiller'];

/**
 * Gets a case by ID with fallback to Microsoft case.
 */
export function getCase(caseId: CaseId): (typeof CASES)[CaseId] {
    return CASES[caseId] || CASES.msft;
}

/**
 * Gets the title for a case.
 */
export function getCaseTitle(caseId: CaseId): string {
    return CASES[caseId]?.title || 'Unknown Case';
}

/**
 * Gets the color for a case.
 */
export function getCaseColor(caseId: CaseId): string {
    return CASES[caseId]?.color || 'blue';
}
