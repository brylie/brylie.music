import { describe, it, expect } from 'vitest';
import {
	calculateNoteLength,
	calculateDotted,
	calculateTriplet,
	calculateAllSubdivisions,
	SUBDIVISIONS,
} from './bpmCalculator';

describe('calculateNoteLength', () => {
	it('calculates quarter note at 120 BPM correctly', () => {
		const result = calculateNoteLength(120, SUBDIVISIONS.QUARTER);
		expect(result).toBe(500);
	});

	it('calculates quarter note at 60 BPM correctly', () => {
		const result = calculateNoteLength(60, SUBDIVISIONS.QUARTER);
		expect(result).toBe(1000);
	});

	it('calculates eighth note at 120 BPM correctly', () => {
		const result = calculateNoteLength(120, SUBDIVISIONS.EIGHTH);
		expect(result).toBe(250);
	});

	it('calculates sixteenth note at 120 BPM correctly', () => {
		const result = calculateNoteLength(120, SUBDIVISIONS.SIXTEENTH);
		expect(result).toBe(125);
	});

	it('calculates whole note at 120 BPM correctly', () => {
		const result = calculateNoteLength(120, SUBDIVISIONS.WHOLE);
		expect(result).toBe(2000);
	});

	it('calculates half note at 120 BPM correctly', () => {
		const result = calculateNoteLength(120, SUBDIVISIONS.HALF);
		expect(result).toBe(1000);
	});

	it('handles high BPM (300) correctly', () => {
		const result = calculateNoteLength(300, SUBDIVISIONS.QUARTER);
		expect(result).toBe(200);
	});

	it('handles low BPM (40) correctly', () => {
		const result = calculateNoteLength(40, SUBDIVISIONS.QUARTER);
		expect(result).toBe(1500);
	});

	it('throws error for zero BPM', () => {
		expect(() => calculateNoteLength(0, SUBDIVISIONS.QUARTER)).toThrow(
			'BPM must be greater than 0',
		);
	});

	it('throws error for negative BPM', () => {
		expect(() => calculateNoteLength(-120, SUBDIVISIONS.QUARTER)).toThrow(
			'BPM must be greater than 0',
		);
	});

	it('throws error for zero subdivision', () => {
		expect(() => calculateNoteLength(120, 0)).toThrow(
			'Subdivision must be greater than 0',
		);
	});

	it('throws error for negative subdivision', () => {
		expect(() => calculateNoteLength(120, -4)).toThrow(
			'Subdivision must be greater than 0',
		);
	});
});

describe('calculateDotted', () => {
	it('calculates dotted quarter note correctly', () => {
		const quarter = 500;
		const dotted = calculateDotted(quarter);
		expect(dotted).toBe(750);
	});

	it('calculates dotted eighth note correctly', () => {
		const eighth = 250;
		const dotted = calculateDotted(eighth);
		expect(dotted).toBe(375);
	});

	it('multiplies by 1.5 correctly', () => {
		expect(calculateDotted(1000)).toBe(1500);
		expect(calculateDotted(200)).toBe(300);
	});
});

describe('calculateTriplet', () => {
	it('calculates quarter note triplet correctly', () => {
		const quarter = 500;
		const triplet = calculateTriplet(quarter);
		expect(triplet).toBeCloseTo(333.33, 1);
	});

	it('calculates eighth note triplet correctly', () => {
		const eighth = 250;
		const triplet = calculateTriplet(eighth);
		expect(triplet).toBeCloseTo(166.67, 1);
	});

	it('multiplies by 2/3 correctly', () => {
		expect(calculateTriplet(600)).toBeCloseTo(400, 1);
		expect(calculateTriplet(900)).toBeCloseTo(600, 1);
	});
});

describe('calculateAllSubdivisions', () => {
	it('calculates all subdivisions for 120 BPM', () => {
		const subdivisions = calculateAllSubdivisions(120);

		// Standard notes
		expect(subdivisions.whole).toBe(2000);
		expect(subdivisions.half).toBe(1000);
		expect(subdivisions.quarter).toBe(500);
		expect(subdivisions.eighth).toBe(250);
		expect(subdivisions.sixteenth).toBe(125);
		expect(subdivisions.thirtySecond).toBe(62.5);

		// Dotted variations
		expect(subdivisions.dottedWhole).toBe(3000);
		expect(subdivisions.dottedHalf).toBe(1500);
		expect(subdivisions.dottedQuarter).toBe(750);
		expect(subdivisions.dottedEighth).toBe(375);
		expect(subdivisions.dottedSixteenth).toBe(187.5);

		// Triplet variations
		expect(subdivisions.wholeTriplet).toBeCloseTo(1333.33, 1);
		expect(subdivisions.halfTriplet).toBeCloseTo(666.67, 1);
		expect(subdivisions.quarterTriplet).toBeCloseTo(333.33, 1);
		expect(subdivisions.eighthTriplet).toBeCloseTo(166.67, 1);
		expect(subdivisions.sixteenthTriplet).toBeCloseTo(83.33, 1);
	});

	it('calculates all subdivisions for 60 BPM', () => {
		const subdivisions = calculateAllSubdivisions(60);

		expect(subdivisions.quarter).toBe(1000);
		expect(subdivisions.eighth).toBe(500);
		expect(subdivisions.dottedQuarter).toBe(1500);
		expect(subdivisions.quarterTriplet).toBeCloseTo(666.67, 1);
	});

	it('returns an object with all expected properties', () => {
		const subdivisions = calculateAllSubdivisions(120);

		expect(subdivisions).toHaveProperty('whole');
		expect(subdivisions).toHaveProperty('half');
		expect(subdivisions).toHaveProperty('quarter');
		expect(subdivisions).toHaveProperty('eighth');
		expect(subdivisions).toHaveProperty('sixteenth');
		expect(subdivisions).toHaveProperty('thirtySecond');
		
		expect(subdivisions).toHaveProperty('dottedWhole');
		expect(subdivisions).toHaveProperty('dottedHalf');
		expect(subdivisions).toHaveProperty('dottedQuarter');
		expect(subdivisions).toHaveProperty('dottedEighth');
		expect(subdivisions).toHaveProperty('dottedSixteenth');
		
		expect(subdivisions).toHaveProperty('wholeTriplet');
		expect(subdivisions).toHaveProperty('halfTriplet');
		expect(subdivisions).toHaveProperty('quarterTriplet');
		expect(subdivisions).toHaveProperty('eighthTriplet');
		expect(subdivisions).toHaveProperty('sixteenthTriplet');
	});
});
