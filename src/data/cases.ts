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
            {s: 'MR. BOIES (GOV)', t: 'Did you ever have a strategy to eliminate competitors in the browser market?'},
            {s: 'BILL GATES', t: "I... I don't recall using that specific language in any meeting."},
            {s: 'MR. BOIES (GOV)', t: 'Let me show you Exhibit 334. Do you recognize this email?'},
            {s: 'BILL GATES', t: 'I write thousands of emails. I cannot recall each one.'},
            {s: 'MR. BOIES (GOV)', t: "It says 'We need to cut off Netscape's air supply.' Did you write this?"},
            {s: 'BILL GATES', t: 'I would need to see the full context of that communication.'},
            {s: 'MR. BOIES (GOV)', t: "Did you refer to the June 1995 meeting with Netscape as a 'visit from the Godfather'?"},
            {s: 'BILL GATES', t: 'I did not attend that meeting personally.'},
            {s: 'MR. BOIES (GOV)', t: 'But you were briefed on its purpose, were you not?'},
            {s: 'BILL GATES', t: 'I receive many briefings. That was years ago.'},
            {s: 'MR. BOIES (GOV)', t: 'Did Microsoft offer to divide the browser market with Netscape?'},
            {s: 'BILL GATES', t: 'That would be illegal, so no.'},
            {s: 'MR. BOIES (GOV)', t: 'Exhibit 347. Your VP of platforms wrote you must control the browser to control the platform. Agree?'},
            {s: 'BILL GATES', t: 'The browser is part of the operating system. Integration benefits users.'},
            {s: 'MR. BOIES (GOV)', t: "Why did Microsoft threaten to cancel Apple's Mac Office license?"},
            {s: 'BILL GATES', t: 'I am not aware of any such threat being made.'},
            {s: 'MR. BOIES (GOV)', t: 'Let me show you Exhibit 358. An email to Steve Jobs dated August 1997.'},
            {s: 'BILL GATES', t: 'We had many business discussions with Apple about licensing.'},
            {s: 'MR. BOIES (GOV)', t: "It says: 'Make IE default or we cancel Mac Office.' How do you explain this?"},
            {s: 'BILL GATES', t: 'I would characterize that as a negotiating position, not a threat.'},
            {s: 'MR. BOIES (GOV)', t: 'Did Apple make Internet Explorer the default browser shortly after?'},
            {s: 'BILL GATES', t: 'Apple made its own business decisions.'},
            {s: 'JUDGE JACKSON', t: 'Mr. Gates, please answer the question directly.'},
            {s: 'BILL GATES', t: 'Yes, I believe they did change the default browser.'},
            {s: 'MR. BOIES (GOV)', t: 'Did you instruct employees to make Windows incompatible with Java?'},
            {s: 'BILL GATES', t: 'We developed our own implementation of Java that worked better on Windows.'},
            {s: 'MR. BOIES (GOV)', t: 'Sun Microsystems says you deliberately broke Java compatibility. True?'},
            {s: 'BILL GATES', t: 'Sun is a competitor. They have their own agenda.'},
            {s: 'MR. BOIES (GOV)', t: 'No further questions at this time, Your Honor.'},
            {s: 'JUDGE JACKSON', t: "We'll take a fifteen minute recess."},
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
            {s: 'MR. BERKOWITZ', t: 'You booked ten years of projected profits on the first day of a contract?'},
            {s: 'JEFF SKILLING', t: 'When you have a long-term contract, that is how mark-to-market works.'},
            {s: 'MR. BERKOWITZ', t: 'And if those profits never materialized, what happened?'},
            {s: 'JEFF SKILLING', t: 'Adjustments would be made in subsequent quarters.'},
            {s: 'MR. BERKOWITZ', t: 'Tell us about the Raptor vehicles. Were they designed to hide debt from shareholders?'},
            {s: 'JEFF SKILLING', t: 'They were legitimate hedging instruments approved by our auditors.'},
            {s: 'MR. BERKOWITZ', t: 'Arthur Andersen approved them, and they were later convicted of obstruction.'},
            {s: 'MR. PETROCELLI (DEF)', t: 'Objection. That conviction was overturned by the Supreme Court.'},
            {s: 'THE COURT', t: "Sustained. The jury will disregard the reference to Arthur Andersen's conviction."},
            {s: 'MR. BERKOWITZ', t: 'Mr. Skilling, the Raptors were capitalized entirely with Enron stock, correct?'},
            {s: 'JEFF SKILLING', t: 'That was one component of the structure.'},
            {s: 'MR. BERKOWITZ', t: 'So when Enron stock fell, the hedges became worthless?'},
            {s: 'JEFF SKILLING', t: 'In hindsight, the structures had weaknesses.'},
            {s: 'MR. BERKOWITZ', t: 'Did Enron traders manipulate the California energy market?'},
            {s: 'JEFF SKILLING', t: 'The market was flawed. We simply traded within its rules.'},
            {s: 'MR. BERKOWITZ', t: 'Trading strategies called Death Star, Fat Boy, Get Shorty - those sound legitimate?'},
            {s: 'JEFF SKILLING', t: 'Traders give colorful names. I was not involved in day-to-day trading.'},
            {s: 'MR. BERKOWITZ', t: 'Did you sell $60 million in Enron stock while telling employees to buy?'},
            {s: 'JEFF SKILLING', t: 'I sold stock for personal diversification, as is common for executives.'},
            {s: 'MR. BERKOWITZ', t: 'In the months before bankruptcy, while the stock was collapsing?'},
            {s: 'JEFF SKILLING', t: 'I had no knowledge of any impending problems at that time.'},
            {s: 'MR. BERKOWITZ', t: 'You resigned suddenly in August 2001. Why?'},
            {s: 'JEFF SKILLING', t: 'Personal reasons. Family matters required my attention.'},
            {s: 'MR. BERKOWITZ', t: 'Three months before the largest bankruptcy in American history?'},
            {s: 'JEFF SKILLING', t: 'I could not have predicted what would happen.'},
            {s: 'MR. BERKOWITZ', t: 'Mr. Fastow testified you knew about the hidden losses. Is he lying?'},
            {s: 'JEFF SKILLING', t: 'Andrew has every incentive to implicate others to reduce his sentence.'},
            {s: 'MR. BERKOWITZ', t: 'He received ten years in prison. You call that an incentive?'},
            {s: 'JEFF SKILLING', t: 'It could have been much worse without his cooperation deal.'},
            {s: 'MR. BERKOWITZ', t: 'No further questions.'},
        ],
    },
    kitzmiller: {
        title: 'Kitzmiller v. Dover',
        color: 'purple',
        script: [
            {s: 'THE COURT', t: 'Mr. Rothschild, you may begin your cross-examination.'},
            {s: 'MR. ROTHSCHILD', t: 'Dr. Behe, you testified that intelligent design is a scientific theory.'},
            {s: 'MICHAEL BEHE', t: 'Yes, it makes claims that can be tested.'},
            {s: 'MR. ROTHSCHILD', t: 'Has intelligent design been published in peer-reviewed scientific journals?'},
            {s: 'MICHAEL BEHE', t: 'The scientific establishment is hostile to new ideas.'},
            {s: 'MR. ROTHSCHILD', t: 'Please answer the question. Has it been published in peer-reviewed journals?'},
            {s: 'MICHAEL BEHE', t: 'Not in the traditional sense, no.'},
            {s: 'MR. ROTHSCHILD', t: 'You claim the bacterial flagellum is irreducibly complex.'},
            {s: 'MICHAEL BEHE', t: 'Yes. All forty parts must be present for it to function.'},
            {s: 'MR. ROTHSCHILD', t: 'Are you aware of the Type III secretion system?'},
            {s: 'MICHAEL BEHE', t: 'I am aware of it.'},
            {s: 'MR. ROTHSCHILD', t: 'It uses ten proteins from the flagellum and has a different function.'},
            {s: 'MICHAEL BEHE', t: 'That does not explain how the flagellum itself evolved.'},
            {s: 'MR. ROTHSCHILD', t: "Let's look at your book 'Darwin's Black Box.' You define science broadly."},
            {s: 'MICHAEL BEHE', t: 'Science should follow the evidence wherever it leads.'},
            {s: 'MR. ROTHSCHILD', t: 'Under your definition, would astrology qualify as science?'},
            {s: 'MICHAEL BEHE', t: 'I think it would, yes.'},
            {s: 'MR. ROTHSCHILD', t: "Let's turn to 'Of Pandas and People.' Look at page 99."},
            {s: 'MR. MUISE (DEF)', t: "Objection, Dr. Behe didn't write that book."},
            {s: 'THE COURT', t: 'He testified as an expert supporting its use. Overruled.'},
            {s: 'MR. ROTHSCHILD', t: "It says: 'Intelligent design means life began abruptly through an intelligent agency.'"},
            {s: 'MICHAEL BEHE', t: 'That is one formulation of the concept.'},
            {s: 'MR. ROTHSCHILD', t: "In earlier drafts, the word 'creationism' was used instead of 'intelligent design.'"},
            {s: 'MICHAEL BEHE', t: 'I was not involved in writing those drafts.'},
            {s: 'MR. ROTHSCHILD', t: "They even misspelled it as 'cdesign proponentsists' when doing find-and-replace."},
            {s: 'THE COURT', t: 'I note that for the record.'},
            {s: 'MR. ROTHSCHILD', t: 'Dr. Behe, can intelligent design make any testable predictions?'},
            {s: 'MICHAEL BEHE', t: 'It predicts we will find complex systems that cannot be explained by Darwinism.'},
            {s: 'MR. ROTHSCHILD', t: 'How would you test that? What experiment could disprove intelligent design?'},
            {s: 'MICHAEL BEHE', t: 'If we found a detailed, testable pathway for complex systems.'},
            {s: 'MR. ROTHSCHILD', t: 'In ten years since your book, has no such pathway been found?'},
            {s: 'MICHAEL BEHE', t: 'None that I find convincing.'},
            {s: 'MR. ROTHSCHILD', t: "You've set the bar so high that nothing would convince you, haven't you?"},
            {s: 'MICHAEL BEHE', t: "I'm simply asking for rigorous scientific evidence."},
            {s: 'MR. ROTHSCHILD', t: 'No further questions, Your Honor.'},
            {s: 'THE COURT', t: "Thank you. We'll adjourn until tomorrow morning at nine."},
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
