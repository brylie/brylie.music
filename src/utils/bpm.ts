/**
 * Musical timing calculations based on BPM (Beats Per Minute)
 */

/**
 * Timing constants
 */
const MILLISECONDS_PER_MINUTE = 60000;
const DOTTED_NOTE_MULTIPLIER = 1.5;
const TRIPLET_NOTE_MULTIPLIER = 2 / 3;

/**
 * Subdivision constants representing note durations.
 * Values represent how many of that note fit in a whole note.
 * For example, 4 quarter notes = 1 whole note.
 */
export const SUBDIVISIONS = {
	WHOLE: 1,
	HALF: 2,
	QUARTER: 4,
	EIGHTH: 8,
	SIXTEENTH: 16,
	THIRTY_SECOND: 32,
} as const;

/**
 * Result of calculateAllSubdivisions containing durations for all note types
 */
export interface SubdivisionDurations {
	// Standard notes
	whole: number;
	half: number;
	quarter: number;
	eighth: number;
	sixteenth: number;
	thirtySecond: number;
	
	// Dotted variations (1.5x duration)
	dottedWhole: number;
	dottedHalf: number;
	dottedQuarter: number;
	dottedEighth: number;
	dottedSixteenth: number;
	// Note: Dotted 32nd omitted as it's extremely rare in practical musical contexts
	
	// Triplet variations (2/3 duration)
	wholeTriplet: number;
	halfTriplet: number;
	quarterTriplet: number;
	eighthTriplet: number;
	sixteenthTriplet: number;
	// Note: 32nd triplet omitted as it's extremely rare in practical musical contexts
}

/**
 * Calculate the duration of a musical note in milliseconds.
 * 
 * @param bpm - Beats per minute (tempo)
 * @param subdivision - Number representing the note subdivision (1=whole, 4=quarter, etc.)
 * @returns Duration in milliseconds
 * 
 * @example
 * // Calculate quarter note duration at 120 BPM
 * calculateNoteLength(120, SUBDIVISIONS.QUARTER) // returns 500
 */
export function calculateNoteLength(bpm: number, subdivision: number): number {
	if (bpm <= 0) {
		throw new Error('BPM must be greater than 0');
	}
	if (subdivision <= 0) {
		throw new Error('Subdivision must be greater than 0');
	}
	
	// Calculate milliseconds per beat (quarter note)
	const msPerBeat = MILLISECONDS_PER_MINUTE / bpm;
	
	// Calculate milliseconds for the given subdivision
	// A quarter note has subdivision=4, so we divide by 4/4 = 1
	// An eighth note has subdivision=8, so we divide by 8/4 = 2
	return msPerBeat * (SUBDIVISIONS.QUARTER / subdivision);
}

/**
 * Calculate the duration of a dotted note (1.5x the original duration).
 * 
 * @param noteLength - Original note duration in milliseconds
 * @returns Dotted note duration in milliseconds
 * 
 * @example
 * calculateDotted(500) // returns 750
 */
export function calculateDotted(noteLength: number): number {
	return noteLength * DOTTED_NOTE_MULTIPLIER;
}

/**
 * Calculate the duration of a triplet note (2/3x the original duration).
 * 
 * @param noteLength - Original note duration in milliseconds
 * @returns Triplet note duration in milliseconds
 * 
 * @example
 * calculateTriplet(500) // returns 333.33...
 */
export function calculateTriplet(noteLength: number): number {
	return noteLength * TRIPLET_NOTE_MULTIPLIER;
}

/**
 * Calculate all standard note subdivisions and variations for a given BPM.
 * 
 * @param bpm - Beats per minute (tempo)
 * @returns Object containing durations for all note types
 */
export function calculateAllSubdivisions(bpm: number): SubdivisionDurations {
	const whole = calculateNoteLength(bpm, SUBDIVISIONS.WHOLE);
	const half = calculateNoteLength(bpm, SUBDIVISIONS.HALF);
	const quarter = calculateNoteLength(bpm, SUBDIVISIONS.QUARTER);
	const eighth = calculateNoteLength(bpm, SUBDIVISIONS.EIGHTH);
	const sixteenth = calculateNoteLength(bpm, SUBDIVISIONS.SIXTEENTH);
	const thirtySecond = calculateNoteLength(bpm, SUBDIVISIONS.THIRTY_SECOND);

	return {
		// Standard notes
		whole,
		half,
		quarter,
		eighth,
		sixteenth,
		thirtySecond,
		
		// Dotted variations
		dottedWhole: calculateDotted(whole),
		dottedHalf: calculateDotted(half),
		dottedQuarter: calculateDotted(quarter),
		dottedEighth: calculateDotted(eighth),
		dottedSixteenth: calculateDotted(sixteenth),
		
		// Triplet variations
		wholeTriplet: calculateTriplet(whole),
		halfTriplet: calculateTriplet(half),
		quarterTriplet: calculateTriplet(quarter),
		eighthTriplet: calculateTriplet(eighth),
		sixteenthTriplet: calculateTriplet(sixteenth),
	};
}
